Ext.define('Isidamaps.services.monitoringBrigadeOnCallView.MonitoringBrigadeModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.monitoringBrigade',
    stores: {
        Calls: {
            id: 'callsId',
            model: 'Isidamaps.model.Call',
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            },
            autoLoad: false
        },

        Brigades: {
            id: 'brigadesId',
            model: 'Isidamaps.model.Brigade',
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json'
                }
            },
            autoLoad: false
        },

        Property: {
            model: 'Isidamaps.model.Property',
            proxy: {
                type: 'ajax',
                url: 'resources/settings/property.json',
                reader: {
                    type: 'json'
                }
            },
            autoLoad: false
        },
        Route: {
            proxy: {
                type: 'memory'
            }
        }
    },

});
