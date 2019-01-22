Ext.define('Isidamaps.services.callHistory.MapService', {
    extend: 'Isidamaps.services.monitoring.MapService',
    map: null,
    callMarker: null,
    callMarkers: [],
    brigadeRoute: null,
    brigadesMarkers: [],
    viewModel: null,
    factRoute: null,
    vectorSource: null,
    vectorLayer: null,
    brigadesStartPoint: null,
    brigadesEndPoint: null,
    urlGeodata: null,
    urlOpenStreetServerTiles: null,
    arrRouteForTable: [],
    callMarkersFactRoute: [],
    arrayRoute: [],
    // ====
    markerClick: Ext.emptyFn,
    // ====

    constructor: function (options) {
        var me = this;
        me.vectorSource = new ol.source.Vector({});
        me.urlOpenStreetServerTiles = options.urlOpenStreetServerTiles;
        me.markerClick = options.markerClick;
        me.clustersClick = options.clustersClick;
        me.viewModel = options.viewModel;
        me.getStoreMarkerInfo = options.getStoreMarkerInfo;
        me.urlGeodata = options.urlGeodata;
        me.map = new ol.Map({
            target: 'mapId',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: me.urlOpenStreetServerTiles + '/{z}/{x}/{y}.png',
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
    },

    createBouns: function () {
        var me = this,
            arrayLatitude = [],
            arrayLongitude = [],
            call = me.callMarkers[0];

        var coord = call.getGeometry().getCoordinates();
        var lon = coord[0];
        var lat = coord[1];
        arrayLatitude.push(lon);
        arrayLongitude.push(lat);

        me.brigadesMarkers.forEach(function (brigade) {
            var coord = brigade.getGeometry().getCoordinates();
            var lon = coord[0];
            var lat = coord[1];
            arrayLatitude.push(lon);
            arrayLongitude.push(lat);
        });
        arrayLatitude.sort(function (a, b) {
            return a - b
        });
        arrayLongitude.sort(function (a, b) {
            return a - b
        });
        me.map.getView().fit([arrayLatitude[0] - 50, arrayLongitude[0], arrayLatitude[arrayLatitude.length - 1], arrayLongitude[arrayLongitude.length - 1]], me.map.getSize(), false);
    },

    createMarkers: function () {
        var me = this;

        if (me.brigadesMarkers.length !== 0 && me.callMarkers.length !== 0) {
            me.createBouns();
        }
        if (me.callMarkers.length === 0) {
            Ext.create('Ext.window.MessageBox').show({
                title: 'Ошибка',
                message: 'Нет сохраненных маршрутов',
                icon: Ext.Msg.ERROR,
                buttons: Ext.Msg.OK
            });
        }
        me.callMarkerFactRoute.load(function (records) {
            records.forEach(function (call) {
                if (call.get('latitude') !== undefined && call.get('longitude') !== undefined) {
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat([call.get('longitude'), call.get('latitude')])),
                        id: call.get('callCardId'),
                        customOptions: {
                            objectType: call.get('objectType'),
                            status: call.get('status'),
                            callCardNum: call.get('callCardNum')
                        },
                        options: {
                            iconImageHref: 'resources/icon/new.png'
                        }
                    });
                    iconFeature.setStyle(me.iconStyle(iconFeature));

                    me.callMarkersFactRoute.push(iconFeature);
                    me.vectorSource.addFeatures(me.callMarkersFactRoute);

                }
            });

        });

        me.vectorSource.addFeatures(me.brigadesMarkers);
        // me.vectorSource.addFeatures(me.callMarkers);
        me.clusterOptions();
        var vectorSourceRoute = new ol.source.Vector({
            features: me.arrayRoute
        });
        var vectorLayerRoute = new ol.layer.Vector({
            source: vectorSourceRoute
        });
        me.map.addLayer(vectorLayerRoute);
        me.map.addLayer(me.vectorLayer);

    },

    createPolylineRoute: function () {
        var me = this;
        me.brigadeRoute.load(function (records) {
            records.forEach(function (b) {
                var routeList = Ext.decode(b.get('routeList'));
                me.arrRouteForTable = routeList;
                var array = [];
                var arrayR = [];
                var i = 0;
                routeList.forEach(function (routes) {
                    routes.route.forEach(function (l) {
                        if (i < 2) {
                            array.push(l);

                        }
                        else {
                            arrayR.push(array);
                            array = [];
                            array.push(l);
                            i = 0;
                        }
                        i++;
                    });
                    arrayR.push(array);
                    array = [];
                    i = 0;
                    var polyline = new ol.geom.LineString(arrayR);

                    // polyline.transform('EPSG:4326','EPSG:3857');
                    var feature = new ol.Feature({
                        geometry: polyline,
                        customOptions: {
                            objectType: 'route',
                            brigadeNum: routes.brigadeNum,
                        }
                    });
                    var styles = {
                        route: new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                width: 4, color: [255, 0, 0, 0.8]
                            })
                        })
                    };

                    feature.setStyle(styles.route);
                    me.arrayRoute.push(feature);
                    arrayR = [];

                });
            });
            me.createTableRoute();

        })
    },

    createPolylineFactRoute: function () {

        var me = this;
        var array = [];
        var arrayR = [];
        var i = 0;
        me.factRoute.load(function (records) {
            records.forEach(function (l) {

                arrayR.push([l.data.longitude, l.data.latitude]);

            });
            i = 0;
            var polyline = new ol.geom.LineString(arrayR);
            polyline.transform('EPSG:4326', 'EPSG:3857');
            var feature = new ol.Feature({
                geometry: polyline,
                customOptions: {
                    objectType: 'route',
                    brigadeNum: '',
                }
            });
            var styles = {
                route: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        width: 4, color: [38, 0, 252, 1]
                    })
                })
            };

            feature.setStyle(styles.route);
            me.arrayRoute.push(feature);


        });
    },

    to4326: function (coord) {
        return ol.proj.transform([
            parseFloat(coord[1]), parseFloat(coord[0])
        ], 'EPSG:3857', 'EPSG:4326');
    },

    createRouteForCalls: function () {
        var me = this;

        me.brigadesEndPoint.load(function (records) {
            records.forEach(function (brigade) {
                if (brigade.get('latitude') !== undefined && brigade.get('longitude') !== undefined) {
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat([brigade.get('longitude'), brigade.get('latitude')])),
                        id: brigade.get('deviceId'),
                        customOptions: {
                            objectType: brigade.get('objectType'),
                            profile: brigade.get('profile'),
                            brigadeNum: brigade.get('brigadeNum'),
                            station: brigade.get('station')
                        },
                        options: {
                            iconImageHref: 'resources/icon/' + brigade.get('iconName')
                        }
                    });

                    iconFeature.setStyle(me.iconStyle(iconFeature));
                    me.brigadesMarkers.push(iconFeature);
                }
            });
            me.brigadesStartPoint.load(function (records) {
                records.forEach(function (brigade) {

                    if (brigade.get('latitude') !== undefined && brigade.get('longitude') !== undefined) {
                        var iconFeature = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([brigade.get('longitude'), brigade.get('latitude')])),
                            id: brigade.get('deviceId'),
                            customOptions: {
                                objectType: brigade.get('objectType'),
                                profile: brigade.get('profile'),
                                brigadeNum: brigade.get('brigadeNum'),
                                station: brigade.get('station')
                            },
                            options: {
                                iconImageHref: 'resources/icon/' + brigade.get('iconName')
                            }
                        });
                        iconFeature.setStyle(me.iconStyle(iconFeature));
                        me.brigadesMarkers.push(iconFeature);
                    }
                });
                me.brigadeRoute.load(function (records) {
                    records.forEach(function (b) {
                        var routeList = Ext.decode(b.get('routeList'));
                        routeList.forEach(function (brigade) {

                            if (brigade.latitude !== undefined && brigade.longitude !== undefined) {
                                var iconFeature = new ol.Feature({
                                    geometry: new ol.geom.Point(ol.proj.fromLonLat(me.to4326([brigade.longitude, brigade.latitude]))),
                                    id: brigade.brigadeId,
                                    customOptions: {
                                        objectType: brigade.objectType,
                                        brigadeNum: brigade.brigadeNum,
                                        profile: brigade.profile,
                                        station: brigade.station
                                    },
                                    options: {
                                        iconImageHref: 'resources/icon/free.png'
                                    }
                                });
                                iconFeature.setStyle(me.iconStyle(iconFeature));
                                me.brigadesMarkers.push(iconFeature);
                            }
                        })
                    });

                    me.createMarkers();
                });
            });
        });
    },

    setMarkers: function (call) {
        this.CallHistory.readMarkers(call);
    },

    readMarkers: function (call) {
        var me = this,
            urlRouteList = Ext.String.format(me.urlGeodata + '/route?callcardid={0}', call),
            urlFactRouteList = Ext.String.format(me.urlGeodata + '/route/fact?callcardid={0}', call);
        me.brigadeRoute = Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.RouteHistory',
            proxy: {
                type: 'ajax',
                url: urlRouteList,
                reader: {
                    type: 'json',
                    rootProperty: 'brigadeRoute'
                }
            },
            autoLoad: false
        });
        me.callMarker = Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.Call',
            proxy: {
                type: 'ajax',
                url: urlRouteList,
                reader: {
                    type: 'json',
                    rootProperty: 'call'
                }
            },
            autoLoad: false
        });
        me.factRoute = Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.FactRoute',
            proxy: {
                type: 'ajax',
                url: urlFactRouteList,
                reader: {
                    type: 'json',
                    rootProperty: 'points'
                }
            },
            autoLoad: false
        });
        me.brigadesStartPoint = Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.Brigade',
            proxy: {
                type: 'ajax',
                url: urlFactRouteList,
                reader: {
                    type: 'json',
                    rootProperty: 'startPoint'
                }
            },
            autoLoad: false
        });

        me.brigadesEndPoint = Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.Brigade',
            proxy: {
                type: 'ajax',
                url: urlFactRouteList,
                reader: {
                    type: 'json',
                    rootProperty: 'endPoint'
                }
            },
            autoLoad: false
        });
        me.callMarkerFactRoute = Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.Call',
            proxy: {
                type: 'ajax',
                url: urlFactRouteList,
                reader: {
                    type: 'json',
                    rootProperty: 'call'
                }
            },
            autoLoad: false
        });

        me.callMarker.load(function (records) {
            records.forEach(function (call) {
                if (call.get('latitude') !== undefined && call.get('longitude') !== undefined) {
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat([call.get('longitude'), call.get('latitude')])),
                        id: call.get('callCardId'),
                        customOptions: {
                            objectType: call.get('objectType'),
                            status: call.get('status'),
                            callCardNum: call.get('callCardNum')
                        },
                        options: {
                            iconImageHref: 'resources/icon/' + call.get('iconName')
                        }

                    });

                    iconFeature.setStyle(me.iconStyle(iconFeature));
                    me.callMarkers.push(iconFeature);
                }
            });
            me.createPolylineFactRoute();
            me.createRouteForCalls();
            me.createPolylineRoute();

        });
    },

    createTableRoute: function () {
        var me = this,
            store = me.viewModel.getStore('Route');

        me.arrRouteForTable.forEach(function (object) {
            var x = Ext.create('Isidamaps.model.Route');
            x.set('brigadeId', object.brigadeId);
            x.set('brigadeNum', object.brigadeNum);
            x.set('profile', object.profile);
            x.set('distance', object.distance);
            x.set('time', object.time);
            store.add(x);
        });
    }
});