Ext.define('Isidamaps.model.Call', {
    extend: 'Ext.data.Model',
    requires: ['Isidamaps.model.Brigade'],
    fields: ['longitude', 'latitude', 'statusAsov', 'station', 'status', {name: 'callCardId', type: 'int'},
        'callCardNum', 'createTime', 'lastUpdateTime', 'objectType', 'iconName'
    ]
});
