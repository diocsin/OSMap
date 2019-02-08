Ext.define('Isidamaps.services.monitoringBrigadeOnCall.MonitoringBrigadeController', {
    extend: 'Isidamaps.services.monitoring.MonitoringController',
    alias: 'controller.monitoringBrigade',
    MonitoringBrigade: null,

    createMap: function () {
        const me = this;
        Isidamaps.app.getController('AppController').initial(f);

        function f() {
            me.urlOpenStreetServerTiles = Isidamaps.app.getController('AppController').urlOpenStreetServerTiles;
            me.urlOpenStreetServerRoute = Isidamaps.app.getController('AppController').urlOpenStreetServerRoute;
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
            Isidamaps.app.getController('AppController').readMarkers('105711138', ['910']);
            const ymapWrapper = me.lookupReference('ymapWrapper');
            ymapWrapper.on('resize', function () {
                me.MonitoringBrigade.resizeMap(me.MonitoringBrigade);
            });
        }
    },

    layoutReady: function () {
        this.fireTabEvent(this.lookupReference('RouteBrigadePanel'));
    }

});
