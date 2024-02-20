import { observer } from 'mobx-react-lite';
import { TextField } from '@semoss/ui';
import { Autocomplete } from '@mui/material';
import { operation } from '../clean.types';
import { operations } from '../clean.constants';

export type OperationCleanRoutineFieldComponent = (props: {
    selectedOperation: operation;
    label?: string;
    disabled?: boolean;
    onChange: (operation: string) => void;
}) => JSX.Element;

export const OperationCleanRoutineField: OperationCleanRoutineFieldComponent =
    observer((props) => {
        const {
            selectedOperation,
            label = 'Operation',
            disabled = false,
            onChange,
        } = props;

        return (
            <Autocomplete
                disableClearable
                disabled={disabled}
                size="small"
                value={selectedOperation}
                fullWidth
                onChange={(_, newValue: string) => {
                    onChange(newValue);
                }}
                options={operations}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label={label} />
                )}
            />
        );
    });
