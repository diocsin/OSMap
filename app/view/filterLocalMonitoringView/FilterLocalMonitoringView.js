Ext.define('Isidamaps.view.filterLocalMonitoringView.FilterLocalMonitoringView', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Isidamaps.view.filterLocalMonitoringView.filterLocalMonitoring.FilterLocalMonitoring'
    ],
    alias: 'widget.filterLocalMonitoringView',
    items: [{
        title: 'Фильтр',
        xtype: 'filterLocalMonitoringView-filterLocalMonitoring'
    }]
});
