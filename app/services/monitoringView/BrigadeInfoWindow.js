Ext.define('Isidamaps.services.monitoringView.BrigadeInfoWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.brigadeInfoWindow',
    viewModel: true,
    title: 'Бригада',
    layout: 'form',
    border: 'fit',
    autoScroll: true,
    resizable: false,
    width: 500,
    constrain: true,
    items: [{
        xtype: 'brigadeInfoForm'
    }]
});