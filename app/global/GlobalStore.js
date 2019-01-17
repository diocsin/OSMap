Ext.define('Isidamaps.global.GlobalStore', {
    extend: 'Ext.data.Store',
    model: 'Isidamaps.model.Property',
    proxy: {
        type: 'ajax',
        url: 'resources/settings/property.json',
        reader: {
            type: 'json'
        }
    }
});
