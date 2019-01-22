Ext.define('Isidamaps.store.BrigadesFirstLoadStore', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.Brigade',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json'
        }
    }
});