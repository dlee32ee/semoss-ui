import { useState, useEffect } from 'react';
import {
    Card,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Search,
    styled,
    Typography,
} from '@semoss/ui';

import {
    Search as SearchIcon,
    MoreVert,
    Diversity3,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import { AdminPanel } from '@/assets/img/AdminPanel';
import { ArchiveBox } from '@/assets/img/ArchiveBox';
import { Construction } from '@/assets/img/Construction';
import { DatabaseLayers } from '@/assets/img/DatabaseLayers';
import { Folder } from '@/assets/img/Folder';
import { Group } from '@/assets/img/Group';
import { GroupRounded } from '@/assets/img/GroupRounded';
import { Jobs } from '@/assets/img/Jobs';
import { Link } from '@/assets/img/Link';
import { ModelBrain } from '@/assets/img/ModelBrain';
import { PaintRounded } from '@/assets/img/PaintRounded';
import { PersonRounded } from '@/assets/img/PersonRounded';
import { SEMOSS } from '@/assets/img/SEMOSS';
import { Function } from '@/assets/img/Function';
import { Vector } from '@/assets/img/Vector';

import { useSettings } from '@/hooks';

import { SETTINGS_ROUTES } from './settings.constants';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    width: 'auto',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(3),
}));

const StyledCard = styled(Card)(() => ({
    '&:hover': {
        cursor: 'pointer',
    },
}));

const StyledCardHeader = styled(Card.Header)(({ theme }) => ({
    height: theme.spacing(7.75),
    margin: '0px 0px 0px 0px',
}));

const StyledCardContent = styled(Card.Content)(({ theme }) => ({
    height: theme.spacing(5),
    margin: '0px 0px 0px 0px',
}));

const StyledSearchbarContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
    gap: theme.spacing(3),
}));

const StyledSort = styled(Select)(() => ({
    width: '20%',
}));

const CardActionsLeft = styled('div')({
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
});

const CardActionsRight = styled('div')({
    display: 'flex',
    marginLeft: 'auto',
});

const StyledSearch = styled(Search)({ width: '80%' });

const DEFAULT_CARDS = SETTINGS_ROUTES.filter(
    (r) => !!r.path && r.history.length < 2,
);

const IconMapper = {
    'Database Settings': <DatabaseLayers />,
    'Model Settings': (
        <ModelBrain color={'#0471F0'} width={'50'} height={'50'} />
    ),
    'Storage Settings': <ArchiveBox />,
    'App Settings': <Folder />,
    'Vector Settings': <Vector />,
    'Function Settings': <Function />,
    'Insight Settings': <SEMOSS />,
    'Member Settings': <Group />,
    Configuration: <Construction />,
    'Admin Query': <AdminPanel />,
    'External Connections': <Link />,
    Teams: <GroupRounded />,
    'Teams Management': <GroupRounded />,
    'Team Permissions': <Diversity3 />,
    'My Profile': <PersonRounded />,
    Theming: <PaintRounded />,
    Jobs: <Jobs />,
};

export const SettingsIndexPage = () => {
    const navigate = useNavigate();
    const { adminMode } = useSettings();
    const [cards, setCards] = useState(DEFAULT_CARDS);
    const [search, setSearch] = useState<string>('');
    const [sort, setSort] = useState('Name');

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
                <StyledSearch
                    size="small"
                    onChange={(e) => {
                        setSearch(e.target.value);
                    }}
                />
                <StyledSort
                    size={'small'}
                    label={'Sort'}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <MenuItem value="Name">Name</MenuItem>
                </StyledSort>
            </StyledSearchbarContainer>

            <Grid container spacing={2}>
                {cards.map((c, i) => {
                    if (c.admin && !adminMode) {
                        return;
                    } else {
                        return (
                            <Grid item key={i} sm={12} md={6} lg={4} xl={3}>
                                <StyledCard onClick={() => navigate(c.path)}>
                                    <StyledCardHeader
                                        title={c.title}
                                        titleTypographyProps={{
                                            variant: 'body1',
                                        }}
                                        avatar={IconMapper[c.title]}
                                    />
                                    <StyledCardContent>
                                        <Typography variant="body2">
                                            {c.description}
                                        </Typography>
                                    </StyledCardContent>
                                    {/* disabled for now */}
                                    <Card.Actions>
                                        <CardActionsLeft></CardActionsLeft>
                                        <CardActionsRight>
                                            <IconButton disabled={true}>
                                                <MoreVert />
                                            </IconButton>
                                        </CardActionsRight>
                                    </Card.Actions>
                                </StyledCard>
                            </Grid>
                        );
                    }
                })}
            </Grid>
        </StyledContainer>
    );
};
