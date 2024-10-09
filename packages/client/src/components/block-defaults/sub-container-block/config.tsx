import { CSSProperties } from 'react';
import { BlockConfig } from '@/stores';

import {
    buildLayoutSection,
    buildSpacingSection,
    buildDimensionsSection,
    buildBorderSection,
    buildColorSection,
} from '../block-defaults.shared';

import { SubContainerBlockDef, SubContainerBlock } from './SubContainerBlock';
import { HighlightAlt } from '@mui/icons-material';
import { BLOCK_TYPE_LAYOUT } from '../block-defaults.constants';

// export the config for the block
export const config: BlockConfig<SubContainerBlockDef> = {
    widget: 'sub-container',
    type: BLOCK_TYPE_LAYOUT,
    data: {
        style: {
            display: 'flex',
            flexDirection: 'column',
            padding: '4px',
            gap: '8px',
            flexWrap: 'wrap',
        },
        subcontainer: 2,
        id: '',
    },
    listeners: {},
    slots: {
        children: [],
    },
    render: SubContainerBlock,
    icon: HighlightAlt,
    contentMenu: [],
    styleMenu: [
        buildLayoutSection(),
        buildSpacingSection(),
        buildDimensionsSection(),
        buildColorSection(),
        buildBorderSection(),
    ],
};
