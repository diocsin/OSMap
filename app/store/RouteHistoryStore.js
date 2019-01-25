Ext.define('Isidamaps.store.RouteHistoryStore', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.RouteHistory',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            rootProperty: 'brigadeRoute'
        }
    }
});