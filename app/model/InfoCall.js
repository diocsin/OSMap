Ext.define('Isidamaps.model.InfoCall', {
    extend: 'Ext.data.Model',

    fields: [{
        name: 'brigadeNum',
        mapping: 'call.brigadeNum'
    },
        {
            name: 'callCardNum',
            mapping: 'call.callCardNum'
        },
        {
            name: 'createTime',
            type: 'date',
            mapping: 'call.createTime'
        },
        {
            name: 'regBeginTime',
            type: 'date',
            mapping: 'call.regBeginTime'
        },
        {
            name: 'brigadeAssignTime',
            type: 'date',
            mapping: 'call.brigadeAssignTime'
        },
        {
            name: 'brigadeArrivalTime',
            type: 'date',
            mapping: 'call.brigadeArrivalTime'
        },
        {
            name: 'enter',
            convert: function (v, record) {
                function und(v1) {
                    if (typeof(v1) === "undefined") {
                        return " "
                    }
                    return v1
                }

                return und(record.get('addrComment')) + ', подъезд:' + und(record.get('porchNumber')) +
                    ', этаж:' + und(record.get('floor')) + ', домофон:' + und(record.get('keyCode')) +
                    ', ' + und(record.get('enter')) + ', ' + und(record.get('place'))
            }
        },
        {
            name: 'fullName',
            convert: function (v, record) {
                function und(v1) {
                    if (typeof(v1) === "undefined") {
                        return " "
                    }
                    return v1
                }
                return record.get('lastName') + ' ' + record.get('firstName') + ' ' + record.get('secondName') +
                    ',  Возраст: ' + und(record.get('age')) + ',  Пол: ' + und(record.get('sex'))
            }
        },

        {
            name: 'hospital',
            mapping: 'call.hospital'
        },
        {
            name: 'address',
            type: 'string',
            convert: function (v, record) {
                function und(v1) {
                    if (typeof(v1) === "undefined") {
                        return " "
                    }
                    return v1
                }

                return und(record.get('streetName')) + '/' + und(record.get('crossroadStreetName')) +
                    ', д.' + und(record.get('houseNumber')) + ', корп.' + und(record.get('corpus')) +
                    ', кв.' + und(record.get('flatNumber'))
            }
        },

        {
            name: 'phone',
            mapping: 'call.phone'
        },
        {
            name: 'reason',
            mapping: 'call.reason'
        },
        {
            name: 'reasonComment',
            mapping: 'call.reasonComment'
        },
        {
            name: 'streetType',
            mapping: 'call.streetType'
        }

    ],
    storeId: 'infoCallId'
});
