Ext.define('Isidamaps.store.BrigadeInWebSocked', {
    extend: 'Ext.data.Store',
    id: 'brigadesId',
    model: 'Isidamaps.model.Brigade',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
