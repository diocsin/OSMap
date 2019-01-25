Ext.define('Isidamaps.services.callHistory.CallHistoryController', {
    extend: 'Isidamaps.services.monitoring.MonitoringController',
    alias: 'controller.callhistory',
    CallHistory: null,

    createMap: function () {
        var me = this;
        me.urlOpenStreetServerTiles = Isidamaps.app.getController('AppController').urlOpenStreetServerTiles;
        me.CallHistory = Ext.create('Isidamaps.services.callHistory.MapService', {
            urlOpenStreetServerTiles: me.urlOpenStreetServerTiles
        });
        me.CallHistory.listenerStore();
        me.CallHistory.optionsObjectManager();
        Isidamaps.app.getController('AppController').readMarkersForCallHistory('104055877');
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
