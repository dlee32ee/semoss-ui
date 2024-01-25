import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Stack, Typography, Search, Button, Grid, styled } from '@semoss/ui';

import { useNavigate } from 'react-router-dom';

import { usePixel, useRootStore } from '@/hooks';
import { Page } from '@/components/ui';
import { AppMetadata, AppTileCard, AddAppModal } from '@/components/app';
import { WelcomeModal } from '@/components/welcome';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
}));

/**
 * Landing page
 */
export const HomePage = observer((): JSX.Element => {
    const { configStore } = useRootStore();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');

    const [addAppModal, setAddAppModal] = useState<boolean>(false);

    // get a list of the keys
    const projectMetaKeys = configStore.store.config.projectMetaKeys.filter(
        (k) => {
            return (
                k.display_options === 'single-checklist' ||
                k.display_options === 'multi-checklist' ||
                k.display_options === 'single-select' ||
                k.display_options === 'multi-select' ||
                k.display_options === 'single-typeahead' ||
                k.display_options === 'multi-typeahead' ||
                k.display_options === 'textarea'
            );
        },
    );

    // get metakeys to the ones we want
    const metaKeys = projectMetaKeys.map((k) => {
        return k.metakey;
    });

    // get the projects
    const myApps = usePixel<AppMetadata[]>(
        `MyProjects(metaKeys = ${JSON.stringify(
            metaKeys,
        )}, filterWord=["${search}"], onlyPortals=[true]);`,
    );

    /**
     * Close the add app modeal
     *
     * appId - app id if it is set
     */
    const closeAddAppModal = (appId?: string) => {
        // close the modal
        setAddAppModal(false);

        // refresh the list or navigate to the app
        if (!appId) {
            myApps.refresh();
        } else {
            navigate(`app/${appId}`);
        }
    };

    return (
        <Page
            header={
                <Stack>
                    <div style={{ height: '24px' }}></div>
                    <Stack
                        direction="row"
                        alignItems={'center'}
                        justifyContent={'space-between'}
                        spacing={4}
                    >
                        <Stack
                            direction="row"
                            alignItems={'center'}
                            spacing={2}
                        >
                            <Typography
                                data-tour="app-library-title"
                                variant={'h4'}
                            >
                                App Library
                            </Typography>
                            <Search
                                size={'small'}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                }}
                                placeholder="Search Apps"
                            />
                        </Stack>
                        <Button
                            size={'large'}
                            variant={'contained'}
                            onClick={() => {
                                if (process.env.NODE_ENV == 'development') {
                                    navigate('/app/new');
                                } else {
                                    setAddAppModal(true);
                                }
                            }}
                            aria-label={`Open the App Model`}
                        >
                            Add App
                        </Button>
                    </Stack>
                </Stack>
            }
        >
            <StyledContainer>
                <Grid container columnSpacing={3} rowSpacing={3}>
                    <Grid item sm={12} md={4} lg={3} xl={2}>
                        <AppTileCard
                            app={{
                                project_id: '',
                                project_name: 'BI',
                                project_type: '',
                                project_cost: '',
                                project_global: '',
                                project_catalog_name: '',
                                project_created_by: 'SYSTEM',
                                project_created_by_type: '',
                                project_date_created: '',
                                project_has_portal: false,
                                project_portal_name: '',
                                project_portal_published_date: '',
                                project_published_user: '',
                                project_published_user_type: '',
                                project_reactors_compiled_date: '',
                                project_reactors_compiled_user: '',
                                project_reactors_compiled_user_type: '',
                                project_favorite: '',
                                user_permission: '',
                                group_permission: '',
                                tag: [],
                                description:
                                    'Develop dashboards and visualizations to view data',
                            }}
                            background="#BADEFF"
                            href="../../../"
                        />
                    </Grid>
                    <Grid item sm={12} md={4} lg={3} xl={2}>
                        <AppTileCard
                            app={{
                                project_id: '',
                                project_name: 'Terminal',
                                project_type: '',
                                project_cost: '',
                                project_global: '',
                                project_catalog_name: '',
                                project_created_by: 'SYSTEM',
                                project_created_by_type: '',
                                project_date_created: '',
                                project_has_portal: false,
                                project_portal_name: '',
                                project_portal_published_date: '',
                                project_published_user: '',
                                project_published_user_type: '',
                                project_reactors_compiled_date: '',
                                project_reactors_compiled_user: '',
                                project_reactors_compiled_user_type: '',
                                project_favorite: '',
                                user_permission: '',
                                group_permission: '',
                                tag: [],
                                description:
                                    'Execute commands and see a response',
                            }}
                            background="#BADEFF"
                            href="../../../#!/embed-terminal"
                        />
                    </Grid>
                </Grid>
            </StyledContainer>

            <StyledContainer>
                {myApps.status === 'SUCCESS' && myApps.data.length > 0 ? (
                    <Grid container columnSpacing={3} rowSpacing={3}>
                        {myApps.data.map((app) => {
                            return (
                                <Grid
                                    item
                                    key={app.project_id}
                                    sm={12}
                                    md={4}
                                    lg={3}
                                    xl={2}
                                >
                                    <AppTileCard
                                        app={app}
                                        href={`#/app/${app.project_id}`}
                                    />
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : null}
            </StyledContainer>
            <AddAppModal
                open={addAppModal}
                handleClose={(appId) => closeAddAppModal(appId)}
            />
            <WelcomeModal />
        </Page>
    );
});
