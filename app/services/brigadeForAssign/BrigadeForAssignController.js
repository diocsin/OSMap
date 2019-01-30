Ext.define('Isidamaps.services.brigadeForAssign.BrigadeForAssignController', {
    extend: 'Isidamaps.services.monitoring.MonitoringController',
    alias: 'controller.brigadeforassign',
    BrigadeForAssign: null,
    listen: {
        global: {
            jsonAnswerReady: 'buttonCheked',
            checkedBrigadeForAssign: 'checkedBrigadeForAssign'
        }
    },

    checkedBrigadeForAssign: function () {
        const store =Ext.getStore('Isidamaps.store.RouteForTableStore');
        store.each(function (rec) {
            rec.set('checkBox', false);
        })
    },

    createMap: function () {
        const me = this,
        ymapWrapper = me.lookupReference('ymapWrapper');
        me.urlOpenStreetServerTiles = Isidamaps.app.getController('AppController').urlOpenStreetServerTiles;
        me.urlOpenStreetServerRoute = Isidamaps.app.getController('AppController').urlOpenStreetServerRoute;
        me.BrigadeForAssign = Ext.create('Isidamaps.services.brigadeForAssign.MapService', {
            urlOpenStreetServerRoute: me.urlOpenStreetServerRoute,
            urlOpenStreetServerTiles: me.urlOpenStreetServerTiles,
        });
        me.BrigadeForAssign.listenerStore();
        me.BrigadeForAssign.optionsObjectManager();
        Isidamaps.app.getController('AppController').readMarkersBrigadeForAssign('106198579', ['910','951','920']);
        ASOV.setMapManager({
            setMarkers: me.BrigadeForAssign.setMarkers.bind(this)
        }, Ext.History.currentToken);
        ymapWrapper.on('resize', function () {
            me.BrigadeForAssign.resizeMap(me.BrigadeForAssign);
        })
    },

    buttonCheked: function () {
        this.BrigadeForAssign.createAnswer();
    },

    layoutReady: function () {
        this.fireTabEvent(this.lookupReference('navigationPanel'));
    }
});
