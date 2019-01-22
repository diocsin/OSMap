Ext.define('Isidamaps.services.monitoringView.Monitoring', {
    extend: 'Ext.panel.Panel',
    xtype: 'monitoring',

    requires: ['Isidamaps.view.filterLocalMonitoringView.FilterLocalMonitoringView',
        'Isidamaps.view.filterBrigadeView.FilterBrigadeView',
        'Isidamaps.services.monitoringView.MonitoringController',
        'Isidamaps.services.monitoringView.MapService',
        'Isidamaps.view.clusterView.ClusterInfo',
        'Isidamaps.view.markerView.CallInfoWindow',
        'Isidamaps.view.markerView.BrigadeInfoWindow'
    ],

    controller: 'monitoring',
    layout: 'border',
    items: [{
        xtype: 'panel',
        region: 'east',
        reference: 'BrigadePanel',
        title: 'Бригады',
        publishes: 'size',
        width: 260,
        floatable: true,
        collapsible: true,
        scrollable: 'vertical',
        titleAlign: 'center',
        collapseToolText: 'Скрыть панель',
        expandToolText: 'Открыть панель',

        items: [{

            xtype: 'filterBrigadeView-filterBrigade',
            reference: 'filterBrigade'
        }]
    }, {
        xtype: 'panel',
        region: 'west',
        title: 'Фильтр',
        reference: 'navigationPanel',
        publishes: 'size',
        width: 300,
        floatable: true,
        collapsible: true,
        titleAlign: 'center',
        collapseToolText: 'Скрыть панель',
        expandToolText: 'Открыть панель',
        items: [{
            title: 'Подстанции',
            xtype: 'filterLocalMonitoringView-filterLocalMonitoring',
            reference: 'filterLocal'
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
