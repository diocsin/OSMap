Ext.define('Isidamaps.services.monitoringBrigadeOnCallView.MonitoringBrigade', {
    extend: 'Ext.panel.Panel',
    xtype: 'monitoringBrigade',

    requires: ['Isidamaps.view.routeBrigadeView.RouteBrigadeView',
        'Isidamaps.services.monitoringBrigadeOnCallView.MonitoringBrigadeController',
        'Isidamaps.services.monitoringBrigadeOnCallView.MapService',
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
            xtype: 'routeBrigadeView-routeBrigade',
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
