import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { computed } from 'mobx';
import {
    styled,
    Button,
    Divider,
    Menu,
    MenuProps,
    Stack,
    Typography,
    Modal,
    Select,
} from '@semoss/ui';

import { useBlocks, usePixel, useRootStore } from '@/hooks';
import {
    ActionMessages,
    CellStateConfig,
    NewCellAction,
    QueryState,
} from '@/stores';
import {
    AccountTree,
    Add,
    Functions,
    ChangeCircleOutlined,
    Storage,
    Code,
    ImportExport,
    TextFields,
    KeyboardArrowUp,
    KeyboardArrowDown,
    TableRows,
    Label,
    JoinLeftRounded,
    FilterListRounded,
    ControlPointDuplicateRounded,
} from '@mui/icons-material';
import {
    DefaultCellDefinitions,
    DefaultCells,
    TransformationCells,
    // ImportDataCells, // need options for Import Data dropdown options
} from '@/components/cell-defaults';
import { QueryImportCellConfig } from '../cell-defaults/query-import-cell';
import { CodeCellConfig } from '../cell-defaults/code-cell';
import { useFieldArray, useForm, Form, Controller } from 'react-hook-form';

import { LoadingScreen } from '@/components/ui';

const StyledModalTitle = styled(Typography)(({ theme }) => ({
    alignContent: 'center',
    marginRight: '15px',
}));

const StyledModalTitleWrapper = styled(Modal.Title)(({ theme }) => ({
    display: 'flex',
    alignContent: 'center',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    color: theme.palette.text.secondary,
    backgroundColor: 'unset!important',
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
    flexGrow: 1,
}));

const StyledMenu = styled((props: MenuProps) => (
    <Menu
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        marginTop: theme.spacing(1),
    },
    '.MuiList-root': {
        padding: 0,
    },
}));

const StyledMenuItem = styled(Menu.Item)(() => ({
    textTransform: 'capitalize',
}));

const StyledBorderDiv = styled('div')(({ theme }) => ({
    border: `1px solid ${theme.palette.secondary.main}`,
    padding: '8px 16px',
    borderRadius: '8px',
}));

interface AddCellOption {
    display: string;
    icon: React.ReactNode;
    defaultCellType?: DefaultCellDefinitions['widget'];
    options?: {
        display: string;
        defaultCellType: DefaultCellDefinitions['widget'];
    }[];
    disabled?: boolean;
}

type QueryChildElement = {
    childElementName: string;
};

type QueryStackElement = {
    queryType: string; // Data, Join or Filter
    queryChildren: QueryChildElement[];
};

type FormValues = {
    queryStackElements: QueryStackElement[];
    databaseSelect: string;
    tableSelect: string;
};

const Transformations = Array.from(Object.values(TransformationCells)).map(
    (item) => {
        return {
            display: item.name,
            defaultCellType: item.widget,
        };
    },
);

const DataImportDropdownOptions = [
    {
        display: `From Data Catalog`,
        defaultCellType: null,
    },
    {
        display: `From CSV`,
        defaultCellType: null,
    },
];

// const DataImportDropdownOptions = Array.from(Object.values(TransformationCells)).map(
//     (item) => {
//         return {
//             display: `Test ${item.name}`,
//             defaultCellType: item.widget,
//         };
//     },
// );

const AddCellOptions: Record<string, AddCellOption> = {
    code: {
        display: 'Cell',
        defaultCellType: 'code',
        icon: <Code />,
    },
    'query-import': {
        display: 'Query Import',
        defaultCellType: 'query-import',
        // no DB MUI icon using the icon path from main menu
        icon: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
            >
                <g clipPath="url(#clip0_2378_103062)">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 3C7.58 3 4 4.79 4 7V17C4 19.21 7.59 21 12 21C16.41 21 20 19.21 20 17V7C20 4.79 16.42 3 12 3ZM18 17C18 17.5 15.87 19 12 19C8.13 19 6 17.5 6 17V14.77C7.61 15.55 9.72 16 12 16C14.28 16 16.39 15.55 18 14.77V17ZM18 12.45C16.7 13.4 14.42 14 12 14C9.58 14 7.3 13.4 6 12.45V9.64C7.47 10.47 9.61 11 12 11C14.39 11 16.53 10.47 18 9.64V12.45ZM12 9C8.13 9 6 7.5 6 7C6 6.5 8.13 5 12 5C15.87 5 18 6.5 18 7C18 7.5 15.87 9 12 9Z"
                        fill="#666666"
                    ></path>
                </g>
                <defs>
                    <clipPath id="clip0_2378_103062">
                        <rect width="24" height="24" fill="#666666"></rect>
                    </clipPath>
                </defs>
            </svg>
        ),
    },
    transformation: {
        display: 'Transformation',
        icon: <ChangeCircleOutlined />,
        options: Transformations,
    },
    'import-data': {
        display: 'Import Data',
        icon: <ImportExport />,
        options: DataImportDropdownOptions,
        disabled: false,
    },
    text: {
        display: 'Text',
        // defaultCellType: 'text', // text type currently doesn't exist
        icon: <TextFields />,
        disabled: true,
    },
};

export const NotebookAddCell = observer(
    (props: { query: QueryState; previousCellId?: string }): JSX.Element => {
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
        const [selectedAddCell, setSelectedAddCell] = useState<string>('');

        const [importModalType, setImportModalType] = useState<string>('');
        const [tableNames, setTableNames] = useState<string[]>([]);
        const [isDataImportModalOpen, setIsDataImportModalOpen] =
            useState<boolean>(false);
        const open = Boolean(anchorEl);

        const { query, previousCellId = '' } = props;
        const { state, notebook } = useBlocks();

        const { control, handleSubmit, reset, watch, setValue, getValues } =
            useForm<FormValues>({
                defaultValues: {
                    queryStackElements: [],
                    databaseSelect: '',
                    tableSelect: '',
                },
            });

        const [userDatabases, setUserDatabases] = useState(null);
        const [queryElementCounter, setQueryElementCounter] = useState(0);

        const getDatabases = usePixel('META | GetDatabaseList ( ) ;');
        const [isDatabaseLoading, setIsDatabaseLoading] =
            useState<boolean>(false);
        const [showEditColumns, setShowEditColumns] = useState<boolean>(false);
        const [showTablePreview, setShowTablePreview] =
            useState<boolean>(false);
        const { configStore, monolithStore } = useRootStore();

        const {
            fields: stackFields,
            append: appendStack,
            remove: removeStack,
        } = useFieldArray({
            control,
            name: 'queryStackElements',
        });

        useEffect(() => {
            if (getDatabases.status !== 'SUCCESS') {
                return;
            }
            setUserDatabases(getDatabases.data);
        }, [getDatabases.status, getDatabases.data]);

        // const cellTypeOptions = computed(() => {
        //     const options = { ...AddCellOptions };
        //     // transformation cell types can only be added if there exists a query-import cell before it
        //     if (!previousCellId) {
        //         delete options['transformation'];
        //     } else {
        //         const previousCellIndex = query.list.indexOf(previousCellId);
        //         let hasFrameVariable = false;
        //         for (let index = 0; index <= previousCellIndex; index++) {
        //             if (
        //                 query.cells[query.list[index]].config.widget ===
        //                 'query-import'
        //             ) {
        //                 hasFrameVariable = true;
        //                 break;
        //             }
        //         }
        //         if (!hasFrameVariable) {
        //             delete options['transformation'];
        //         }
        //     }

        //     return Object.values(options);
        // }).get();

        /**
         * Create a new cell
         */
        const appendCell = (widget: string) => {
            try {
                const newCellId = `${Math.floor(Math.random() * 100000)}`;

                const config: NewCellAction['payload']['config'] = {
                    widget: DefaultCells[widget].widget,
                    parameters: DefaultCells[widget].parameters,
                };

                if (widget === QueryImportCellConfig.widget) {
                    config.parameters = {
                        ...DefaultCells[widget].parameters,
                        frameVariableName: `FRAME_${newCellId}`,
                    };
                }

                if (
                    previousCellId &&
                    state.queries[query.id].cells[previousCellId].widget ===
                        widget &&
                    widget === CodeCellConfig.widget
                ) {
                    const previousCellType =
                        state.queries[query.id].cells[previousCellId].parameters
                            ?.type ?? 'pixel';
                    config.parameters = {
                        ...DefaultCells[widget].parameters,
                        type: previousCellType,
                    };
                }

                // copy and add the step
                state.dispatch({
                    message: ActionMessages.NEW_CELL,
                    payload: {
                        queryId: query.id,
                        cellId: newCellId,
                        previousCellId: previousCellId,
                        config: config as Omit<CellStateConfig, 'id'>,
                    },
                });
                notebook.selectCell(query.id, newCellId);
            } catch (e) {
                console.error(e);
            }
        };

        const onSubmit = (submitData) => {
            console.log({ submitData });
        };

        const retrieveDatabaseTables = async (databaseId) => {
            setIsDatabaseLoading(true);
            const pixelString = `META | GetDatabaseTableStructure ( database = [ \"${databaseId}\" ] ) ;`;

            monolithStore.runQuery(pixelString).then((response) => {
                const type = response.pixelReturn[0].operationType;
                const pixelResponse = response.pixelReturn[0].output;

                if (type.indexOf('ERROR') === -1) {
                    const tableNames = [
                        ...pixelResponse.reduce((set, ele) => {
                            set.add(ele[0]);
                            return set;
                        }, new Set()),
                    ];
                    setTableNames(tableNames);
                } else {
                    console.error('Error retrieving database tables');
                }

                setIsDatabaseLoading(false);
            });
        };

        return (
            <Stack direction={'row'} alignItems={'center'} gap={1}>
                <StyledDivider />
                <StyledBorderDiv>
                    {Object.entries(AddCellOptions).map((add, i) => {
                        const value = add[1];
                        console.log({ i, add });
                        return (
                            <StyledButton
                                key={i}
                                title={`${value.display}`}
                                variant="contained"
                                size="small"
                                disabled={query.isLoading || value.disabled}
                                startIcon={value.icon}
                                onClick={(e) => {
                                    if (value.options) {
                                        setAnchorEl(e.currentTarget);
                                        setSelectedAddCell(add[0]);
                                    } else {
                                        appendCell(value.defaultCellType);
                                    }
                                }}
                                endIcon={
                                    Array.isArray(value.options) &&
                                    (selectedAddCell == add[0] && open ? (
                                        <KeyboardArrowDown />
                                    ) : (
                                        <KeyboardArrowUp />
                                    ))
                                }
                            >
                                {value.display}
                            </StyledButton>
                        );
                    })}
                </StyledBorderDiv>
                <StyledDivider />
                <StyledMenu
                    anchorEl={anchorEl}
                    open={
                        open &&
                        !!AddCellOptions[selectedAddCell]?.options?.length
                    }
                    onClose={() => {
                        setAnchorEl(null);
                    }}
                >
                    {selectedAddCell === 'transformation' &&
                        Array.from(
                            AddCellOptions[selectedAddCell]?.options || [],
                            ({ display, defaultCellType }, index) => {
                                return (
                                    <StyledMenuItem
                                        key={index}
                                        value={display}
                                        onClick={() => {
                                            appendCell(defaultCellType);
                                            setAnchorEl(null);
                                        }}
                                    >
                                        {display}
                                    </StyledMenuItem>
                                );
                            },
                        )}

                    {selectedAddCell === 'import-data' && (
                        <>
                            {Array.from(
                                AddCellOptions[selectedAddCell]?.options || [],
                                ({ display }, index) => {
                                    return (
                                        <StyledMenuItem
                                            key={index}
                                            value={display}
                                            disabled={display == 'From CSV'} // temporary
                                            onClick={() => {
                                                setIsDataImportModalOpen(true);
                                                if (
                                                    display ==
                                                    'From Data Catalog'
                                                ) {
                                                    setImportModalType(display);
                                                } else {
                                                    // open seperate modal / form for From CSV
                                                }
                                                setAnchorEl(null);
                                            }}
                                        >
                                            {display}
                                        </StyledMenuItem>
                                    );
                                },
                            )}
                        </>
                    )}
                </StyledMenu>

                {/* Import Data Modal */}
                <Modal open={isDataImportModalOpen} fullWidth>
                    {isDatabaseLoading && (
                        <LoadingScreen.Trigger description="Retrieving database" />
                    )}
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        style={{ border: '1px solid red', margin: '30px 41px' }}
                    >
                        <StyledModalTitleWrapper
                            sx={{ border: '1px solid blue', padding: '0px' }}
                        >
                            <StyledModalTitle
                                variant="h6"
                                sx={{ border: '1px solid orange' }}
                            >
                                Import Data
                            </StyledModalTitle>
                            <Controller
                                name={'databaseSelect'}
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onChange={(e) => {
                                            field.onChange(e.target.value);
                                            retrieveDatabaseTables(
                                                e.target.value,
                                            );
                                        }}
                                        label={'Select Database...'}
                                        value={field.value || null}
                                        size={'small'}
                                        sx={{
                                            minWidth: '220px',
                                        }}
                                    >
                                        {userDatabases?.map((ele) => (
                                            <Menu.Item value={ele.database_id}>
                                                {ele.app_name}
                                            </Menu.Item>
                                        ))}
                                    </Select>
                                )}
                            />
                        </StyledModalTitleWrapper>
                        <Modal.Content
                            sx={{ border: '1px solid green', padding: '0px' }}
                        >
                            {!!tableNames.length && (
                                <Stack
                                    spacing={1}
                                    direction="column"
                                    sx={{
                                        backgroundColor: '#FAFAFA',
                                        padding: '16px',
                                    }}
                                >
                                    <Typography variant="h6">Data:</Typography>
                                    <Controller
                                        name={'tableSelect'}
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onChange={(e) => {
                                                    field.onChange(
                                                        e.target.value,
                                                    );
                                                }}
                                                label={'Select Table...'}
                                                value={field.value}
                                                size={'small'}
                                                color="primary"
                                                disabled={!tableNames.length}
                                            >
                                                {tableNames?.map((ele) => (
                                                    <Menu.Item value={ele}>
                                                        {ele}
                                                    </Menu.Item>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <Button
                                        variant="text"
                                        color="primary"
                                        size="small"
                                        onClick={() => {
                                            setShowEditColumns(
                                                !showEditColumns,
                                            );
                                            setShowTablePreview(false);
                                        }}
                                    >
                                        Edit Columns
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => {
                                            setShowTablePreview(
                                                !showTablePreview,
                                            );
                                            setShowEditColumns(false);
                                        }}
                                    >
                                        Preview
                                    </Button>

                                    {showEditColumns && (
                                        <div>
                                            <b>Edit Columns</b>
                                        </div>
                                    )}

                                    {showTablePreview && (
                                        <div>
                                            <b>Preview</b>
                                        </div>
                                    )}
                                </Stack>
                            )}
                            {stackFields.map((stack, stackIndex) => (
                                <Stack spacing={1} direction="column">
                                    <span>{stack.queryType}</span>
                                    <Button
                                        sx={{
                                            display: 'inline-block',
                                            width: '40px',
                                        }}
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => {
                                            removeStack(stackIndex);
                                        }}
                                    >
                                        delete
                                    </Button>
                                </Stack>
                            ))}
                        </Modal.Content>
                        <Modal.Actions
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                border: '1px solid goldenrod',
                                padding: '0px',
                            }}
                        >
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                onClick={() => {
                                    setQueryElementCounter(
                                        queryElementCounter + 1,
                                    );
                                    appendStack({
                                        queryType: `Join ${queryElementCounter}`,
                                        queryChildren: [],
                                    });
                                }}
                                startIcon={<JoinLeftRounded />}
                            >
                                Join
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                startIcon={<FilterListRounded />}
                                onClick={() => {
                                    setQueryElementCounter(
                                        queryElementCounter + 1,
                                    );
                                    appendStack({
                                        queryType: `Filter ${queryElementCounter}`,
                                        queryChildren: [],
                                    });
                                }}
                            >
                                Add Filter
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="medium"
                                startIcon={<ControlPointDuplicateRounded />}
                                onClick={() => {
                                    setQueryElementCounter(
                                        queryElementCounter + 1,
                                    );
                                    appendStack({
                                        queryType: `Summarization  ${queryElementCounter}`,
                                        queryChildren: [],
                                    });
                                }}
                            >
                                Summarize
                            </Button>
                        </Modal.Actions>
                        <Modal.Actions
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                border: '1px solid pink',
                                padding: '0px',
                            }}
                        >
                            <Button
                                type="submit"
                                variant="text"
                                color="secondary"
                                onClick={() => setIsDataImportModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                Import
                            </Button>
                        </Modal.Actions>
                    </form>
                </Modal>
            </Stack>
        );
    },
);
