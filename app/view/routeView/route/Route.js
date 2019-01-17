Ext.define('Isidamaps.view.routeView.route.Route', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.routeView-route',
    border: false,
    title: 'Table Layout',
    bind: '{Routes}',

    viewConfig: {
        markDirty: false
    },

    width: '100%',
    columns: [
        {
            text: ' ',
            dataIndex: 'checkBox',
            xtype: 'checkcolumn',
            listeners: {
                beforecheckchange: function () {
                    Ext.fireEvent('checkedBrigadeForAssign');
                }
            },
            name: 'checkbox_name',
            flex: 1,
            fixed: true
        },
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
                text: 'Назначить и передать',
                listeners: {
                    click: function () {
                        Ext.fireEvent('jsonAnswerReady');
                    }
                }
            }
        ]
    }],
    renderTo: Ext.getBody()
});
