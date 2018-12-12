Ext.define('Isidamaps.model.InfoBrigade', {
    extend: 'Ext.data.Model',

    fields: [{
        name: 'address',
        mapping: 'brigade.address'
    },
        {
            name: 'brigadeNum',
            mapping: 'brigade.brigadeNum'
        },
        {
            name: 'callCardNum',
            mapping: 'brigade.callCardNum'
        },
        {
            name: 'chefName',
            mapping: 'brigade.chefName'
        },
        {
            name: 'passToBrigadeTime',
            mapping: 'brigade.passToBrigadeTime'
        },
        {
            name: 'status',
            mapping: 'brigade.status'
        },
        {
            name: 'station',
            mapping: 'brigade.station'
        },
        {
            name: 'profile',
            type: 'string',
            convert: function (v, record) {
                function und(v1) {
                    if (typeof(v1) === "undefined") {
                        return " "
                    }
                    return v1
                }
                return und(record.get('profile'))
            }
        }
    ]
});
