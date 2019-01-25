Ext.define('Isidamaps.store.FactRouteHistoryStore', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.FactRoute',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
        }
    }
});