Ext.define('Isidamaps.model.Route', {
    extend: 'Ext.data.Model',
    idProperty: 'brigadeId',
    fields: [{
        name: 'checkBox',
        type: 'boolean'
    },
        {
            name: 'time',
            type: 'number'
        },
        {
            name: 'brigadeNum',
            type: 'number'
        }, {
            name: 'brigadeId'
        },
        {
            name: 'distance',
            type: 'number'
        },
        'profile',]
});