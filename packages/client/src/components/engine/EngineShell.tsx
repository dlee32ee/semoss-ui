import React, { useState } from 'react';
import {
    styled,
    Breadcrumbs,
    Button,
    Chip,
    IconButton,
    Stack,
    Typography,
    Tooltip,
    useNotification,
    CircularProgress,
} from '@semoss/ui';

import { useRootStore, useEngine, usePixel } from '@/hooks';
import { Page, LoadingScreen } from '@/components/ui';
import { EngineAccessButton, EditEngineDetails } from './';
import { removeUnderscores } from '@/utility';
import { Link } from 'react-router-dom';
import { Help } from '@/components/help';
import {
    EditRounded,
    SimCardDownload,
    ContentCopyOutlined,
} from '@mui/icons-material';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    marginTop: '-3px',
    marginLeft: '2px',
}));

const StyledInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(4),
    overflow: 'hidden',
}));

const StyledInfoLeft = styled('div')(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
}));

const StyledInfoRight = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: '288px',
}));

const StyledInfoDescription = styled(Typography)(({ theme }) => ({
    maxWidth: '699px',
    maxHeight: '174px',
    textOverflow: 'ellipsis',
    color: 'rgba(0, 0, 0, 0.6)',
    overflow: 'hidden',
    whiteSpace: 'normal',
}));

const StyledChipContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
}));

const StyledLink = styled(Link)(() => ({
    textDecoration: 'none',
    color: 'inherit',
}));

const StyledDatabaseImage = styled('img')({
    width: '288px',
    height: '161.723px',
    flexShrink: '0',
    borderRadius: '8.862px',
    aspectRatio: 'auto',
});

interface EngineShellProps {
    /** Children to wrap in the RootStore */
    children: React.ReactNode;
}

/**
 * Wrap the Database, Storage, Model routes
 */
export const EngineShell = (props: EngineShellProps) => {
    const { children } = props;

    // get the database information
    const { id, type, name, role, metaVals, refresh } = useEngine();

    // Service for Axios calls
    const { monolithStore } = useRootStore();

    // notification
    const notification = useNotification();

    // set if it can edit
    const canEdit = role === 'OWNER' || role === 'EDITOR';

    // track the edit state
    const [edit, setEdit] = useState(false);

    // export loading state
    const [exportLoading, setExportLoading] = useState(false);

    // get the engine info
    const { status, data } = usePixel<{
        database_name: string;
        database_discoverable: boolean;
        database_created_by?: string;
        database_date_created?: string;
        last_updated?: string;
        description?: string;
    }>(`GetEngineMetadata(engine=["${id}"], metaKeys=[]); `);

    /**
     * @name exportDB
     * @desc export DB pixel
     */
    const exportDB = () => {
        setExportLoading(true);
        const pixel = `META | ExportEngine(engine=["${id}"] );`;

        monolithStore.runQuery(pixel).then((response) => {
            const output = response.pixelReturn[0].output,
                insightId = response.insightId;

            monolithStore.download(insightId, output);
        });
        setExportLoading(false);
    };

    // show a loading screen when it is pending
    if (status !== 'SUCCESS') {
        return <LoadingScreen.Trigger description="Opening Engine" />;
    }

    return (
        <Page
            header={
                <Stack>
                    <Breadcrumbs>
                        <StyledLink to={`..`}>{name} Catalog</StyledLink>
                        <StyledLink to={`.`}>
                            {removeUnderscores(data.database_name)}
                        </StyledLink>
                    </Breadcrumbs>
                    <Stack direction="row" alignItems={'center'} width={'100%'}>
                        <Typography variant="h4">
                            {removeUnderscores(data.database_name)}
                        </Typography>
                        <Stack flex={1}> &nbsp;</Stack>
                        <Stack direction="row">
                            <EngineAccessButton />
                            {role === 'OWNER' && (
                                <Button
                                    disabled={exportLoading}
                                    startIcon={
                                        exportLoading ? (
                                            <CircularProgress size="1em" />
                                        ) : (
                                            <SimCardDownload />
                                        )
                                    }
                                    variant="outlined"
                                    onClick={() => exportDB()}
                                >
                                    Export
                                </Button>
                            )}
                            {canEdit && (
                                <>
                                    {edit && (
                                        <EditEngineDetails
                                            values={metaVals}
                                            open={edit}
                                            onClose={(success) => {
                                                // reload if successfully submitted
                                                if (success) {
                                                    refresh();
                                                }

                                                setEdit(false);
                                            }}
                                        />
                                    )}
                                    <Button
                                        onClick={() => setEdit(!edit)}
                                        startIcon={<EditRounded />}
                                        variant={'contained'}
                                    >
                                        Edit
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Stack>
                    <Stack>
                        <span>
                            {id}
                            <StyledIconButton
                                aria-label={`copy ${name} ID`}
                                size="small"
                                onClick={(e) => {
                                    // prevent the default action
                                    e.preventDefault();

                                    // copy
                                    try {
                                        navigator.clipboard.writeText(id);

                                        notification.add({
                                            color: 'success',
                                            message: 'Successfully copied ID',
                                        });
                                    } catch (e) {
                                        console.error(e);

                                        notification.add({
                                            color: 'error',
                                            message: 'Error copyng ID',
                                        });
                                    }
                                }}
                            >
                                <Tooltip title={`Copy ${name} ID`}>
                                    <ContentCopyOutlined fontSize="inherit" />
                                </Tooltip>
                            </StyledIconButton>
                        </span>
                    </Stack>
                </Stack>
            }
        >
            <StyledInfo>
                <StyledInfoLeft>
                    <StyledInfoDescription variant={'subtitle1'}>
                        {metaVals.description
                            ? metaVals.description
                            : canEdit
                            ? `Please use the Edit button to provide a description for this ${name}. A description will help other's find the ${name} and understand how to use it. To include a more details associated to the ${type}, edit the markdown located in the Overview section.`
                            : `This ${name} is currently awaiting a detailed description, which will be provided by the engine editor in the near future. As of now, the ${name} contains valuable and relevant information that pertains to its designated subject matter. Kindly check back later for a comprehensive overview of the contents and scope of this engine, as the editor will be updating it shortly`}
                    </StyledInfoDescription>

                    <StyledChipContainer>
                        {metaVals.tag &&
                            (metaVals.tag as string[]).map((tag, i) => {
                                return <Chip key={i} label={tag} />;
                            })}
                    </StyledChipContainer>
                </StyledInfoLeft>
                <StyledInfoRight>
                    <Stack
                        alignItems={'flex-end'}
                        spacing={1}
                        marginBottom={2}
                        sx={{ color: 'rgba(0, 0, 0, 0.6)' }}
                    >
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                flexDirection: 'row',
                                gap: '8px',
                            }}
                        >
                            <Typography
                                variant={'body2'}
                                sx={{
                                    maxWidth: '35%',
                                }}
                            >
                                Published by:{' '}
                            </Typography>
                            <Typography
                                variant={'body2'}
                                sx={{
                                    maxWidth: '65%',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    direction: 'rtl',
                                    textAlign: 'left',
                                }}
                            >
                                {data.database_created_by
                                    ? data.database_created_by
                                    : 'N/A'}
                            </Typography>
                        </div>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                flexDirection: 'row',
                                gap: '8px',
                            }}
                        >
                            <Typography
                                variant={'body2'}
                                sx={{
                                    maxWidth: '35%',
                                }}
                            >
                                Updated:{' '}
                            </Typography>
                            <Typography
                                variant={'body2'}
                                sx={{
                                    maxWidth: '65%',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    direction: 'rtl',
                                    textAlign: 'left',
                                }}
                            >
                                {data.last_updated ? data.last_updated : 'N/A'}
                            </Typography>
                        </div>
                    </Stack>
                </StyledInfoRight>
            </StyledInfo>
            {children}
            <Help />
        </Page>
    );
};
