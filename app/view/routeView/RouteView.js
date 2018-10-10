Ext.define('Isidamaps.view.routeView.RouteView', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Isidamaps.view.routeView.route.Route'
    ],
    alias: 'widget.routeView',
    items: [{
        title: 'Route',
        xtype: 'routeView-route'
    }]
});
