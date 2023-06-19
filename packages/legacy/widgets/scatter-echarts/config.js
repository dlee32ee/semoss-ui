module.exports = {
    name: 'Scatter',
    icon: require('images/scatterplot.svg'),
    widgetList: {
        tags: ['Visualization'],
        showOn: 'none',
        quickMenu: [
            'events',
            'unfilter',
            'color-panel-mode',
            'color-by-value',
            'toggle-zoom-x',
            'toggle-zoom-y',
            'infinite-viz',
        ],
    },
    content: {
        template: {
            name: 'scatter-echarts',
        },
    },
    visualization: {
        type: ['echarts'],
        group: 'Visualization',
        view: 'visualization',
        layout: 'Scatter',
        visibleModes: ['default-mode', 'comment-mode', 'polygon-brush-mode'],
        tools: [
            'legend-viz',
            'custom-legend',
            'filter',
            'unfilter',
            'color-panel',
            'color-by-value',
            'regression-line',
            'edit-x-axis',
            'edit-y-axis',
            'display-values',
            'format-data-values',
            'customize-bar-label',
            'edit-grid',
            'font-settings',
            'show-quadrants',
            'reverse-y',
            'reverse-x',
            'sort-values',
            //'toggle-legend',
            'toggle-tooltips',
            'toggle-shadow',
            'toggle-zoom-x',
            'toggle-zoom-y',
            'toggle-axis-pointer',
            'change-symbol',
            'facet-headers',
            'mark-line',
            'mark-area',
            'reset-state',
            'events',
            'param',
            'purge',
            'refresh-cache',
            'chart-title',
        ],
        showOnVisualPanel: true,
        visualPanelMenu: {
            USE: 'Distribution',
        },
        format: 'table',
        fields: [
            {
                model: 'label',
                name: 'Label',
                acceptableTypes: ['STRING', 'NUMBER', 'DATE'],
                group: 'validate',
                optional: false,
                multiField: false,
                description:
                    'Try adding one dimension (i.e. Movie Title). Each instance within this dimension will represent a point on the plot.',
            },
            {
                model: 'x',
                name: 'X-Axis',
                acceptableTypes: ['NUMBER'],
                group: 'math',
                optional: false,
                multiField: false,
                description:
                    'Try adding one numerical dimension (i.e. Movie Budget). The values of this dimension will represent the x-axis.',
            },
            {
                model: 'y',
                name: 'Y-Axis',
                acceptableTypes: ['NUMBER'],
                group: 'math',
                optional: false,
                multiField: false,
                description:
                    'Try adding one numerical dimension (i.e. Movie Revenue). The values of this dimension will represent the y-axis.',
            },
            {
                model: 'z',
                name: 'Size',
                acceptableTypes: ['NUMBER'],
                group: 'math',
                optional: true,
                multiField: false,
                description:
                    'Try adding one numerical dimension (i.e. IMBD Score). The values of this dimension will represent the size of their respective point on the plot.',
            },
            {
                model: 'series',
                name: 'Color',
                acceptableTypes: ['STRING', 'NUMBER', 'DATE'],
                group: 'concat',
                optional: true,
                multiField: false,
                description:
                    'Try adding one dimension (i.e. Movie Genre). Each instance within this dimension will represent a color.',
            },
            {
                model: 'tooltip',
                name: 'Tooltip',
                acceptableTypes: ['STRING', 'NUMBER', 'DATE'],
                group: 'math',
                optional: true,
                multiField: true,
                description:
                    'Try adding one or several dimensions (i.e. Movie Revenue). Each instance of this dimension will appear in the tooltip when hovering.',
            },
            {
                model: 'facet',
                name: 'Facet',
                acceptableTypes: ['STRING', 'DATE'],
                group: 'validate',
                optional: true,
                multiField: false,
                description:
                    'Try adding one dimension (i.e. Nominated). The data will be grouped by each instance of the selected dimension.',
            },
        ],
        color: {
            label: {
                multiField: true,
                instances: false,
            },
        },
    },
    lazy: true,
};
