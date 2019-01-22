Ext.define('Isidamaps.store.BrigadeFromWebSockedStore', {
    extend: 'Ext.data.Store',
    alias: 'BrigadeFromWebSocked',
    model: 'Isidamaps.model.Brigade',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
