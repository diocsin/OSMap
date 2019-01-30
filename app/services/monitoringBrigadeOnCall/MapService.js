Ext.define('Isidamaps.services.monitoringBrigadeOnCall.MapService', {
    extend: 'Isidamaps.services.monitoring.MapService',
    brigadeId: null,
    callId: null,
    arrRouteForTable: [],

    constructor: function (options) {
        const me = this;
        me.vectorSource = new ol.source.Vector({});
        me.filterBrigadeArray = options.filterBrigadeArray;
        me.filterCallArray = options.filterCallArray;
        me.urlOpenStreetServerTiles = options.urlOpenStreetServerTiles;
        me.urlOpenStreetServerRoute = options.urlOpenStreetServerRoute;
        me.map = me.createMap();
        me.clusterOptions();
        me.map.addLayer(me.vectorLayer);

    },

    setMarkers: function (call, brigades) {
        Isidamaps.app.getController('AppController').readMarkers(call, brigades);
    },

    listenerStore: function () {
        Ext.getStore('Isidamaps.store.BrigadesFirstLoadStore').on('add', function (store, records, options) {
            this.storeBrigade(records)
        }, this);
        Ext.getStore('Isidamaps.store.CallsFirstLoadStore').on('add', function (store, records, options) {
            this.storeCall(records)
        }, this);

    },

    storeCall: function (records) {
        const me = this;
        records.forEach(function (call) {
            if (call.get('latitude') !== undefined && call.get('longitude') !== undefined) {
                const iconFeature = me.createCallFeature(call);
                me.callMarkers.push(iconFeature);
            }
        });
        me.addCallOnMap();
    },

    storeBrigade: function (records) {
        const me = this;
        Ext.Array.clean(me.brigadesMarkers);
        Ext.Array.clean(me.callMarkers);
        records.forEach(function (brigade) {
            if (brigade.get('latitude') !== undefined && brigade.get('longitude') !== undefined) {
                const feature = me.createBrigadeFeature(brigade);
                me.brigadesMarkers.push(feature);
            }
        });
        me.addBrigadesOnMap();
        me.listenerWebSockedStore();
    },

    addCallOnMap: function () {
        const me = this;
        me.callMarkers.forEach(function (call) {
            call.setStyle(me.iconStyle(call));
        });
        me.vectorSource.addFeatures(me.callMarkers);
        if (me.brigadesMarkers.length !== 0) {
            me.createRoute();
            me.createBouns();
        }
    },

    addBrigadesOnMap: function () {
        const me = this;
        me.brigadesMarkers.forEach(function (brigade) {
            brigade.setStyle(me.iconStyle(brigade));
        });
        me.vectorSource.addFeatures(me.brigadesMarkers);
        if (me.callMarkers.length !== 0) {
            me.createRoute();
            me.createBouns();
        }
    },

    createRoute: function () {
        const me = this;
        let arrayRoute = [];
        if (me.callMarkers.length > 0 && me.brigadesMarkers.length > 0) {
            let coordCall = me.callMarkers[0].getGeometry().getCoordinates();
            me.getNearest(coordCall).then(function (coord_street) {
                me.callCoord = coord_street;
                me.brigadesMarkers.forEach(function (brigadeMarker) {
                    let coordBrigade = brigadeMarker.getGeometry().getCoordinates();
                    me.getNearest(coordBrigade).then(function (coord_street) {
                        let point1 = me.callCoord.join(),
                            point2 = coord_street.join(),
                            routeDraw = function () {
                                fetch(me.urlOpenStreetServerRoute + '/route/v1/driving/' + point2 + ';' + point1).then(function (response) {
                                    return response.json();
                                }).then(function (json) {
                                    if (json.code === 'Ok') {
                                        let polyline = json.routes[0].geometry,
                                            route = new ol.format.Polyline({
                                                factor: 1e5
                                            }).readGeometry(polyline, {
                                                dataProjection: 'EPSG:4326',
                                                featureProjection: 'EPSG:3857'
                                            });
                                        route = new ol.Feature({
                                            type: 'route',
                                            geometry: route,
                                            customOptions: {
                                                objectType: 'route',
                                                brigadeNum: brigadeMarker.getProperties().customOptions.brigadeNum
                                            }
                                        });
                                        let styles = {
                                                route: new ol.style.Style({
                                                    stroke: new ol.style.Stroke({
                                                        width: 4, color: [255, 0, 0, 0.8]
                                                    })
                                                })
                                            },
                                            routeList = {
                                                brigade: brigadeMarker,
                                                route: json
                                            };
                                        route.setStyle(styles.route);
                                        arrayRoute.push(route);
                                        const vectorSourceRoute = new ol.source.Vector({
                                                features: arrayRoute
                                            }),
                                            vectorLayerRoute = new ol.layer.Vector({
                                                source: vectorSourceRoute,
                                                renderMode: 'route'
                                            });
                                        me.map.addLayer(vectorLayerRoute);
                                        me.arrRouteForTable.push(routeList);
                                        me.createTableRoute();
                                        me.arrpoints = [];
                                        arrayRoute = [];
                                        me.arrRouteForTable = [];
                                    }

                                    else {
                                        //setTimeout(routeDraw(), 1000);
                                    }
                                });
                            };
                        routeDraw();
                    });

                });
            });
        }
    },

    createCallOfSocked: function (calls) {
        const me = this,
            call = calls[0];
        if (call.get('latitude') !== undefined && call.get('longitude') !== undefined) {
            let iconFeature = me.createCallFeature(call),
                callHas = Ext.Array.findBy(me.callMarkers, function (callInArray, index) {
                    if (callInArray.getProperties().id === call.get('deviceId')) {
                        return callInArray;
                    }
                });
            Ext.Array.remove(me.callMarkers, callHas);
            Ext.Array.push(me.callMarkers, iconFeature);
            me.addMarkersSocket(iconFeature);
            Ext.getStore('Isidamaps.store.CallFromWebSockedStore').clearData();
        }
    },

    createBrigadeOfSocked: function (brigades) {
        const me = this;
        let brigade = brigades[0];
        if (brigade.get('latitude') !== undefined && brigade.get('longitude') !== undefined) {
            let iconFeature = me.createBrigadeFeature(brigade),
                brigadeHas = Ext.Array.findBy(me.brigadesMarkers, function (brigadeInArray, index) {
                    if (brigadeInArray.getProperties().id === brigade.get('deviceId')) {
                        return brigadeInArray;
                    }
                });
            Ext.Array.remove(me.brigadesMarkers, brigadeHas);
            Ext.Array.push(me.brigadesMarkers, iconFeature);
            me.addMarkersSocket(iconFeature);
            Ext.getStore('Isidamaps.store.BrigadeFromWebSockedStore').clearData();
        }
    },

    addMarkersSocket: function (iconFeature) {
        const me = this,
            sourceVectorLayer = me.vectorLayer.getSource().getSource(),
            id = iconFeature.getProperties().id;
        if (iconFeature.getProperties().customOptions.objectType === 'BRIGADE') {

            const brigadeHas = Ext.Array.findBy(sourceVectorLayer.getFeatures(), function (brigadeInArray, index) {
                if (brigadeInArray.getProperties().id === id) {
                    return brigadeInArray;
                }
            });
            if (brigadeHas !== null) {
                sourceVectorLayer.removeFeature(brigadeHas);
                me.map.getLayers().getArray().forEach(function (layer) {
                    if (layer.renderMode_ === 'route') {
                        me.map.removeLayer(layer);
                    }
                })
            }
            iconFeature.setStyle(me.iconStyle(iconFeature));
            sourceVectorLayer.addFeature(iconFeature);
            me.createRoute();
            return;
        }
        if (iconFeature.getProperties().customOptions.objectType === 'CALL') {
            const callHas = Ext.Array.findBy(sourceVectorLayer.getFeatures(), function (callInArray, index) {
                if (callInArray.getProperties().id === id) {
                    return callInArray;
                }
            });
            if (callHas !== null) {
                sourceVectorLayer.removeFeature(callHas);
            }
            iconFeature.setStyle(me.iconStyle(iconFeature));
            sourceVectorLayer.addFeature(iconFeature);
        }
    }

});
