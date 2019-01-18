Ext.define('Isidamaps.store.BrigadesFirstLoad', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.Brigade',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json'
        }
    }
});
