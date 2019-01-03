Ext.define('Isidamaps.services.monitoringView.CallInfoView', {
    extend: 'Ext.window.Window',
    alias: 'widget.callInfo',
    viewModel: true,
    title: 'Вызов',
    layout: 'form',
    border: 'fit',
    autoScroll: true,
    resizable: false,
    width: 500,
    constrain: true,
    items: [{
        xtype: 'callInfoForm'
    }]
});