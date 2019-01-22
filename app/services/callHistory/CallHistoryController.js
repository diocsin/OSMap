Ext.define('Isidamaps.services.callHistory.CallHistoryController', {
    extend: 'Isidamaps.services.monitoring.MonitoringController',
    alias: 'controller.callhistory',
    CallHistory: null,
    urlOpenStreetServerTiles: null,



    createMap: function () {
        var me = this;

        me.CallHistory = Ext.create('Isidamaps.services.callHistory.MapService', {
            viewModel: me.getViewModel(),
            markerClick: me.markerClick,
            clustersClick: me.clustersClick,
            urlGeodata: me.urlGeodata,
            getStoreMarkerInfo: me.getStoreMarkerInfo,
            urlOpenStreetServerTiles: me.urlOpenStreetServerTiles
        });
        me.CallHistory.optionsObjectManager();
        ASOV.setMapManager({
            setMarkers: me.CallHistory.setMarkers.bind(this)
        }, Ext.History.currentToken);

        var ymapWrapper = me.lookupReference('ymapWrapper');
        ymapWrapper.on('resize', function () {
            me.CallHistory.resizeMap(me.CallHistory);
        });
    },
    layoutReady: function () {
        this.fireTabEvent(this.lookupReference('navigationPanel'));
    }
});
