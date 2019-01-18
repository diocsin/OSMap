Ext.define('Isidamaps.global.GlobalController', {
    extend: 'Ext.app.Controller',
    id: 'GlobalController',
    urlGeodata: null,
    urlWebSocket: null,
    stationArray: [],
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
            settingsStore = me.getStore('Isidamaps.store.SettingsStore');
        settingsStore.load({
            callback: function (records) {
                const settings = records[0];
                me.urlGeodata = settings.get('urlGeodata');
                me.urlWebSocket = settings.get('urlWebSocket');
                me.urlOpenStreetServerRoute = settings.get('urlOpenStreetServerRoute');
                me.urlOpenStreetServerTiles = settings.get('urlOpenStreetServerTiles');
            }
        });
    },

    connect: function () {
        const me = this,
            socket = new SockJS(me.urlWebSocket + '/geo');
        me.stompClient = Stomp.over(socket);
        me.stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                me.stompClient.subscribe('/geo-queue/geodata-updates', function (msg) {
                    console.dir(msg);
                    me.loadSocketData(JSON.parse(msg.body));
                });
            }.bind(me),
            function (e) {
                console.error(e, "Reconnecting WS");
                Ext.defer(me.connect, 2500, me);
            }.bind(me)
        );
    },

    loadSocketData: function (message) {
        const me = this;
        console.dir(message);
        message.station = '' + message.station;
        if (me.stationArray.indexOf(message.station) === -1) {
            return;
        }
        const store = me.getViewModel().getStore(message.objectType === 'BRIGADE' ? 'Brigades' : 'Calls');
        store.add(message);
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
    readStation: function (station) {
        const me = this,
            brigadeStore = me.getStore('Isidamaps.store.BrigadesFirstLoad'),
            callStore = me.getStore('Isidamaps.store.CallsFirstLoad');
        station.forEach(function (st) {
            me.stationArray.push(Ext.String.trim(st));
        });
        const paramsBrigades = {
            stations: me.stationArray,
            statuses: ''
        };
        const paramsCalls = {
            stations: me.stationArray,
            statuses: ['NEW', 'ASSIGNED']
        };
        brigadeStore.load({
            url: Ext.String.format(me.urlGeodata + '/data'),
            params: paramsBrigades,
        });
        callStore.load({
            url: Ext.String.format(me.urlGeodata + '/call'),
            params: paramsCalls,
        });
        me.connect();
    }
});