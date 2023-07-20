import { useState, useEffect } from 'react';
import {
    styled,
    Grid,
    Card,
    Typography,
    Select,
    Search,
    MenuItem,
} from '@semoss/ui';

import { Icon } from '@semoss/components';

import { Search as SearchIcon, AccessTime } from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks';
import { LoadingScreen } from '@/components/ui';

import { SEMOSS } from '@/assets/img/SEMOSS';
import { DatabaseLayers } from '@/assets/img/DatabaseLayers';
import { Folder } from '@/assets/img/Folder';
import { Group } from '@/assets/img/Group';
import { Construction } from '@/assets/img/Construction';
import { AdminPanel } from '@/assets/img/AdminPanel';
import { Link } from '@/assets/img/Link';
import { GroupRounded } from '@/assets/img/GroupRounded';
import { PersonRounded } from '@/assets/img/PersonRounded';
import { PaintRounded } from '@/assets/img/PaintRounded';

import { SETTINGS_ROUTES } from './settings.constants';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    width: 'auto',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    overflow: 'hidden',
    height: theme.spacing(20),
}));

const StyledCardContent = styled(Card.Content)(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

const StyledSearchbarContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
    gap: theme.spacing(3),
}));

const StyledSort = styled(Select)(({ theme }) => ({
    display: 'flex',
    width: theme.spacing(28),
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '3px',
    flexShrink: '0',
}));

const StyledIcon = styled(Icon)({
    fontSize: '30px',
});

const CardActionsLeft = styled('div')({
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
});

const CardActionsRight = styled('div')({
    display: 'flex',
    marginLeft: 'auto',
});

const DEFAULT_CARDS = SETTINGS_ROUTES.filter(
    (r) => !!r.path && r.history.length < 2,
);

const IconMapper = {
    'Database Settings': <DatabaseLayers />,
    'Project Settings': <Folder />,
    'Insight Settings': <SEMOSS />,
    'Member Settings': <Group />,
    Configuration: <Construction />,
    'Admin Query': <AdminPanel />,
    'External Connections': <Link />,
    Teams: <GroupRounded />,
    'Teams Management': <GroupRounded />,
    'Teams Permissions': <GroupRounded />,
    'My Profile': <PersonRounded />,
    Theming: <PaintRounded />,
};

console.log('', DEFAULT_CARDS);
export const SettingsIndexPage = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState(DEFAULT_CARDS);
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState('Name');

    const { adminMode } = useSettings();

    useEffect(() => {
        // reset the options if there is no search value
        if (!search) {
            setCards(DEFAULT_CARDS);
            return;
        }

        const cleanedSearch = search.toLowerCase();

        const filtered = DEFAULT_CARDS.filter((c) => {
            return c.title.toLowerCase().includes(cleanedSearch);
        });

        setCards(filtered);
    }, [search]);

    return (
        <StyledContainer>
            <StyledSearchbarContainer>
                <Search
                    label={'Search'}
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                    placeholder={'Search Databases'}
                    InputProps={{
                        startAdornment: <SearchIcon />,
                    }}
                    sx={{ width: '100%' }}
                />
                <StyledSort
                    label={'Sort'}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <MenuItem value="Name">Name</MenuItem>
                </StyledSort>
            </StyledSearchbarContainer>

            <Grid container spacing={2}>
                {cards.map((c, i) => {
                    return (
                        <Grid item key={i} sm={12} md={6} lg={4} xl={3}>
                            <StyledCard onClick={() => navigate(c.path)}>
                                <Card.Header
                                    title={c.title}
                                    titleTypographyProps={{ variant: 'h5' }}
                                    avatar={IconMapper[c.title]}
                                />
                                <StyledCardContent sx={{ marginTop: -2 }}>
                                    <Typography variant="caption">
                                        {c.description}
                                    </Typography>
                                </StyledCardContent>
                                {/* disabled for now */}
                                {/* <Card.Actions>
                                    <CardActionsLeft>
                                        <AccessTime fontSize="small" />
                                        <Typography variant="caption">
                                            7/19/2023 10:00AM
                                        </Typography>
                                    </CardActionsLeft>
                                    <CardActionsRight>tbd</CardActionsRight>
                                </Card.Actions> */}
                            </StyledCard>
                        </Grid>
                    );
                })}
            </Grid>
        </StyledContainer>
    );
};
