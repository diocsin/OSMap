Ext.define('Isidamaps.services.callHistoryView.CallHistory', {
    extend: 'Ext.panel.Panel',
    xtype: 'callhistory',

    requires: ['Isidamaps.view.routeHistoryView.RouteHistoryView',
        'Isidamaps.services.callHistoryView.CallHistoryController',
        'Isidamaps.services.callHistoryView.MapService',
        'Isidamaps.services.callHistoryView.CallHistoryModel'
    ],

    controller: 'callhistory',
    viewModel: 'callhistory',
    layout: 'border',
    items: [{
        xtype: 'panel',
        region: 'west',
        reference: 'navigationPanel',
        publishes: 'size',
        width: 400,
        floatable: true,
        collapsible: true,
        titleAlign: 'center',
        collapseToolText: 'Скрыть панель',
        expandToolText: 'Открыть панель',

        items: [{
            title: 'Параметры доезда',
            xtype: 'routeHistoryView-routeHistory'
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
