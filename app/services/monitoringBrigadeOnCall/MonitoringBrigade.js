Ext.define('Isidamaps.services.monitoringBrigadeOnCall.MonitoringBrigade', {
    extend: 'Ext.panel.Panel',
    xtype: 'monitoringBrigade',

        requires: ['Isidamaps.view.routeHistoryView.RouteHistoryView',
        'Isidamaps.services.monitoringBrigadeOnCall.MonitoringBrigadeController',
        'Isidamaps.services.monitoringBrigadeOnCall.MapService',
        'Isidamaps.view.clusterView.ClusterInfo',
        'Isidamaps.view.markerView.CallInfoWindow',
        'Isidamaps.view.markerView.BrigadeInfoWindow'
    ],

    controller: 'monitoringBrigade',
    layout: 'border',
    items: [{
        xtype: 'panel',
        region: 'west',
        reference: 'RouteBrigadePanel',
        title: 'Маршрут бригады',
        publishes: 'size',
        width: 350,
        floatable: true,
        collapsible: true,
        scrollable: 'vertical',
        titleAlign: 'center',
        collapseToolText: 'Скрыть панель',
        expandToolText: 'Открыть панель',

        items: [{
            title: 'Параметры доезда',
            xtype: 'routeHistoryView-routeHistory',
        }]
    },  {
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
