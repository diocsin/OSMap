Ext.define('Isidamaps.store.FactRouteHistoryStore', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.FactRoute',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            rootProperty: 'points'
        }
    }
});