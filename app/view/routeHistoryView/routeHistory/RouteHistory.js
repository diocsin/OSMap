Ext.define('Isidamaps.view.routeHistoryView.routeHistory.RouteHistory', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.routeHistoryView-routeHistory',
    border: false,
    title: 'Table Layout',
    bind: '{Route}',

    viewConfig: {
        markDirty: false
    },

    width: '100%',
    columns: [
        {
            text: 'Номер<br>бригады',
            dataIndex: 'brigadeNum',
            id: 'brigadeId',
            width: '25%',
            fixed: true

        },
        {
            text: 'Профиль',
            dataIndex: 'profile',
            width: '25%',
            fixed: true
        },
        {
            text: 'Расстояние<br>(км)',
            dataIndex: 'distance',
            width: '25%',
            fixed: true

        },
        {
            text: 'Время<br>доезда<br>(мин)',
            dataIndex: 'time',
            width: '24%',
            sortable: true,
            fixed: true
        }
    ],

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        items: [{
            xtype: 'component',
            flex: 1
        },
            {
                text: 'Закрыть карту',
                listeners: {
                    click: function () {
                        Ext.fireEvent('windowClose');
                    }
                }
            }
        ]
    }],
    renderTo: Ext.getBody()
});
