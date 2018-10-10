Ext.define('Isidamaps.view.routeHistoryView.RouteHistoryView', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Isidamaps.view.routeHistoryView.routeHistory.RouteHistory'
    ],
    alias: 'widget.routeHistoryView',
    items: [{
        title: 'RouteHistory',
        xtype: 'routeHistoryView-routeHistory'
    }]
});
