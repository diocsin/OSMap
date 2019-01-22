Ext.define('Isidamaps.store.BrigadeInfoStore', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.InfoBrigade',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            rootProperty: 'additionalInfo.brigade'
        }
    }
});