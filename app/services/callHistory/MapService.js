Ext.define('Isidamaps.services.callHistory.MapService', {
    extend: 'Isidamaps.services.monitoring.MapService',
    callMarker: null,
    brigadeRoute: null,
    factRoute: null,
    brigadesStartPoint: null,
    brigadesEndPoint: null,
    arrRouteForTable: [],
    vectorSourceRoute: null,
    callMarkersFactRoute: [],
    arrayRoute: [],

    constructor: function (options) {
        var me = this;
        me.vectorSource = new ol.source.Vector({});
        me.urlOpenStreetServerTiles = options.urlOpenStreetServerTiles;
        me.map = me.createMap();
        me.clusterOptions();
        me.vectorSourceRoute = new ol.source.Vector({});
        var vectorLayerRoute = new ol.layer.Vector({
            source: me.vectorSourceRoute
        });
        me.map.addLayer(vectorLayerRoute);
        me.map.addLayer(me.vectorLayer);
    },

    checkCreateBouns: function () {
        var me = this;
        if (me.brigadesMarkers.length !== 0 && me.callMarkers.length !== 0) {
            me.createBouns();
        }

        /* if (me.callMarkers.length < 1) {
             Ext.create('Ext.window.MessageBox').show({
                 title: 'Ошибка',
                 message: 'Нет сохраненных маршрутов',
                 icon: Ext.Msg.ERROR,
                 buttons: Ext.Msg.OK
             });
         }*/

        // me.vectorSource.addFeatures(me.brigadesMarkers);
        me.vectorSource.addFeature(feature);


    },

    createPolylineRoute: function (routeList) {
        var me = this;
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
            me.vectorSourceRoute.addFeature(feature);

        });
        me.createTableRoute();

    },

    storeFactRouteHistory: function (records) {
        var me = this;
        var array = [];
        var arrayR = [];
        var i = 0;
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
        me.vectorSourceRoute.addFeature(feature);

    },

    storeFactHistoryBrigade: function (records) {
        var me = this;
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
                me.vectorSource.addFeature(feature);
            }
        });
    },


    storeBrigadeHistory: function (records) {
        var me = this;
        var routeList = null;
        records.forEach(function (b) {
            routeList = Ext.decode(b.get('routeList'));
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
                    me.vectorSource.addFeature(iconFeature);
                }
            })
        });
        me.createPolylineRoute(routeList);
    },

    storeFactHistoryCall: function (records) {
        var me = this;
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
                me.vectorSource.addFeature(iconFeature);
            }
        });
    },


    setMarkers: function (call) {
        Isidamaps.app.getController('AppController').readMarkersForCallHistory(call);
    },

    listenerStore: function () {
        Ext.getStore('Isidamaps.store.CallsFirstLoadStore').on('load', function (store, records, options) {
            this.storeFactHistoryCall(records)
        }, this);
        Ext.getStore('Isidamaps.store.BrigadesFirstLoadStore').on('load', function (store, records, options) {
            this.storeFactHistoryBrigade(records)
        }, this);
        Ext.getStore('Isidamaps.store.RouteHistoryStore').on('load', function (store, records, options) {
            this.storeBrigadeHistory(records)
        }, this);
        Ext.getStore('Isidamaps.store.FactRouteHistoryStore').on('load', function (store, records, options) {
            this.storeFactRouteHistory(records)
        }, this);
    }
    ,
    createTableRoute: function () {
        var me = this,
            store = Ext.getStore('Isidamaps.store.RouteForTableStore');
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