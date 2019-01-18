Ext.define('Isidamaps.store.CallsFirstLoad', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.Call',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json'
        }
    }
});
