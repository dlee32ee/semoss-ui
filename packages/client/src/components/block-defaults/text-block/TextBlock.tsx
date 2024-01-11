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

    return (
        <span
            style={{
                ...data.style,
            }}
            {...attrs}
        >
            {/* {d} */}
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

const d = [
    {
        project_favorite: 0,
        description:
            "Don't forget the Data Showcase, a captivating space where innovative projects and groundbreaking data analyses are exhibited. Witness the brilliance of data visualization as you roam among stunning masterpieces that distill complex insights into works of art.",
        project_name: 'College_Johnnathan',
        project_id: '2e2534db-fffa-4054-b9e9-dbf44183ab3b',
        project_discoverable: true,
        project_portal_published_date: '2023-12-07 16:03:49.235',
        tag: ['Tag1', 'Tag2', 'Tag3'],
        low_project_name: 'college_johnnathan',
        project_global: false,
        project_published_user: 'jbaxter6',
        permission: 2,
        project_published_user_type: 'Native',
        project_has_portal: true,
        user_permission: 2,
    },
    {
        project_global: false,
        project_favorite: 0,
        permission: 1,
        project_name: 'consolidated_settings',
        project_id: 'f9b656cc-06e7-4cce-bae8-b5f92075b6da',
        project_discoverable: true,
        user_permission: 1,
        low_project_name: 'consolidated_settings',
    },
    {
        project_type: '',
        project_global: true,
        project_cost: '',
        project_name: 'ELCM',
        project_id: 'd414f43f-e9c7-49ce-ba94-c563e3ae97e5',
        project_discoverable: false,
        low_project_name: 'elcm',
    },
    {
        project_global: false,
        project_favorite: 0,
        permission: 1,
        project_name: 'email preferences',
        project_id: '83ce0cc4-7c48-4db7-b26b-88ef723026d7',
        project_discoverable: true,
        user_permission: 1,
        low_project_name: 'email preferences',
    },
    {
        project_favorite: 0,
        description:
            'So, join us on this riveting journey of data exploration, where the night is young, and the insights are infinite. Welcome to the Data Analytics Insnight, where data dreams come true!',
        project_cost: '',
        project_name: 'FARBOT',
        project_id: '8b859cfc-35cf-4d36-b1ea-221a27b65a3e',
        project_discoverable: false,
        project_portal_published_date: '2024-01-10 16:41:13.130',
        tag: 'Tag6',
        low_project_name: 'farbot',
        project_type: '',
        project_global: true,
        project_published_user: 'jbaxter6',
        permission: 1,
        project_published_user_type: 'Native',
        project_has_portal: true,
        user_permission: 1,
    },
    {
        project_created_by_type: 'Native',
        project_type: 'CODE',
        project_global: true,
        project_favorite: 0,
        project_date_created: '2023-12-05 23:39:43.167',
        project_published_user: 'jbaxter6',
        project_created_by: 'jbaxter6',
        description: 'Desc',
        project_cost: '',
        permission: 1,
        project_name: 'Jine',
        project_published_user_type: 'Native',
        project_has_portal: true,
        project_id: '6652b233-bae3-44e8-b840-6cb668040532',
        project_portal_name: '',
        project_discoverable: false,
        project_portal_published_date: '2023-12-05 23:39:48.10',
        user_permission: 1,
        low_project_name: 'jine',
    },
    {
        project_type: '',
        project_global: true,
        project_cost: '',
        project_name: 'JohnQA',
        project_id: '591edb5a-8fd2-46d6-8002-321fc1cd5f75',
        project_discoverable: false,
        low_project_name: 'johnqa',
    },
    {
        project_created_by_type: 'Native',
        project_type: '',
        project_global: false,
        project_favorite: 0,
        project_date_created: '2023-11-01 16:31:23.339',
        project_published_user: 'jbaxter6',
        project_created_by: 'jbaxter6',
        description: 'Desc',
        project_cost: '',
        permission: 1,
        project_name: 'Johns New',
        project_published_user_type: 'Native',
        project_has_portal: false,
        project_id: '58b7dffc-59d7-4cfb-82a6-c266f31a01ca',
        project_discoverable: false,
        project_portal_published_date: '2023-11-01 16:47:24.564',
        user_permission: 1,
        low_project_name: 'johns new',
    },
    {
        project_created_by_type: 'Native',
        project_favorite: 0,
        project_date_created: '2023-12-05 16:24:41.375',
        project_created_by: 'jbaxter6',
        description: 'Another App for testing purposes',
        project_cost: '',
        project_name: 'Johns New App',
        project_id: '2a27eb2e-3e0d-4aa4-8013-9a7f5ddfdd6b',
        project_discoverable: false,
        project_portal_published_date: '2024-01-08 18:19:49.460',
        tag: 'Tag1',
        low_project_name: 'johns new app',
        project_type: 'CODE',
        project_global: false,
        project_published_user: 'jbaxter6',
        permission: 1,
        project_published_user_type: 'Native',
        project_has_portal: true,
        user_permission: 1,
    },
    {
        project_created_by_type: 'Native',
        project_type: 'CODE',
        project_global: true,
        project_favorite: 0,
        project_date_created: '2023-12-05 22:54:30.895',
        project_published_user: 'jbaxter6',
        project_created_by: 'jbaxter6',
        description: 'Description',
        project_cost: '',
        permission: 1,
        project_name: 'Johns Test App',
        project_published_user_type: 'Native',
        project_has_portal: true,
        project_id: '296609d3-64e9-4331-8c26-3770d0d31910',
        project_discoverable: false,
        project_portal_published_date: '2023-12-18 18:00:33.868',
        user_permission: 1,
        low_project_name: 'johns test app',
    },
    {
        project_created_by_type: 'Native',
        project_type: 'BLOCKS',
        project_global: false,
        project_favorite: 0,
        project_date_created: '2024-01-10 18:52:45.451',
        project_created_by: 'jbaxter6',
        project_cost: '',
        permission: 1,
        project_name: 'klsalk',
        project_has_portal: true,
        project_id: 'b879346b-157a-4a0b-aabf-7856823eed76',
        project_portal_name: '',
        project_discoverable: false,
        user_permission: 1,
        low_project_name: 'klsalk',
    },
    {
        project_created_by_type: 'Native',
        project_type: 'CODE',
        project_global: true,
        project_favorite: 0,
        project_date_created: '2023-12-05 22:55:45.747',
        project_published_user: 'jbaxter6',
        project_created_by: 'jbaxter6',
        description: 'Decriptions',
        project_cost: '',
        permission: 1,
        project_name: 'New',
        project_published_user_type: 'Native',
        project_has_portal: true,
        project_id: '63671f90-70e6-4148-849e-f0063a100471',
        project_portal_name: '',
        project_discoverable: false,
        project_portal_published_date: '2023-12-05 22:55:50.580',
        user_permission: 1,
        low_project_name: 'new',
    },
    {
        project_created_by_type: 'Native',
        project_type: 'CODE',
        project_global: true,
        project_favorite: 0,
        project_date_created: '2023-12-05 22:51:06.116',
        project_published_user: 'jbaxter6',
        project_created_by: 'jbaxter6',
        description: 'Description for app',
        project_cost: '',
        permission: 1,
        project_name: 'New App Test Config Boolean',
        project_published_user_type: 'Native',
        project_has_portal: true,
        project_id: '0b0fef7c-db45-42ee-9350-b50c9fcd817d',
        project_portal_name: '',
        project_discoverable: false,
        project_portal_published_date: '2023-12-05 22:51:11.20',
        user_permission: 1,
        low_project_name: 'new app test config boolean',
    },
    {
        project_created_by_type: 'Native',
        project_favorite: 0,
        project_date_created: '2023-08-22 10:19:17.175',
        project_created_by: 'jbaxter6',
        description: 'Policy Bot for Demo Purposes',
        project_cost: '',
        project_name: 'Policy Bot',
        project_id: '59880497-ee82-4f44-9318-468bd45f1258',
        project_discoverable: false,
        project_portal_published_date: '2023-12-20 22:07:55.83',
        tag: 'Policy',
        low_project_name: 'policy bot',
        project_type: '',
        project_global: true,
        project_published_user: 'jbaxter6',
        permission: 1,
        project_published_user_type: 'Native',
        project_has_portal: true,
        user_permission: 1,
    },
    {
        project_type: '',
        project_global: true,
        project_favorite: 0,
        project_published_user: 'jbaxter6',
        project_cost: '',
        permission: 1,
        project_name: 'QA5',
        project_published_user_type: 'Native',
        project_has_portal: true,
        project_id: '7f99f6e8-cebf-445f-b04a-004ea306df84',
        project_discoverable: false,
        project_portal_published_date: '2023-12-08 18:16:03.653',
        user_permission: 1,
        low_project_name: 'qa5',
    },
    {
        project_created_by_type: 'Native',
        project_type: 'BLOCKS',
        project_global: false,
        project_favorite: 0,
        project_date_created: '2023-12-05 15:32:11.697',
        project_created_by: 'jbaxter6',
        project_cost: '',
        permission: 1,
        project_name: 'skas',
        project_has_portal: true,
        project_id: '0b5537e8-345c-4a2e-988d-bf01919b4e29',
        project_portal_name: '',
        project_discoverable: false,
        user_permission: 1,
        low_project_name: 'skas',
    },
    {
        project_created_by_type: 'Native',
        project_type: 'BLOCKS',
        project_global: false,
        project_favorite: 0,
        project_date_created: '2023-12-05 15:32:10.761',
        project_created_by: 'jbaxter6',
        project_cost: '',
        permission: 1,
        project_name: 'skas',
        project_has_portal: true,
        project_id: '1c98a6e6-bf50-4ae9-ae97-e347e3c0673a',
        project_portal_name: '',
        project_discoverable: false,
        user_permission: 1,
        low_project_name: 'skas',
    },
    {
        project_global: false,
        project_favorite: 0,
        permission: 1,
        project_name: 'Sql Server VHA Supply',
        project_id: 'fe5e2c23-59e6-42ae-939d-b2ca9699f38c',
        project_discoverable: true,
        user_permission: 1,
        low_project_name: 'sql server vha supply',
    },
];
