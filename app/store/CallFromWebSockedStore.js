Ext.define('Isidamaps.store.CallFromWebSockedStore', {
    extend: 'Ext.data.Store',
    alias: 'CallFromWebSocked',
    model: 'Isidamaps.model.Call',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});