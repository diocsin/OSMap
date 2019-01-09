Ext.define('Isidamaps.services.monitoringView.ClusterInfoView', {
    extend: 'Ext.window.Window',
    alias: 'widget.clusterInfo',
    title: 'Кластер',
    constrain: true,
    layout: 'hbox',
    resizable: false,
    border: 'fit',
    width: 750,
    height: 480,
    scrollable: 'vertical',
    referenceHolder: true,
    items: [{
        xtype: 'panel',
        reference: 'buttonsHolder',
        autoScroll: true,
        layout: 'vbox',
        height: '100%',
        width: '25%'
    }, {
        xtype: 'panel',
        reference: 'infoHolder',
        autoScroll: true,
        height: '100%',
        width: '75%'
    }]
});