Ext.define('Isidamaps.view.routeBrigadeView.RouteBrigadeView', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Isidamaps.view.routeBrigadeView.routeBrigade.RouteBrigade'
    ],
    alias: 'widget.routeBrigadeView',
    items: [{
        title: 'RouteBrigade',
        xtype: 'routeBrigadeView-routeBrigade'
    }]
});
