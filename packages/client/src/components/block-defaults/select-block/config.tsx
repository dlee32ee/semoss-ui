import { BlockConfig } from '@/stores';
import {
    InputSettings,
    QuerySelectionSettings,
} from '@/components/block-settings';

import { SelectBlockDef, SelectBlock } from './SelectBlock';
import { ViewList } from '@mui/icons-material';

import { buildSpacingSection } from '../block-defaults.shared';
import { BLOCK_TYPE_INPUT } from '../block-defaults.constants';
import { SelectInputValueSettings } from '@/components/block-settings/custom/SelectInputValueSettings';
import { SelectInputOptionsSettings } from '@/components/block-settings/custom/SelectInputOptionsSettings';

// export the config for the block
export const config: BlockConfig<SelectBlockDef> = {
    widget: 'select',
    type: BLOCK_TYPE_INPUT,
    data: {
        style: {
            width: '100%',
            padding: '8px',
        },
        value: '',
        label: 'Example Select Input',
        hint: '',
        options: [],
        required: false,
        disabled: false,
        loading: false,
    },
    listeners: {
        onChange: [],
    },
    slots: {
        content: [],
    },
    render: SelectBlock,
    icon: ViewList,
    isBlocksMenuEnabled: true,
    contentMenu: [
        {
            name: 'General',
            children: [
                {
                    description: 'Value',
                    render: ({ id }) => (
                        <SelectInputValueSettings id={id} path="value" />
                    ),
                },
                {
                    description: 'Label',
                    render: ({ id }) => (
                        <InputSettings id={id} label="Label" path="label" />
                    ),
                },
                {
                    description: 'Hint',
                    render: ({ id }) => (
                        <InputSettings id={id} label="Hint" path="hint" />
                    ),
                },
                {
                    description: 'Options',
                    render: ({ id }) => {
                        return (
                            <SelectInputOptionsSettings
                                id={id}
                                path="options"
                            />
                        );
                    },
                },
                {
                    description: 'Loading',
                    render: ({ id }) => (
                        <QuerySelectionSettings
                            id={id}
                            label="Loading"
                            path="loading"
                        />
                    ),
                },
            ],
        },
    ],
    styleMenu: [buildSpacingSection()],
};
