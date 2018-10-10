Ext.define('Isidamaps.model.Brigade', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'deviceId', type: 'int'}, 'brigadeNum', 'station', 'longitude', 'latitude',
        'statusAsov', 'status', 'profile', 'timeLocal', 'lastUpdateTime',
        'iconName', 'objectType', 'callCardNum', 'callCardId'
    ],
    idProperty: 'deviceId'

});
