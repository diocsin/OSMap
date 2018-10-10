Ext.define('Isidamaps.services.callHistoryView.CallHistoryController', {
    extend: 'Isidamaps.services.monitoringView.MonitoringController',
    alias: 'controller.callhistory',
    CallHistory: null,
    urlGeodata: null,
    listen: {
        global: {
            windowClose: 'windowClose'
        }
    },

    windowClose: function () {
        window.close();
    },

    createMap: function () {
        var me = this;

        me.CallHistory = Ext.create('Isidamaps.services.callHistoryView.MapService', {
            viewModel: me.getViewModel(),
            markerClick: me.markerClick,
            clustersClick: me.clustersClick,
            urlGeodata: me.urlGeodata,
            getStoreMarkerInfo: me.getStoreMarkerInfo
        });
        me.CallHistory.optionsObjectManager();
        me.CallHistory.readMarkers('277364680');
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
