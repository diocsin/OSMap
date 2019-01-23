Ext.define('Isidamaps.view.routeHistoryView.routeHistory.RouteHistory', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.routeHistoryView-routeHistory',
    border: false,
    store: 'Isidamaps.store.RouteForTableStore',

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
                       Isidamaps.app.getController('GlobalController').windowClose();
                    }
                }
            }
        ]
    }],
    renderTo: Ext.getBody()
});
