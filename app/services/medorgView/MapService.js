Ext.define('Isidamaps.services.medorgView.MapService', {
    extend: 'Isidamaps.services.monitoringView.MapService',
    map: null,
    viewModel: null,
    medorgMarkers: [],
    medorgStore: null,
    urlGeodata: null,
    vectorSource: null,
    // ====
    markerClick: Ext.emptyFn,
    clustersClick: Ext.emptyFn,
    getStoreMarkerInfo: Ext.emptyFn,
    // ====
    constructor: function (options) {
        var me = this;
        me.map = new ol.Map({
            target: 'mapId',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: 'http://192.168.1.154/hot/{z}/{x}/{y}.png',
                        maxZoom: 19,
                        crossOrigin: null
                    })
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([27.5458, 53.8939]),
                zoom: 12
            })
        });
        me.markerClick = options.markerClick;
        me.clustersClick = options.clustersClick;
        me.viewModel = options.viewModel;
        me.urlGeodata = options.urlGeodata;
        me.getStoreMarkerInfo = options.getStoreMarkerInfo;

    },

    addMarkers: function () {
        var me = this;
        me.vectorSource = new ol.source.Vector({
            features: me.medorgMarkers,
        });
        me.clusterOptions();

        me.map.addLayer(me.vectorLayer);
    },

    readMarkers: function () {
        var me = this,
            urlArray = [],
            urlHospital = Ext.String.format(me.urlGeodata + '/organization?organizationtype=HOSPITAL'),
            urlPolyclinic = Ext.String.format(me.urlGeodata + '/organization?organizationtype=POLYCLINIC'),
            urlEmergencyRoom = Ext.String.format(me.urlGeodata + '/organization?organizationtype=EMERGENCY_ROOM');
        urlArray.push(urlHospital, urlPolyclinic, urlEmergencyRoom);
        urlArray.forEach(function (url) {
            me.medorgStore = Ext.create('Ext.data.Store', {
                model: 'Isidamaps.model.Medorg',
                proxy: {
                    type: 'ajax',
                    url: url,
                    reader: {
                        type: 'json',
                        messageProperty: 'msjError'
                    }
                },
                autoLoad: false
            });
            me.medorgStore.load(function (records) {
                records.forEach(function (medorg) {
                    if (medorg.get('latitude') !== undefined && medorg.get('longitude') !== undefined) {
                        var iconFeature = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([medorg.get('longitude') - 2.8, medorg.get('latitude') - 6.05])),
                            id: medorg.get('organizationId'),
                            customOptions: {
                                objectType: medorg.get('objectType'),
                                organizationName: medorg.get('organizationName')
                            },
                            options: {
                                iconImageHref: 'resources/icon/' + medorg.get('iconName')
                            },
                            properties: {
                                hintContent: medorg.get('organizationName')
                            }
                        });
                        me.medorgMarkers.push(iconFeature);
                    }
                });

            });
        });

        var timeout = setInterval(function () {
            if (me.medorgMarkers.length !== 0) {
                clearInterval(timeout);
                me.addMarkers();
            }
        }, 100);

    }
});
