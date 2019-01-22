Ext.define('Isidamaps.services.monitoringBrigadeOnCall.MonitoringBrigadeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.monitoringBrigade',
    MonitoringBrigade: null,
    filterBrigadeArray: [],
    filterCallArray: [],
    urlOpenStreetServerRoute: null,
    urlOpenStreetServerTiles: null,

    mainBoxReady: function () {
        const me = this;
        Ext.defer(me.createMap, 100, me);
    },


    createMap: function () {
        var me = this;
        me.urlOpenStreetServerTiles = Isidamaps.app.getController('GlobalController').urlOpenStreetServerTiles;
        me.urlOpenStreetServerRoute = Isidamaps.app.getController('GlobalController').urlOpenStreetServerRoute;
        me.MonitoringBrigade = Ext.create('Isidamaps.services.monitoringBrigadeOnCall.MapService', {
            filterBrigadeArray: me.filterBrigadeArray,
            filterCallArray: me.filterCallArray,
            urlOpenStreetServerTiles: me.urlOpenStreetServerTiles,
            urlOpenStreetServerRoute: me.urlOpenStreetServerRoute,
        });
        me.MonitoringBrigade.listenerStore();
        me.MonitoringBrigade.optionsObjectManager();
        ASOV.setMapManager({
            setMarkers: me.MonitoringBrigade.setMarkers.bind(this)
        }, Ext.History.currentToken);
        Isidamaps.app.getController('GlobalController').readMarkers('105711138', ['910']);
        var ymapWrapper = me.lookupReference('ymapWrapper');
        ymapWrapper.on('resize', function () {
            me.MonitoringBrigade.resizeMap(me.MonitoringBrigade);
        });

    },

    layoutReady: function () {
        this.fireTabEvent(this.lookupReference('RouteBrigadePanel'));
    },

    tabChange: function (panel, newTab, oldTab) {
        oldTab.fireEvent('tabExit');
        this.fireTabEvent(newTab);
    },

    fireTabEvent: function (tab) {
        tab.fireEvent('tabEnter');
    }
});
