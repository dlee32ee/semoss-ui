import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    Breadcrumbs,
    Button,
    Link,
    IconButton,
    Menu,
    MenuItem,
    styled,
    Typography,
    useNotification,
    Chip,
    Modal,
    Stack,
} from '@semoss/ui';
import {
    MembersTable,
    PendingMembersTable,
    SettingsTiles,
} from '@/components/settings';
import {
    AppDetailsFormTypes,
    AppDetailsFormValues,
    ChangeAccessModal,
    DependencyTable,
    EditDetailsModal,
    EditDependenciesModal,
    appDependency,
    modelledDependency,
    fetchAppInfo,
    fetchMainUses,
    fetchDependencies,
    determineUserPermission,
} from '@/components/app';
import { ShareOverlay } from '@/components/workspace';
import { SettingsContext } from '@/contexts';
import { Env } from '@/env';
import { useRootStore } from '@/hooks';
import { formatPermission } from '@/utility';

import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import HdrAutoIcon from '@mui/icons-material/HdrAuto';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import ShareIcon from '@mui/icons-material/Share';

const OuterContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    overflow: 'scroll',
    padding: `${theme.spacing(6)} 1rem 0`,
    width: '100%',
}));

const InnerContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    gap: theme.spacing(3),
    margin: 'auto',
    maxWidth: '79rem',
    width: '100%',
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
}));

const StyledCrumb = styled(Typography, {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: true }>(({ theme, disabled }) => ({
    color: theme.palette.text.primary,

    ...(disabled && {
        color: theme.palette.text.disabled,
    }),
}));

const ActionBar = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    marginLeft: 'auto',
}));

const PageBody = styled('div')(({ theme }) => ({
    marginLeft: '177px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
    fontSize: 20,
    fontWeight: '500',
    marginBottom: theme.spacing(1),
}));

const TitleSection = styled('section')({
    display: 'flex',
    gap: '1rem',
    paddingBottom: '3rem',
});

const TitleSectionImg = styled('img')({
    borderRadius: '0.75rem',
    height: '135px',
    width: '160px',
    overflow: 'hidden',
});

const TitleSectionBodyWrapper = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    justifyContent: 'center',
});

const TitleSectionBody = styled(Typography)({
    alignItems: 'center',
    color: 'rgb(0, 0, 0, 0.6)',
    display: 'flex',
    gap: '0.25rem',
});

const TagsBodyWrapper = styled('div')({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
});

const StyledSection = styled('section')(({ theme }) => ({
    paddingBottom: theme.spacing(1),
}));

const DependenciesHeadingWrapper = styled('div')({
    alignItems: 'start',
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
});

const StyledMenuItem = styled(MenuItem)({
    color: 'rgb(0, 0, 0, 0.7)',
    display: 'flex',
    fontSize: 12,
    gap: '0.75rem',
    padding: '0.75rem',
});

export const AppDetailPage = () => {
    const { control, setValue, getValues, watch } =
        useForm<AppDetailsFormTypes>({ defaultValues: AppDetailsFormValues });

    const mainUses = watch('mainUses');
    const tags = watch('tags');
    const appInfo = watch('appInfo');
    const userRole = watch('userRole');
    const permission = watch('permission');
    const dependencies = watch('dependencies');

    const [moreVertAnchorEl, setMoreVertAnchorEl] = useState(null);
    const [isShareOverlayOpen, setIsShareOverlayOpen] = useState(false);
    const [isChangeAccessModalOpen, setIsChangeAccessModalOpen] =
        useState(false);
    const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);
    const [isEditDependenciesModalOpen, setIsEditDependenciesModalOpen] =
        useState(false);

    const mainUsesRef = useRef<HTMLElement>(null);
    const tagsRef = useRef<HTMLElement>(null);
    const dependenciesRef = useRef<HTMLElement>(null);
    const appAccessRef = useRef<HTMLElement>(null);
    const memberAccessRef = useRef<HTMLElement>(null);
    const similarAppsRef = useRef<HTMLElement>(null);

    const refs = [
        mainUsesRef,
        tagsRef,
        dependenciesRef,
        appAccessRef,
        memberAccessRef,
        similarAppsRef,
    ];

    const { monolithStore } = useRootStore();
    const navigate = useNavigate();
    const notification = useNotification();
    const { appId } = useParams();

    useEffect(() => {
        setValue('appId', appId);
        fetchUserSpecificData();
        fetchAppData(appId);
    }, []);

    const fetchUserSpecificData = async () => {
        const currPermission = getValues('permission');
        await getPermission();
        const newPermission = getValues('permission');

        if (newPermission !== currPermission && newPermission === 'readOnly') {
            fetchSimilarApps();
        }
    };

    async function getPermission() {
        const { permission: role } =
            await monolithStore.getUserProjectPermission(appId);

        setValue('userRole', role);
        const permission = determineUserPermission(role);
        if (permission === 'author') {
            setValue('permission', 'author');
            setValue('requestedPermission', 'author');
        } else if (permission === 'editor') {
            setValue('permission', 'editor');
            setValue('requestedPermission', 'editor');
        } else if (permission === 'readOnly') {
            setValue('permission', 'readOnly');
            setValue('requestedPermission', 'readOnly');
        } else if (permission === 'discoverable') {
            setValue('permission', 'discoverable');
        }
    }

    const fetchAppData = async (id: string) => {
        Promise.allSettled([
            fetchMainUses(monolithStore, id),
            fetchAppInfo(monolithStore, id),
            fetchDependencies(monolithStore, id),
        ]).then((results) =>
            results.forEach((res, idx) => {
                if (res.status === 'rejected') {
                    emitMessage(true, res.reason);
                } else {
                    if (idx === 0) {
                        if (res.value.type === 'error') {
                            emitMessage(true, res.value.output);
                        } else {
                            setValue('mainUses', res.value.output);
                            setValue('detailsForm.mainUses', res.value.output);
                        }
                    } else if (idx === 1) {
                        if (res.value.type === 'error') {
                            emitMessage(true, res.value.output);
                        } else {
                            const tagRes = res.value.output.tag;
                            let modelledTags: string[] = [];
                            if (typeof tagRes === 'string') {
                                modelledTags.push(tagRes);
                            } else if (Array.isArray(tagRes)) {
                                modelledTags = tagRes;
                            }

                            setValue('appInfo', res.value.output);
                            setValue('tags', modelledTags);
                            setValue('detailsForm.tags', modelledTags);
                        }
                    } else if (idx === 2) {
                        if (res.value.type === 'error') {
                            emitMessage(true, res.value.output);
                        } else {
                            const modelled = modelDependencies(
                                res.value.output,
                            );
                            setValue('dependencies', modelled);
                            setValue('selectedDependencies', modelled);
                        }
                    }
                }
            }),
        );
    };

    const fetchSimilarApps = () => {
        // TODO
    };

    const modelDependencies = (
        dependencies: appDependency[],
    ): modelledDependency[] => {
        return dependencies.map((dep: appDependency) => ({
            name: dep.engine_name ? dep.engine_name.replace(/_/g, ' ') : '',
            id: dep.engine_id,
            type: dep.engine_type,
            userPermission: '', // TODO: no value currently available in the payload
            isPublic: !!dep.engine_global,
            isDiscoverable: !!dep.engine_discoverable,
        }));
    };

    const emitMessage = (isError: boolean, message: string) => {
        notification.add({
            color: isError ? 'error' : 'success',
            message,
        });
    };

    const handleCloseChangeAccessModal = () => {
        setIsChangeAccessModalOpen(false);
    };

    const handleCloseEditDetailsModal = (reset?: boolean) => {
        if (reset) {
            setValue('detailsForm', {
                mainUses,
                tags,
            });
        }
        setIsEditDetailsModalOpen(false);
    };

    const handleCloseDependenciesModal = async (refreshData: boolean) => {
        const currDependencies = getValues('dependencies');

        if (refreshData) {
            const appId = getValues('appId');
            const res = await fetchDependencies(monolithStore, appId);
            if (res.type === 'success') {
                const modelled = modelDependencies(res.output);
                setValue('dependencies', modelled);
                setValue('selectedDependencies', modelled);
            } else {
                setValue('selectedDependencies', currDependencies);
                notification.add({
                    color: 'error',
                    message: res.output,
                });
            }
        } else {
            setValue('selectedDependencies', currDependencies);
        }
        setIsEditDependenciesModalOpen(false);
    };

    return (
        <OuterContainer>
            <InnerContainer>
                <Breadcrumbs separator="/">
                    <StyledLink href="/">
                        <StyledCrumb variant="body1">App Library</StyledCrumb>
                    </StyledLink>
                    <StyledCrumb variant="body1" disabled>
                        {appInfo?.project_name}
                    </StyledCrumb>
                </Breadcrumbs>

                <div>
                    <Sidebar permission={permission} refs={refs} />

                    <PageBody>
                        <ActionBar>
                            {permission !== 'author' && (
                                <Button
                                    variant="text"
                                    onClick={() =>
                                        setIsChangeAccessModalOpen(true)
                                    }
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    Change Access
                                </Button>
                            )}

                            <Button
                                variant="contained"
                                onClick={() => navigate(`/app/${appId}`)}
                            >
                                Open
                            </Button>

                            <IconButton
                                onClick={(event) =>
                                    setMoreVertAnchorEl(event.currentTarget)
                                }
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={moreVertAnchorEl}
                                open={Boolean(moreVertAnchorEl)}
                                onClose={() => setMoreVertAnchorEl(null)}
                            >
                                {(permission === 'author' ||
                                    permission === 'editor') && (
                                    <StyledMenuItem
                                        onClick={() => {
                                            setIsEditDetailsModalOpen(true);
                                            setMoreVertAnchorEl(null);
                                        }}
                                        value={null}
                                    >
                                        <EditIcon fontSize="small" />
                                        Edit App Details
                                    </StyledMenuItem>
                                )}
                                <StyledMenuItem
                                    value={null}
                                    onClick={() => setIsShareOverlayOpen(true)}
                                >
                                    <ShareIcon fontSize="small" />
                                    Share
                                </StyledMenuItem>
                            </Menu>
                        </ActionBar>

                        <TitleSection>
                            <TitleSectionImg
                                src={`${Env.MODULE}/api/project-${appId}/projectImage/download`}
                                alt="App Image"
                            />
                            <TitleSectionBodyWrapper>
                                <Typography variant="h6">
                                    {appInfo?.project_name}
                                </Typography>
                                <TitleSectionBody variant="body1">
                                    {() => {
                                        if (permission === 'author') {
                                            return <HdrAutoIcon />;
                                        } else if (permission === 'editor') {
                                            return <NoteAltIcon />;
                                        } else {
                                            return <AssignmentIcon />;
                                        }
                                    }}
                                    {`${formatPermission(userRole)} Access`}
                                </TitleSectionBody>
                                <TitleSectionBody variant="body1">
                                    {appInfo?.description
                                        ? appInfo?.description
                                        : 'No description available'}
                                </TitleSectionBody>
                            </TitleSectionBodyWrapper>
                        </TitleSection>

                        <StyledSection ref={mainUsesRef}>
                            <SectionHeading variant="h2">
                                Main uses
                            </SectionHeading>
                            <Typography variant="body1">{mainUses}</Typography>
                        </StyledSection>

                        <StyledSection ref={tagsRef}>
                            <SectionHeading variant="h2">Tags</SectionHeading>
                            {tags ? (
                                <TagsBodyWrapper>
                                    {tags.map((tag, idx) => (
                                        <Chip
                                            key={`tag-${tag}-${idx}`}
                                            label={tag}
                                        />
                                    ))}
                                </TagsBodyWrapper>
                            ) : (
                                <Typography variant="body1">
                                    No tags available
                                </Typography>
                            )}
                        </StyledSection>

                        {permission !== 'discoverable' && (
                            <StyledSection ref={dependenciesRef}>
                                <DependenciesHeadingWrapper>
                                    <SectionHeading variant="h2">
                                        Dependencies
                                    </SectionHeading>
                                    {(permission === 'author' ||
                                        permission === 'editor') && (
                                        <IconButton
                                            onClick={() =>
                                                setIsEditDependenciesModalOpen(
                                                    true,
                                                )
                                            }
                                            sx={{
                                                position: 'absolute',
                                                right: 0,
                                                top: '-0.4rem',
                                            }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </DependenciesHeadingWrapper>

                                {dependencies.length > 0 ? (
                                    <DependencyTable
                                        dependencies={dependencies}
                                        permission={permission}
                                    />
                                ) : (
                                    <Typography variant="body1">
                                        No dependencies
                                    </Typography>
                                )}
                            </StyledSection>
                        )}

                        {permission === 'author' && (
                            <StyledSection ref={appAccessRef}>
                                <SectionHeading variant="h2">
                                    App Access
                                </SectionHeading>
                                <SettingsContext.Provider
                                    value={{
                                        adminMode: false,
                                    }}
                                >
                                    <SettingsTiles
                                        mode="app"
                                        name="app"
                                        direction="row"
                                        id={appId}
                                        onDelete={() => {
                                            navigate('/settings/app');
                                        }}
                                    />
                                </SettingsContext.Provider>
                            </StyledSection>
                        )}

                        {permission !== 'discoverable' &&
                            permission !== 'readOnly' && (
                                <StyledSection ref={memberAccessRef}>
                                    <SectionHeading variant="h2">
                                        Member Access
                                    </SectionHeading>
                                    <SettingsContext.Provider
                                        value={{
                                            adminMode: false,
                                        }}
                                    >
                                        <Stack direction="column" spacing={2}>
                                            <PendingMembersTable
                                                mode="app"
                                                id={appId}
                                            />
                                            <MembersTable
                                                id={appId}
                                                mode="app"
                                                name="app"
                                                refreshPermission={() => {
                                                    fetchUserSpecificData();
                                                }}
                                            />
                                        </Stack>
                                    </SettingsContext.Provider>
                                </StyledSection>
                            )}

                        {(permission === 'discoverable' ||
                            permission === 'readOnly') && (
                            <StyledSection ref={similarAppsRef}>
                                <SectionHeading variant="h2">
                                    Similar Apps
                                </SectionHeading>
                            </StyledSection>
                        )}
                    </PageBody>
                </div>
            </InnerContainer>

            <Modal
                open={isShareOverlayOpen}
                onClose={() => setIsShareOverlayOpen(false)}
            >
                <ShareOverlay
                    appId={appId}
                    diffs={false}
                    onClose={() => setIsShareOverlayOpen(false)}
                />
            </Modal>

            <ChangeAccessModal
                open={isChangeAccessModalOpen}
                onClose={handleCloseChangeAccessModal}
                control={control}
            />

            <EditDetailsModal
                isOpen={isEditDetailsModalOpen}
                onClose={handleCloseEditDetailsModal}
                control={control}
                getValues={getValues}
                setValue={setValue}
            />

            <EditDependenciesModal
                isOpen={isEditDependenciesModalOpen}
                onClose={handleCloseDependenciesModal}
                control={control}
                getValues={getValues}
                setValue={setValue}
                watch={watch}
            />
        </OuterContainer>
    );
};

const StyledSidebar = styled('div')(({ theme }) => ({
    width: '132px',
    borderRight: `2px solid ${theme.palette.secondary.main}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    position: 'fixed',
}));

interface SidebarProps {
    permission: string;
    refs: React.MutableRefObject<HTMLElement>[];
}

const Sidebar = ({ permission, refs }: SidebarProps) => {
    const [
        mainUsesRef,
        tagsRef,
        dependenciesRef,
        appAccessRef,
        memberAccessRef,
        similarAppsRef,
    ] = refs;

    const scrollIntoView = (ref: React.MutableRefObject<HTMLElement>) => {
        ref.current.scrollIntoView({ behavior: 'smooth' });
    };

    const canEdit = permission !== 'discoverable' && permission !== 'readOnly';

    return (
        <StyledSidebar>
            <Button
                variant="text"
                color="secondary"
                onClick={() => scrollIntoView(mainUsesRef)}
                value={null}
            >
                Main Uses
            </Button>
            <Button
                variant="text"
                color="secondary"
                onClick={() => scrollIntoView(tagsRef)}
                value={null}
            >
                Tags
            </Button>
            {permission !== 'discoverable' && (
                <Button
                    variant="text"
                    color="secondary"
                    onClick={() => scrollIntoView(dependenciesRef)}
                    value={null}
                >
                    Dependencies
                </Button>
            )}
            {permission === 'author' && (
                <Button
                    variant="text"
                    color="secondary"
                    onClick={() => scrollIntoView(appAccessRef)}
                    value={null}
                >
                    App Access
                </Button>
            )}
            {canEdit && (
                <Button
                    variant="text"
                    color="secondary"
                    onClick={() => scrollIntoView(memberAccessRef)}
                    value={null}
                >
                    Member Access
                </Button>
            )}
            {!canEdit && (
                <Button
                    variant="text"
                    color="secondary"
                    onClick={() => scrollIntoView(similarAppsRef)}
                    value={null}
                >
                    Similar Apps
                </Button>
            )}
        </StyledSidebar>
    );
};
