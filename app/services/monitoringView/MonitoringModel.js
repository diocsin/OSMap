Ext.define('Isidamaps.services.monitoringView.MonitoringModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.monitoring',
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
    }
  }
});
