Ext.define('Isidamaps.global.GlobalController', {
    extend: 'Ext.app.Controller',
    id: 'GlobalController',
    urlGeodata: null,
    urlWebSocket: null,
    urlOpenStreetServerTiles: null,
    urlOpenStreetServerRoute: null,
    brigadeStatusesMap: (function () {
        const map = Ext.create('Ext.util.HashMap');
        map.add('FREE', 'Свободна');
        map.add('ON_EVENT', 'Дежурство на мероприятии');
        map.add('WITHOUT_SHIFT', 'Вне графика');
        map.add('CRASH_CAR', 'Ремонт');
        map.add('PASSED_BRIGADE', 'Принял вызов');
        map.add('AT_CALL', 'На вызове');
        map.add('RELAXON', 'Обед');
        map.add('GO_HOSPITAL', 'Транспортировка в стационар');
        map.add('HIJACKING', 'Нападение на бригаду');
        return map;
    })(),

    init: function () {
        const me = this,
            settingsStore = me.getStore('Isidamaps.global.GlobalStore');
        settingsStore.load({
            callback: function (records) {
                const settings = records[0];
                me.urlGeodata = settings.get('urlGeodata');
                me.urlWebSocket = settings.get('urlWebSocket');
                me.urlOpenStreetServerRoute = settings.get('urlOpenStreetServerRoute');
                me.urlOpenStreetServerTiles = settings.get('urlOpenStreetServerTiles');
            }
        })
    },

    getStoreMarkerInfo: function (object) {
        const me = this,
            urlInfoMarker = me.urlGeodata + '/info';
        if (object.getProperties().customOptions.objectType === 'BRIGADE') {
            return Ext.create('Ext.data.Store', {
                model: 'Isidamaps.model.InfoBrigade',
                proxy: {
                    type: 'ajax',
                    url: urlInfoMarker,
                    reader: {
                        type: 'json',
                        rootProperty: 'additionalInfo.brigade'
                    }
                },
                autoLoad: false
            });
        }

        if (object.getProperties().customOptions.objectType === 'CALL') {
            return Ext.create('Ext.data.Store', {
                model: 'Isidamaps.model.InfoCall',
                proxy: {
                    type: 'ajax',
                    url: urlInfoMarker,
                    reader: {
                        type: 'json',
                        rootProperty: 'additionalInfo.call'
                    }
                },
                autoLoad: false
            });
        }
    },
});