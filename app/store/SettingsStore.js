Ext.define('Isidamaps.store.SettingsStore', {
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
