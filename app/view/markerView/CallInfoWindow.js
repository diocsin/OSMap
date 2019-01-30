Ext.define('Isidamaps.view.markerView.CallInfoWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.callInfo',
    controller: 'MarkerController',
    viewModel: true,
    title: 'Вызов',
    layout: 'form',
    autoScroll: true,
    resizable: false,
    width: 540,
    constrain: true,
    items: [{
        xtype: 'callInfoForm'
    }]
});