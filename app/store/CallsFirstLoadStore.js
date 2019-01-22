Ext.define('Isidamaps.store.CallsFirstLoadStore', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.Call',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json'
        }
    }
});
