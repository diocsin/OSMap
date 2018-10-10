Ext.define('Isidamaps.model.RouteHistory', {
    extend: 'Ext.data.Model',
    fields: ['callCardId', 'lastUpdateTime', {name: 'routeList', type: 'string'}],
    idProperty: 'callCardId'
});
