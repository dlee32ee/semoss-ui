import { makeAutoObservable, reaction, toJS } from 'mobx';

import {
    runPixel,
    runPixelAsync,
    pixelConsole,
    pixelResult,
    PixelResult,
    PixelConsoleResponse,
} from '@/api';
import { cancellablePromise, getValueByPath } from '@/utility';

import {
    ActionMessages,
    Actions,
    AddBlockAction,
    MoveBlockAction,
    RemoveBlockAction,
} from './state.actions';
import {
    Block,
    BlockJSON,
    CellTypeRegistry,
    ListenerActions,
    SerializedState,
} from './state.types';
import { QueryState, QueryStateConfig } from './query.state';
import { CellStateConfig } from './cell.state';

interface StateStoreInterface {
    /** Mode */
    mode: 'interactive' | 'static';

    /** insightID to load */
    insightId: string;

    /** Queries rendered in the insight */
    queries: Record<string, QueryState>;

    /** Blocks rendered in the insight */
    blocks: Record<string, Block>;

    /** Cells registered to the insight */
    cellTypeRegistry: CellTypeRegistry;
}

export class StateStoreConfig {
    /** Mode */
    mode: 'interactive' | 'static';

    /** insightID to load */
    insightId: string;

    /** State to load into the store */
    state: SerializedState;

    /** Cells registered to the insight */
    cellTypeRegistry: CellTypeRegistry;
}

/**
 * Hold the state information for the insight
 */
export class StateStore {
    private _store: StateStoreInterface = {
        mode: 'interactive',
        insightId: '',
        queries: {},
        blocks: {},
        cellTypeRegistry: {},
    };

    /**
     * Utility variables
     */
    private _utils: {
        /**
         * Track any executing queries
         */
        queryPromises: Record<
            string,
            ReturnType<typeof cancellablePromise> | null
        >;
    } = {
        queryPromises: {},
    };

    constructor(config: StateStoreConfig) {
        // save the connected insight
        this._store.insightId = config.insightId;

        // register the cells
        this._store.cellTypeRegistry = config.cellTypeRegistry || {};

        // make it observable
        makeAutoObservable(this);

        // auto update when a query or mode changes
        reaction(
            () => {
                return Object.keys(this._store.queries).reduce<
                    Record<string, string>
                >((acc, val) => {
                    const q = this._store.queries[val];

                    // map id -> actual
                    acc[q.id] = `${this.flattenVariable(q.toPixel())}--${
                        q.mode
                    }`;

                    return acc;
                }, {});
            },
            (curr, prev) => {
                for (const id in curr) {
                    // get the query
                    const q = this._store.queries[id];

                    // if they are the same ignore
                    if (!q || curr[id] === prev[id]) {
                        continue;
                    }

                    // ignore if not automatic
                    if (q.mode !== 'automatic') {
                        continue;
                    }

                    // run the query
                    this.runQuery(id);
                }
            },
        );

        // set the initial state after reactive to invoke it
        this.setState(config.state);
    }

    /**
     * Getters
     */
    /**
     * Get the mode
     * @returns the mode
     */
    get mode() {
        return this._store.mode;
    }

    /**
     * Get the Insight ID
     * @returns the Insight ID
     */
    get insightId() {
        return this._store.insightId;
    }

    /**
     * Get the blocks
     * @returns the blocks
     */
    get blocks() {
        return this._store.blocks;
    }

    /**
     * Get the queries
     * @returns the queries
     */
    get queries() {
        return this._store.queries;
    }

    /**
     * Get the cell type registry
     * @returns the cell type registry
     */
    get cellTypeRegistry() {
        return this._store.cellTypeRegistry;
    }

    /**
     * Get the specific block information
     * @param id - id of the block to get
     * @returns the specific block information
     */
    getBlock(id: string) {
        if (this._store.blocks[id]) {
            return this._store.blocks[id];
        }

        return null;
    }

    /**
     * Get a specific queries's state
     * @param id - id of the queries to get
     * @returns the specific block information
     */
    getQuery(id: string): QueryState | null {
        if (this._store.queries[id]) {
            return this._store.queries[id];
        }

        return null;
    }

    /**
     * Actions
     */
    /**
     * Dispatch a message to update the state
     *
     * @param action - Action to execute
     */
    dispatch = (action: Actions) => {
        // TODO: Develop History + Invert + UNDO;
        console.log(
            'ACTION :::',
            JSON.parse(JSON.stringify(action.message)),
            JSON.parse(JSON.stringify(action.payload)),
        );

        try {
            // apply the action
            if (ActionMessages.SET_STATE === action.message) {
                const { state } = action.payload;

                this.setState(state);
            } else if (ActionMessages.ADD_BLOCK === action.message) {
                const { json, position } = action.payload;

                return this.addBlock(json, position);
            } else if (ActionMessages.MOVE_BLOCK === action.message) {
                const { id, position } = action.payload;

                this.moveBlock(id, position);
            } else if (ActionMessages.REMOVE_BLOCK === action.message) {
                const { id, keep } = action.payload;

                this.removeBlock(id, keep);
            } else if (ActionMessages.SET_BLOCK_DATA === action.message) {
                const { id, path, value } = action.payload;

                this.setBlockData(id, path, value);
            } else if (ActionMessages.DELETE_BLOCK_DATA === action.message) {
                const { id, path } = action.payload;

                this.deleteBlockData(id, path);
            } else if (ActionMessages.SET_LISTENER === action.message) {
                const { id, listener, actions } = action.payload;

                this.setListener(id, listener, actions);
            } else if (ActionMessages.NEW_QUERY === action.message) {
                const { queryId, config } = action.payload;

                this.newQuery(queryId, config);
            } else if (ActionMessages.DELETE_QUERY === action.message) {
                const { queryId } = action.payload;

                this.deleteQuery(queryId);
            } else if (ActionMessages.UPDATE_QUERY === action.message) {
                const { queryId, path, value } = action.payload;

                this.updateQuery(queryId, path, value);
            } else if (ActionMessages.RUN_QUERY === action.message) {
                const { queryId } = action.payload;

                this.runQuery(queryId);
            } else if (ActionMessages.NEW_CELL === action.message) {
                const { queryId, cellId, config, previousCellId } =
                    action.payload;

                this.newCell(queryId, cellId, config, previousCellId);
            } else if (ActionMessages.DELETE_CELL === action.message) {
                const { queryId, cellId } = action.payload;

                this.deleteCell(queryId, cellId);
            } else if (ActionMessages.UPDATE_CELL === action.message) {
                const { queryId, cellId, path, value } = action.payload;

                this.updateCell(queryId, cellId, path, value);
            } else if (ActionMessages.RUN_CELL === action.message) {
                const { queryId, cellId } = action.payload;

                this.runCell(queryId, cellId);
            } else if (ActionMessages.DISPATCH_EVENT === action.message) {
                const { name, detail } = action.payload;

                this.dispatchEvent(name, detail);
            }
        } catch (e) {
            console.error(e);
        }
    };

    /** Variable Methods */
    /**
     * Parse a variable and return the value if it exists (otherwise return the expression)
     */
    parseVariable = (expression: string): unknown => {
        // trim the whitespace
        let cleaned = expression.trim();
        if (!cleaned.startsWith('{{') && !cleaned.endsWith('}}')) {
            return expression;
        }

        // remove the brackets
        cleaned = cleaned.slice(2, -2);

        // get the keys in the path
        const path = cleaned.split('.');

        if (path[0] === 'query' && path[2] === 'cell') {
            // check if the id is there
            const queryId = path[1];
            const cellId = path[3];

            // get the query
            const query = this._store.queries[queryId];
            const cell = query ? query.getCell(cellId) : null;
            if (cell) {
                // if the key is a cell, calculate as a cell
                const key = path[4];
                if (key in cell._exposed) {
                    // get the search path
                    const s = path.slice(4).join('.');
                    return getValueByPath(cell._exposed, s);
                }
            }
        } else if (path[0] === 'query' && path[2] !== 'cell') {
            // check if the id is there
            const queryId = path[1];

            // get the attribute key
            const key = path[2];

            // get the query
            const query = this._store.queries[queryId];
            if (query) {
                if (key in query._exposed) {
                    // get the search path
                    const s = path.slice(2).join('.');
                    return getValueByPath(query._exposed, s);
                }
            }
        } else if (path[0] === 'block') {
            // check if the id is there
            const blockId = path[1];

            // get the block
            const block = this._store.blocks[blockId];
            if (block) {
                // get the search path
                const s = path.slice(2).join('.');
                return getValueByPath(block.data, s);
            }
        }

        return expression;
    };

    /**
     * Flatten a string containing multiple variables
     * @param expression - expression to flatten
     * @returns the flatten parameter
     */
    flattenVariable = (expression: string): string => {
        return expression.replace(/{{(.*?)}}/g, (match) => {
            // try to extract the variable
            const v = this.parseVariable(match);

            // if it is not a string, convert to a string
            if (typeof v !== 'string') {
                return JSON.stringify(v);
            }

            return v;
        });
    };

    /**
     * Serialize to JSON
     */
    toJSON(): SerializedState {
        return {
            queries: Object.keys(this._store.queries).reduce((acc, val) => {
                acc[val] = this._store.queries[val].toJSON();
                return acc;
            }, {} as SerializedState['queries']),
            blocks: toJS(this._store.blocks),
        };
    }

    /**
     * Internal
     */
    /**
     * Helpers
     */
    /**
     * Generate a new block from the json
     * @param json - json of the block that we are generating
     * @returns block
     */
    private generateBlock = (json: BlockJSON) => {
        // generate a new id
        const id = `${json.widget}--${Math.floor(Math.random() * 10000)}`;

        // create the block
        const block = {
            id: id,
            widget: json.widget,
            parent: null,
            data: {},
            listeners: {},
            slots: {},
        } as Block;

        // add the data
        block.data = json.data;

        // add the listeners
        block.listeners = json.listeners;

        // generate the slots
        for (const slot in json.slots) {
            if (json.slots[slot]) {
                block.slots[slot] = {
                    name: slot,
                    children: json.slots[slot].map((child) => {
                        // build the children, but only store the ids
                        const b = this.generateBlock(child);

                        return b.id;
                    }),
                };
            }
        }

        // register it
        this._store.blocks[id] = block;

        // return it
        return block;
    };

    /**
     * Check if a parent contains the child block
     * @param parent - id of the parent block
     * @param child - id of the child block
     * @returns true if the child is in the parent
     */
    containsBlock = (parent: string, child: string): boolean => {
        const queue = [parent];
        while (queue.length) {
            const current = queue.shift() as string;

            if (current === child) {
                return true;
            }

            // check if the block exists
            const block = this._store.blocks[current];

            // validate the children
            for (const s in block.slots) {
                queue.push(...block.slots[s].children);
            }
        }

        return false;
    };

    /**
     * Attach a block to the parent block's slot. At this point, we assume that everything can be attached correctly.
     * @param parent - id of the block that we are attaching to
     * @param slot - slot that we are attaching to
     * @param index - children index where we are attaching
     * @param id - id of the block that we are attaching
     */
    private attachBlock = (
        parent: string,
        slot: string,
        index: number,
        id: string,
    ) => {
        const parentBlock = this._store.blocks[parent];

        // if the slot is not valid, we cannot attach
        if (!parentBlock.slots[slot]) {
            return;
        }

        // if it is is already there, we cannot attach
        if (parentBlock.slots[slot].children.indexOf(id) !== -1) {
            return;
        }

        // get the block
        const block = this._store.blocks[id];

        // insert it
        parentBlock.slots[slot].children.splice(index, 0, id);

        // update the child block
        block.parent = {
            id: parent,
            slot: slot,
        };

        return;
    };

    /**
     * Detach a block from the current parent. At this point, we assume that everything can be detached correctly.
     * @param id - id of the block that we are detaching
     */
    private detachBlock = (id: string) => {
        const block = this._store.blocks[id];

        // if there is no parent, there is no need to detach
        if (!block.parent) {
            return;
        }

        // get the parent
        const parentBlock = this._store.blocks[block.parent.id];

        // validate that the slot and index are correct
        const parentSlot = parentBlock.slots[block.parent.slot];
        if (!parentSlot) {
            return;
        }

        //
        const blockIdx = parentSlot.children.indexOf(id);
        if (blockIdx === -1) {
            return;
        }

        // remove it from the parent
        parentSlot.children.splice(blockIdx, 1);

        // update the child
        block.parent = null;
    };

    /**
     * Actions
     */
    /**
     * Set the state information
     *
     * @param state - pixel to execute
     */
    private setState = (state: SerializedState) => {
        // store the block information
        this._store.blocks = state.blocks;

        // load the queries
        this._store.queries = Object.keys(state.queries).reduce((acc, val) => {
            acc[val] = new QueryState(state.queries[val], this);
            return acc;
        }, {});
    };

    /**
     * Create a block and add it to the tree
     * @param json - json of the block that we are adding
     * @param position - where is the block going
     * @returns id of new block
     */
    private addBlock = (
        json: BlockJSON,
        position?: AddBlockAction['payload']['position'],
    ): string => {
        // generate the block
        const block = this.generateBlock(json);

        // try to place it if position
        if (!position) {
            return;
        }

        const { parent, slot } = position;

        // get the parent
        const parentBlock = this._store.blocks[parent];

        if ('sibling' in position) {
            const { sibling, type } = position;

            // get the index of the sibling (it might have changed)
            const siblingIdx =
                parentBlock.slots[slot].children.indexOf(sibling);

            if (type === 'before') {
                // attach the block before
                this.attachBlock(parent, slot, siblingIdx, block.id);
            } else if (type === 'after') {
                // attach the block after
                this.attachBlock(parent, slot, siblingIdx + 1, block.id);
            }
        } else {
            // attach the block
            this.attachBlock(
                parent,
                slot,
                parentBlock.slots[slot].children.length,
                block.id,
            );
        }
        return block.id;
    };

    /**
     * Move a block in the tree
     * @param id - id of the child block that we are moving
     * @param position - where is the block going
     */
    private moveBlock = (
        id: string,
        position: MoveBlockAction['payload']['position'],
    ): void => {
        if (!position) {
            // detach the current block (this might not always be possible)
            this.detachBlock(id);
            return;
        }

        // if there is a parent see if you can detach
        const { parent, slot } = position;

        // if the parent block is a child of the moved block, we cannot move
        if (this.containsBlock(id, parent)) {
            return;
        }

        // get the parent
        const parentBlock = this._store.blocks[parent];

        // detach the current block (this might not always be possible)
        this.detachBlock(id);

        if ('sibling' in position) {
            const { sibling, type } = position;

            // get the index of the sibling (it might have changed)
            const siblingIdx =
                parentBlock.slots[slot].children.indexOf(sibling);

            if (type === 'before') {
                // attach the block before
                this.attachBlock(parent, slot, siblingIdx, id);
            } else if (type === 'after') {
                // attach the block after
                this.attachBlock(parent, slot, siblingIdx + 1, id);
            }
        } else {
            // attach the block
            this.attachBlock(
                parent,
                slot,
                parentBlock.slots[slot].children.length,
                id,
            );
        }
    };

    /**
     * Remove the block from the tree
     * @param id - id of the block that we are removing
     * @param keep - keep the block
     */
    private removeBlock = (
        id: string,
        keep: RemoveBlockAction['payload']['keep'],
    ): void => {
        // get the block
        const block = this._store.blocks[id];

        // remove the children
        for (const slot in block.slots) {
            const { children } = block.slots[slot];
            // use copy of children so we can detach without breaking loop
            for (const c of [...children]) {
                this.removeBlock(c, false);
            }
        }

        // detach the current block (this might not always be possible)
        this.detachBlock(id);

        // delete it
        if (!keep) {
            delete this._store.blocks[id];
        }
    };

    /**
     * Set a block's data
     * @param id - id of the block
     * @param path - path of the data to set
     * @param value - value of the data
     */
    private setBlockData = (
        id: string,
        path: string | null,
        value: unknown,
    ): void => {
        if (!path) {
            // set the value
            this._store.blocks[id].data = value as Record<string, unknown>;
            return;
        }

        // get the keys
        const p = path.split('.');

        // get the last key. If there is none, set the block data
        const last = p.pop();
        if (!last) {
            return;
        }

        // traverse to the correct element
        let current = this._store.blocks[id].data as Record<string, unknown>;
        while (p.length) {
            const key = p.shift();

            if (!key) {
                return;
            }

            // create the object if the key doesn't exist. This will allow us to have partials.
            // TODO Generate with default?
            if (!current[key]) {
                current[key] = {};
            }

            current = current[key] as Record<string, unknown>;
        }

        // set the value
        current[last] = value;
    };

    /**
     * Delete a block's data
     * @param id - id of the block
     * @param path - path of the data to delete
     */
    private deleteBlockData = (id: string, path: string | null): void => {
        if (!path) {
            // clear the data
            this._store.blocks[id].data = {};

            return;
        }

        // get the keys
        const p = path.split('.');

        // get the last key
        const last = p.pop();
        if (!last) {
            return;
        }

        // traverse to the correct element
        let current = this._store.blocks[id].data as Record<string, unknown>;
        while (p.length) {
            const key = p.shift();

            if (!key || !current) {
                return;
            }

            current = current[key] as Record<string, unknown>;
        }

        // delete the value
        delete current[last];
    };

    /**
     * Set a listener on a block
     * @param id - id of the block
     * @param listener - listener to add to the block
     * @param actions - actions to add to the block
     */
    private setListener = (
        id: string,
        listener: string,
        actions: ListenerActions[],
    ): void => {
        this._store.blocks[id].listeners[listener] = actions;
    };

    /**
     * Create a new query
     * @param queryId - name of the query that we are setting
     */
    private newQuery = (
        queryId: string,
        config: Omit<QueryStateConfig, 'id'>,
    ): void => {
        this._store.queries[queryId] = new QueryState(
            {
                ...config,
                id: queryId,
            },
            this,
        );

        if (!config.cells.length) {
            const newCellId = `${Math.floor(Math.random() * 100000)}`;

            this.newCell(
                queryId,
                newCellId,
                {
                    parameters: {
                        code: '',
                        type: 'pixel',
                    },
                    widget: 'code',
                } as Omit<CellStateConfig, 'id'>,
                '',
            );
        }
    };

    /**
     * Delete a query
     * @param queryId - name of the query that we are deleting
     */
    private deleteQuery = (queryId: string): void => {
        delete this._store.queries[queryId];
    };

    /**
     * Update the store in the query
     * @param queryId - id of the updated query
     * @param path - path of the data to set
     * @param value - value of the data
     */
    private updateQuery = (
        queryId: string,
        path: string | null,
        value: unknown,
    ): void => {
        const q = this._store.queries[queryId];

        // set the value
        q._processUpdate(path, value);
    };

    /**
     * Run a query
     * @param queryId - name of the query that we are running
     */
    private runQuery = (queryId: string): void => {
        const q = this._store.queries[queryId];

        const key = `query--${queryId};`;

        // cancel a previous command
        this._utils.queryPromises[key]?.cancel();

        // setup the promise
        const p = cancellablePromise(async () => {
            // run the query
            await q._processRun();

            // turn it off
            return true;
        });

        p.promise
            .then(() => {
                // noop
            })
            .catch((e) => {
                console.error('ERROR:', e);
            });

        // save the promise
        this._utils.queryPromises[key] = p;
    };

    /**
     * Create a new cell
     * @param queryId - id of the updated query
     * @param cellId - id of the new cell
     * @param config - config of the
     * @param previousCellId: id of the previous cell,
     */
    private newCell = (
        queryId: string,
        cellId: string,
        config: Omit<CellStateConfig, 'id'>,
        previousCellId: string,
    ): void => {
        // get the query
        const q = this._store.queries[queryId];

        // add the cell
        q._processNewCell(cellId, config, previousCellId);
    };

    /**
     * Delete a cell
     * @param queryId - id of the updated query
     * @param cellId - id of the deleted cell
     */
    private deleteCell = (queryId: string, cellId: string): void => {
        // get the query
        const q = this._store.queries[queryId];

        // add the cell
        q._processDeleteCell(cellId);

        // always have at least one cell
        if (q.list.length === 0) {
            const newCellId = `${Math.floor(Math.random() * 100000)}`;

            this.newCell(
                queryId,
                newCellId,
                {
                    parameters: {
                        code: '',
                        type: 'pixel',
                    },
                    widget: 'code',
                } as Omit<CellStateConfig, 'id'>,
                '',
            );
        }
    };

    /**
     * Update the store in the cell
     * @param queryId - id of the updated query
     * @param cellId - id of the updated cell
     * @param path - path of the data to set
     * @param value - value of the data
     */
    private updateCell = (
        queryId: string,
        cellId: string,
        path: string | null,
        value: unknown,
    ): void => {
        const q = this._store.queries[queryId];
        const s = q.getCell(cellId);

        // set the value
        s._processUpdate(path, value);
    };

    /**
     * Run the cell
     * @param queryId - id of the updated query
     * @param cellId - id of the deleted cell
     */
    private runCell = (queryId: string, cellId: string): void => {
        const q = this._store.queries[queryId];
        const s = q.getCell(cellId);

        const key = `cell--${cellId} (query--${queryId});`;

        // cancel a previous command
        this._utils.queryPromises[key]?.cancel();

        // setup the promise
        const p = cancellablePromise(async () => {
            // run the cell
            await s._processRun();

            // turn it off
            return true;
        });

        p.promise
            .then(() => {
                // noop
            })
            .catch((e) => {
                console.error('ERROR:', e);
            });

        // save the promise
        this._utils.queryPromises[key] = p;
    };

    /**
     * Dispatch a custom event
     * @param name - name of the event
     * @param detail - payload associated with event
     */
    private dispatchEvent = (
        name: string,
        detail: Record<string, unknown> = {},
    ): void => {
        const event = new CustomEvent(name, {
            detail: detail,
        });

        // dispatch the event to the window
        window.dispatchEvent(event);
    };

    /**
     * Run a pixel string
     *
     * @param pixel - pixel to execute
     */
    async _runPixel<O extends unknown[] | []>(pixel: string) {
        return await runPixel<O>(pixel, this._store.insightId);
    }

    // Call Query Cells Independently --------------------------------
    async _runPixelAsync(pixel): Promise<{
        jobId: string;
        results: PixelResult[];
        messages: string[];
        status: string;
    }> {
        const { jobId } = await runPixelAsync(pixel, this._store.insightId);

        if (!jobId) {
            throw new Error('No Job Id to get console/results');
        }

        const { messages, status } = await pixelConsole(jobId);

        const { results } = await pixelResult(jobId);

        return {
            jobId: jobId,
            results: results,
            messages: messages,
            status: status,
        };
    }
}
