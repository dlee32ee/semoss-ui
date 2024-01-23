import { CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';

import { useBlock } from '@/hooks';
import { BlockDef, BlockComponent } from '@/stores';

export interface TextBlockDef extends BlockDef<'text'> {
    widget: 'text';
    data: {
        style: CSSProperties;
        text: string;
    };
    slots: never;
}

export const TextBlock: BlockComponent = observer(({ id }) => {
    const { attrs, data } = useBlock<TextBlockDef>(id);
    console.log(data);
    return (
        <span
            style={{
                overflow: 'auto',
                textOverflow: 'ellipsis',
                padding: '16px',
                ...data.style,
            }}
            {...attrs}
        >
            {`${
                data.text
                    ? typeof data.text === 'string'
                        ? data.text
                        : JSON.stringify(data.text)
                    : ''
            }`}
        </span>
    );
});
