Ext.define('Isidamaps.view.routeBrigadeView.routeBrigade.RouteBrigade', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.routeBrigadeView-routeBrigade',
    border: false,
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
            flex: 1,
            fixed: true

        },
        {
            text: 'Профиль',
            dataIndex: 'profile',
            flex: 1,
            fixed: true
        },
        {
            text: 'Расстояние<br>(км)',
            dataIndex: 'distance',
            flex: 1,
            fixed: true

        },
        {
            text: 'Время<br>доезда<br>(мин)',
            dataIndex: 'time',
            flex: 1,
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
