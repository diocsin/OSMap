Ext.define('Isidamaps.model.Route', {
    extend: 'Ext.data.Model',
    idProperty: 'brigadeId',
    fields: [{
        name: 'checkBox',
        type: 'boolean'
    }, 'brigadeId', 'brigadeNum', 'profile', 'distance', 'time']
});
