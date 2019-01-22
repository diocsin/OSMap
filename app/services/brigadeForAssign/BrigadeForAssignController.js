Ext.define('Isidamaps.services.brigadeForAssign.BrigadeForAssignController', {
    extend: 'Isidamaps.services.monitoring.MonitoringController',
    alias: 'controller.brigadeforassign',
    BrigadeForAssign: null,
    urlGeodata: null,
    urlOpenStreetServerRoute: null,
    urlOpenStreetServerTiles: null,
    listen: {
        global: {
            jsonAnswerReady: 'buttonCheked',
            checkedBrigadeForAssign: 'checkedBrigadeForAssign'
        }
    },

    checkedBrigadeForAssign: function () {
        var me = this,
            store = me.getViewModel().getStore('Routes');
        store.each(function (rec) {
            rec.set('checkBox', false);
        })
    },

    createMap: function () {
        const me = this,
            viewModel = me.getViewModel(),
            settingsStore = viewModel.getStore('Settings');
        settingsStore.load({
            callback: function (records) {
                const settings = records[0];
                me.urlGeodata = settings.get('urlGeodata');
                me.urlWebSocket = settings.get('urlWebSocket');
                me.urlOpenStreetServerRoute = settings.get('urlOpenStreetServerRoute');
                me.urlOpenStreetServerTiles = settings.get('urlOpenStreetServerTiles');
                me.connect();
                me.BrigadeForAssign = Ext.create('Isidamaps.services.brigadeForAssign.MapService', {
                    viewModel: me.getViewModel(),
                    markerClick: me.markerClick,
                    clustersClick: me.clustersClick,
                    urlGeodata: me.urlGeodata,
                    getStoreMarkerInfo: me.getStoreMarkerInfo,
                    urlOpenStreetServerRoute: me.urlOpenStreetServerRoute,
                    urlOpenStreetServerTiles: me.urlOpenStreetServerTiles,
                });
                ASOV.setMapManager({
                    setMarkers: me.BrigadeForAssign.setMarkers.bind(this)
                }, Ext.History.currentToken);
                var ymapWrapper = me.lookupReference('ymapWrapper');
                ymapWrapper.on('resize', function () {
                    me.BrigadeForAssign.resizeMap(me.BrigadeForAssign);
                })
            }
            })
    },

    buttonCheked: function () {
        this.BrigadeForAssign.createAnswer();
    },
    layoutReady: function () {
        this.fireTabEvent(this.lookupReference('navigationPanel'));
    }
});
