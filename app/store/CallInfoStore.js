Ext.define('Isidamaps.store.CallInfoStore', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.InfoCall',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            rootProperty: 'additionalInfo.call'
        }
    }
});