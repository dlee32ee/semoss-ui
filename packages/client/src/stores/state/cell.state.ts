import { makeAutoObservable, runInAction, toJS } from 'mobx';

import { setValueByPath } from '@/utility';

import { CellComponent, CellConfig, CellDef } from './state.types';
import { StateStore } from './state.store';
import { QueryState } from './query.state';
import { pixelConsole, pixelResult, runPixelAsync, download } from '@/api';

export interface CellStateStoreInterface<D extends CellDef = CellDef> {
    /** Id of the cell */
    id: string;

    /** Track if the cell is loading */
    isLoading: boolean;

    /** Track how long the cell took */
    executionDurationMilliseconds: number | undefined;

    /** Operation associated with the cell */
    operation: string[];

    /** Output associated with the cell */
    output: unknown | undefined;

    /** Prints and logs */
    messages: string[] | undefined;

    /** Widget to bind the cell to */
    widget: D['widget'];

    /** Parameters associated with the cell */
    parameters: D['parameters'];
}

export interface CellStateConfig<D extends CellDef = CellDef> {
    /** Id of the cell */
    id: string;

    /** Widget to bind the cell to */
    widget: D['widget'];

    /** Parameters associated with the cell */
    parameters: D['parameters'];
}

/**
 * Store that manages each cell in a query
 */
export class CellState<D extends CellDef = CellDef> {
    private _state: StateStore;
    private _query: QueryState;
    private _store: CellStateStoreInterface<D> = {
        id: '',
        isLoading: false,
        executionDurationMilliseconds: undefined,
        operation: [],
        output: undefined,
        messages: [],
        widget: '',
        parameters: {},
    };

    constructor(config: CellStateConfig, query: QueryState, state: StateStore) {
        // register the query + state
        this._query = query;
        this._state = state;

        // set the initial state information
        this._store.id = config.id;
        this._store.widget = config.widget;
        this._store.parameters = config.parameters;

        // make it observable
        makeAutoObservable(this);
    }

    /**
     * Getters
     */
    /**
     * Id of the cell
     */
    get id() {
        return this._store.id;
    }

    /**
     * Query associated with the cell
     */
    get query() {
        return this._query;
    }

    /**
     * Track if the cell is loading
     */
    get isLoading() {
        return this._store.isLoading;
    }

    /** Track how long the cell took */
    get executionDurationMilliseconds() {
        return this._store.executionDurationMilliseconds;
    }

    /**
     * Track if the cell has errored loading
     */
    get isError() {
        if (this._store.operation.indexOf('ERROR') > -1) {
            return true;
        }

        return false;
    }

    /**
     * Track if the cell was successfully run
     */
    get isSuccessful() {
        if (
            this._store.operation.length > 0 &&
            this._store.operation.indexOf('ERROR') === -1
        ) {
            return true;
        }

        return false;
    }

    /**
     * Track if the query is executed (there is an output or an error)
     */
    get isExecuted() {
        if (this._store.operation.length > 0) {
            return true;
        }

        return false;
    }

    /**
     * Get any errors associated with the cell
     */
    get error() {
        if (this.isError) {
            return this.output as string;
        }

        return '';
    }

    /**
     * Get the operation of the cell
     */
    get operation() {
        return this._store.operation;
    }

    /**
     * Get the output of the cell
     */
    get output() {
        return this._store.output;
    }

    /**
     * Get the messages of the cell
     */
    get messages() {
        return this._store.messages;
    }

    /**
     * Get the widget associated with the cell
     */
    get widget() {
        return this._store.widget;
    }

    /**
     * Get the component associated with the cell
     */
    get component(): CellComponent | null {
        if (this._state.cellRegistry[this._store.widget]) {
            return this._state.cellRegistry[this._store.widget].view;
        }

        return null;
    }

    /**
     * Get the config associated with the cell
     */
    get config(): CellConfig | null {
        if (this._state.cellRegistry[this._store.widget]) {
            return this._state.cellRegistry[this._store.widget];
        }

        return null;
    }

    /**
     * Get the parameters associated with the cell
     */
    get parameters() {
        return this._store.parameters;
    }

    /**
     * Actions
     */
    /**
     * Serialize to JSON
     */
    toJSON = (): CellStateConfig => {
        return {
            id: this._store.id,
            widget: this._store.widget,
            parameters: toJS(this._store.parameters),
        };
    };

    /**
     * Convert the parameters to pixel
     *
     * @param parameters - Convert the cell with these parameters
     */
    toPixel(
        parameters: Record<string, unknown> = this._store.parameters,
    ): string | string[] {
        const cellConfig = this.config;

        // use the toPixel from the cell
        if (cellConfig) {
            const pixelReturn = cellConfig.toPixel(parameters);
            return pixelReturn;
        }

        return Object.keys(parameters)
            .map((key) => {
                return `${key}=[${JSON.stringify(parameters[key])}]`;
            })
            .join(', ');
    }

    /**
     * Helpers
     */
    /**
     * Process State
     */
    /**
     * Process running of the cell
     */
    async _processRun() {
        const start = new Date();

        try {
            // check the loading state
            if (this._store.isLoading) {
                throw new Error('Cell is loading');
            }

            // start the loading screen
            this._store.isLoading = true;

            // convert the cells to the raw pixel
            const raw: string | string[] = this.toPixel();

            // Determine if multiple pixels need to be ran.
            if (typeof raw === 'string') {
                const { opType, output } = await this.runPixel(raw);

                runInAction(() => {
                    // store the operation and output
                    this._store.operation = opType;

                    // save the last output
                    this._store.output = output;
                });
            } else if (Array.isArray(raw)) {
                // Collect responses for each call to store in state.
                let opTypes = [];
                const outputs = [];

                for (const str of raw) {
                    const { opType, output } = await this.runPixel(str);
                    opTypes = [...opTypes, ...opType];
                    outputs.push(output);
                }

                runInAction(() => {
                    // store the operation and output
                    this._store.operation = opTypes;

                    // save the last output
                    this._store.output = outputs;
                });
            }
        } catch (e) {
            runInAction(() => {
                // store the operation and output
                this._store.operation = ['ERROR'];

                // save the last output
                this._store.output = e.message;
            });
        } finally {
            const end = new Date();

            this._store.executionDurationMilliseconds =
                end.getTime() - start.getTime();

            runInAction(() => {
                // stop the loading screen
                this._store.isLoading = false;
            });
        }
    }

    /**
     * Helper function for _processRun
     * @param rawPixel - pixel to be formatted and run
     */
    async runPixel(rawPixel: string) {
        // Gets rid of braces and evaluate parameters in query
        // const filled = this._state.flattenVar(raw);
        const filled = this._state.flattenVariable(rawPixel);

        // clear the previous messages + operation + output
        this._store.messages = [];
        this._store.operation = [];
        this._store.output = undefined;

        // start polling
        const { jobId } = await runPixelAsync(filled, this._state.insightId);

        // Set up polling in order to get full stdout
        let isPolling = true;
        while (isPolling) {
            try {
                // get the reponse from the job id
                const { messages, status } = await pixelConsole(jobId);

                // add the new messages
                runInAction(() => {
                    messages.forEach((mess) => {
                        this._store.messages.push(mess);
                    });
                });

                // Currently console does not get pass STREAMING
                if (status === 'Complete') {
                    isPolling = false;
                } else if (status === 'Streaming') {
                    isPolling = false;
                } else {
                    // poll
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error('Error during polling:', error.message);

                // turn it off
                isPolling = false;
            }
        }

        const { errors, results } = await pixelResult(jobId);

        if (errors.length > 0) {
            throw new Error(errors.join(''));
        }

        const last = results[results.length - 1];

        // set the output per operation
        let output: unknown;
        const opType: string[] = last.operationType;

        if (last.operationType.indexOf('CUSTOM_DATA_STRUCTURE') > -1) {
            output = last.output;
        } else if (last.operationType.indexOf('FORMATTED_DATA_SET') > -1) {
            output = last.output[0];
        } else if (last.operationType.indexOf('CODE_EXECUTION') > -1) {
            output = last.output[0].output;
        } else if (last.operationType.indexOf('CODE') > -1) {
            output = last.output[0].value[0];
        } else if (last.operationType.indexOf('ERROR') > -1) {
            output = last.output[0];
        } else if (last.operationType.indexOf('CONST_STRING') > -1) {
            output = last.output[0];
        } else if (last.operationType.indexOf('INVALID_SYNTAX') > -1) {
            output = last.output[0];
        } else if (last.operationType.indexOf('VECTOR') > -1) {
            output = last.output[0];
        } else {
            output = last.output;
        }

        if (opType.includes('FILE_DOWNLOAD')) {
            await download(this._state.insightId, output as string);
        }

        return { opType, output };
    }

    /**
     * Update the the store of the cell
     * @param path - path of the data to set
     * @param value - value of the data
     */
    _processUpdate(path: string | null, value: unknown) {
        if (!path) {
            // set the value
            this._store = value as CellStateStoreInterface<D>;
            return;
        }

        // update the parameters
        setValueByPath(this._store, path, value);
    }

    /**
     * Get the exposed value that can be accesed by a variable
     */
    get _exposed() {
        return {
            id: this._store.id,
            isExecuted: this.isExecuted,
            isLoading: this.isLoading,
            isError: this.isError,
            isSuccessful: this.isSuccessful,
            error: this.error,
            output: this.output,
            messages: this.messages,
            operation: this.operation,
        };
    }
}
