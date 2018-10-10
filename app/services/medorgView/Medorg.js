Ext.define('Isidamaps.services.medorgView.Medorg', {
    extend: 'Ext.panel.Panel',
    xtype: 'medorg',

    requires: [
        'Isidamaps.services.medorgView.MedorgController',
        'Isidamaps.services.medorgView.MapService',
        'Isidamaps.services.medorgView.MedorgModel'
    ],

    controller: 'medorg',
    viewModel: 'medorg',
    layout: 'border',
    items: [{
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
