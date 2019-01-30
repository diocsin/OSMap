Ext.define('Isidamaps.services.brigadeForAssign.BrigadeForAssign', {
    extend: 'Ext.panel.Panel',
    xtype: 'brigadesforassign',

    requires: ['Isidamaps.view.routeView.RouteView',
        'Isidamaps.services.brigadeForAssign.BrigadeForAssignController',
        'Isidamaps.services.brigadeForAssign.MapService'
    ],

    controller: 'brigadeforassign',
    layout: 'border',
    items: [{
        xtype: 'panel',
        region: 'west',
        reference: 'navigationPanel',
        publishes: 'size',
        width: 400,
        floatable: true,
        collapsible: true,
        scrollable: 'vertical',
        titleAlign: 'center',
        collapseToolText: 'Скрыть панель',
        expandToolText: 'Открыть панель',

        items: [{
            title: 'Параметры доезда',
            xtype: 'routeView-route'
        }]
    }, {
        xtype: 'container',
        region: 'center',
        reference: 'ymapWrapper',
        id: 'mapId',
        layout: 'container',
        listeners: {
            'boxready': 'mainBoxReady'
        }
    }],
    listeners: {
        'boxready': 'layoutReady'
    }
});
