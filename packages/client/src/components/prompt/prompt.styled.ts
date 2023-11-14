import { styled, Paper } from '@semoss/ui';

export const StyledStepPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    margin: theme.spacing(1),
    height: '100%',
}));

export const StyledTextPaper = styled(Paper)(({ theme }) => ({
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: theme.palette.grey[300],
    minHeight: '50%',
    marginTop: theme.spacing(4),
    paddingTop: theme.spacing(1.5),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1.5),
    paddingLeft: theme.spacing(1),
}));
