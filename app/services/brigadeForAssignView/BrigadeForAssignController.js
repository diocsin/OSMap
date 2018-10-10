Ext.define('Isidamaps.services.brigadeForAssignView.BrigadeForAssignController', {
    extend: 'Isidamaps.services.monitoringView.MonitoringController',
    alias: 'controller.brigadeforassign',
    BrigadeForAssign: null,
    urlGeodata: null,
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
        var me = this;
        me.BrigadeForAssign = Ext.create('Isidamaps.services.brigadeForAssignView.MapService', {
            viewModel: me.getViewModel(),
            markerClick: me.markerClick,
            clustersClick: me.clustersClick,
            urlGeodata: me.urlGeodata,
            getStoreMarkerInfo: me.getStoreMarkerInfo
        });
        me.BrigadeForAssign.readMarkers(12,['277343750','277361257']);
        ASOV.setMapManager({
            setMarkers: me.BrigadeForAssign.setMarkers.bind(this)
        }, Ext.History.currentToken);
        var ymapWrapper = me.lookupReference('ymapWrapper');
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
