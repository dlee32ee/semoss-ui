import { BlockConfig } from '@/stores';
import { InputTypeSettings, InputSettings } from '@/components/block-settings';

import { TextFieldBlockDef, TextFieldBlock } from './TextFieldBlock';
import { FormatShapes } from '@mui/icons-material';
import {
    buildDimensionsSection,
    buildSpacingSection,
} from '../block-defaults.shared';
import { BLOCK_TYPE_INPUT } from '../block-defaults.constants';

// export the config for the block
export const config: BlockConfig<TextFieldBlockDef> = {
    widget: 'text-field',
    type: BLOCK_TYPE_INPUT,
    data: {
        style: {},
        value: '',
        label: 'Example Input',
        type: 'text',
    },
    listeners: {
        onChange: [],
    },
    slots: {
        content: [],
    },
    render: TextFieldBlock,
    icon: FormatShapes,
    menu: [
        {
            name: 'Text Field',
            children: [
                {
                    description: 'Value',
                    render: ({ id }) => (
                        <InputSettings id={id} label="Value" path="value" />
                    ),
                },
                {
                    description: 'Label',
                    render: ({ id }) => (
                        <InputSettings id={id} label="Label" path="label" />
                    ),
                },
                {
                    description: 'Input Type',
                    render: ({ id }) => {
                        return (
                            <InputTypeSettings
                                id={id}
                                label="Type"
                                path="type"
                            />
                        );
                    },
                },
            ],
        },
        buildSpacingSection(),
        buildDimensionsSection(),
    ],
};
