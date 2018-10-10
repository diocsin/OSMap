Ext.define('Isidamaps.view.filterBrigadeView.FilterBrigadeView', {
    extend: 'Ext.tab.Panel',
    requires: [
        'Isidamaps.view.filterBrigadeView.filterBrigade.FilterBrigade'
    ],
    alias: 'widget.filterBrigadeView',
    items: [{

        xtype: 'filterBrigadeView-filterBrigade'
    }]
});
