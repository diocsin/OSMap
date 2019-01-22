Ext.define('Isidamaps.services.monitoringBrigadeOnCall.MapService', {
    extend: 'Isidamaps.services.monitoring.MapService',
    map: null,
    brigadeId: null,
    callId: null,
    brigadesMarkers: [],
    callMarkers: [],
    filterBrigadeArray: [],
    filterCallArray: [],
    station: [],
    urlGeodata: null,
    urlOpenStreetServerTiles: null,
    vectorLayer: null,
    vectorSource: null,
    arrayRoute: [],
    arrRouteForTable: [],


    getNearest: function (coord) {
        var me = this;
        var coord4326 = this.to4326(coord);
        var t = [(parseInt(coord4326[0] * 10000)) / 10000, (parseInt(coord4326[1] * 10000)) / 10000];
        return new Promise(function (resolve, reject) {
            //make sure the coord is on street

            fetch(me.urlOpenStreetServerRoute + '/nearest/v1/driving/' + t.join()).then(function (response) {
                // Convert to JSON
                return response.json();
            }).then(function (json) {
                if (json.code === 'Ok') resolve(json.waypoints[0].location);
                else reject();
            });
        });
    },
    createRoute: function () {
        var me = this;
        if (me.callMarkers.length > 0 && me.brigadesMarkers.length > 0) {
            var geometryCall = me.callMarkers[0].getGeometry();
            var coordCall = geometryCall.getCoordinates();
            me.getNearest(coordCall).then(function (coord_street) {
                me.callCoord = coord_street;
                me.brigadesMarkers.forEach(function (brigadeMarker) {
                    var geometryBrigade = brigadeMarker.getGeometry();
                    var coordBrigade = geometryBrigade.getCoordinates();
                    me.getNearest(coordBrigade).then(function (coord_street) {

                        var point1 = me.callCoord.join();
                        var point2 = coord_street.join();
                        var routeDraw = function () {
                            fetch(me.urlOpenStreetServerRoute + '/route/v1/driving/' + point2 + ';' + point1).then(function (response) {
                                return response.json();
                            }).then(function (json) {
                                if (json.code === 'Ok') {
                                    var polyline = json.routes[0].geometry;
                                    // route is ol.geom.LineString
                                    var route = new ol.format.Polyline({
                                        factor: 1e5
                                    }).readGeometry(polyline, {
                                        dataProjection: 'EPSG:4326',
                                        featureProjection: 'EPSG:3857'
                                    });
                                    var route = new ol.Feature({
                                        type: 'route',
                                        geometry: route,
                                        customOptions: {
                                            objectType: 'route',
                                            brigadeNum: brigadeMarker.getProperties().customOptions.brigadeNum
                                        }
                                    });
                                    var styles = {
                                        route: new ol.style.Style({
                                            stroke: new ol.style.Stroke({
                                                width: 4, color: [255, 0, 0, 0.8]
                                            })
                                        })
                                    };

                                    var routeList = {
                                        brigade: brigadeMarker,
                                        route: json
                                    };
                                    route.setStyle(styles.route);
                                    me.arrayRoute.push(route);
                                    var vectorSourceRoute = new ol.source.Vector({
                                        features: me.arrayRoute
                                    });
                                    var vectorLayerRoute = new ol.layer.Vector({
                                        source: vectorSourceRoute,
                                        renderMode: 'route'
                                    });
                                    me.map.addLayer(vectorLayerRoute);
                                    me.arrRouteForTable.push(routeList);
                                    me.createTableRoute();
                                    me.arrpoints = [];
                                    me.arrayRoute = [];
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
    to4326: function (coord) {
        return ol.proj.transform([
            parseFloat(coord[0]), parseFloat(coord[1])
        ], 'EPSG:3857', 'EPSG:4326');
    },

    iconStyle: function (feature) {
        var icon = feature.getProperties().options.iconImageHref;
        var textFill = new ol.style.Fill({
            color: '#00000'
        });
        var textFill3 = new ol.style.Stroke({
            color: '#000000',
            lineCap: 'round',
            lineJoin: 'round'
        });
        var textFill2 = new ol.style.Fill({
            color: '#ffffff'
        });
        if (feature.getProperties().customOptions.objectType === "BRIGADE") {
            return new ol.style.Style({
                image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
                    src: icon,
                    scale: 0.5,
                })),

                text: new ol.style.Text({
                    text: feature.getProperties().customOptions.brigadeNum + "(" + feature.getProperties().customOptions.profile + ")",
                    offsetX: 35,
                    offsetY: -20,
                    font: '14px sans-serif',
                    fill: textFill,
                    padding: [1, 1, 1, 1],
                    backgroundFill: textFill2,
                    backgroundStroke: textFill3,

                })
            });
        }
        if (feature.getProperties().customOptions.objectType === "CALL") {
            return new ol.style.Style({
                image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
                    src: icon,
                    scale: 0.5,
                })),
            });
        }

    },

    constructor: function (options) {
        var me = this;
        me.filterBrigadeArray = options.filterBrigadeArray;
        me.filterCallArray = options.filterCallArray;
        me.urlOpenStreetServerTiles = options.urlOpenStreetServerTiles;
        me.urlOpenStreetServerRoute = options.urlOpenStreetServerRoute;
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


    optionsObjectManager: function () {
        var me = this;
        var myForm = new Ext.tip.ToolTip({});
        me.map.on('click', function (evt) {
            var feature = me.map.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                    return feature;
                });
            if (feature !== undefined && feature.getProperties().customOptions.objectType !== 'route') {
                var geometry = feature.getGeometry(), coord = geometry.getCoordinates(),
                    pixel = me.map.getPixelFromCoordinate(coord);
                var storeMarker = me.getStoreMarkerInfo(feature);
                var win = Ext.WindowManager.getActive();
                if (win) {
                    win.close();
                }
                me.markerClick(feature, pixel, storeMarker);


            }
        });

        me.map.on('pointermove', function (e) {
            var pixel = me.map.getEventPixel(e.originalEvent);
            var hit = me.map.hasFeatureAtPixel(pixel);
            me.map.getTargetElement().style.cursor = hit ? 'pointer' : '';

            if (hit) {
                var feature = me.map.forEachFeatureAtPixel(pixel,
                    function (feature) {
                        return feature;
                    });
                if (feature.getProperties().features !== undefined) {
                    if (feature.getProperties().features.length === 1 && feature.getProperties().features[0].getProperties().customOptions.objectType === 'BRIGADE') {
                        myForm.setData('Бригада ' + feature.getProperties().features[0].getProperties().customOptions.brigadeNum);
                        myForm.show();
                        myForm.setPosition(e.pointerEvent.clientX + 10, e.pointerEvent.clientY + 10);

                    }

                    if (feature.getProperties().features.length === 1 && feature.getProperties().features[0].getProperties().customOptions.objectType === 'MEDORG') {
                        myForm.setData(feature.getProperties().features[0].getProperties().customOptions.organizationName);
                        myForm.show();
                        myForm.setPosition(e.pointerEvent.clientX + 10, e.pointerEvent.clientY + 10);

                    }
                }
                else if (feature.getProperties().customOptions.objectType === 'route') {
                    myForm.setData('Маршрут ' + feature.getProperties().customOptions.brigadeNum + ' бригады');
                    myForm.show();
                    myForm.setPosition(e.pointerEvent.clientX + 10, e.pointerEvent.clientY + 10);

                }
            }
            else {
                myForm.hide();
            }

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

    addMarkers: function () {
        var me = this,
            commonArrayMarkers = Ext.Array.filter(me.brigadesMarkers, function (item, index, array) {
                if (item.getProperties().customOptions.status !== 'WITHOUT_SHIFT') {
                    item.setStyle(me.iconStyle(item));
                    return item;
                }
            });
        me.callMarkers.forEach(function (call) {
            call.setStyle(me.iconStyle(call));
            commonArrayMarkers.push(call);
        });

        me.vectorSource = new ol.source.Vector();
        me.vectorSource.addFeatures(commonArrayMarkers);
        me.vectorLayer = new ol.layer.Vector({
            source: me.vectorSource
        });
        me.createRoute();
        me.map.addLayer(me.vectorLayer);
        me.createBouns();
    },


    addMarkersSocket: function (iconFeature) {
        var me = this,
            sourceVectorLayer = me.vectorLayer.getSource();
        var id = iconFeature.getProperties().id;
        if (iconFeature.getProperties().customOptions.objectType === 'BRIGADE') {

            var brigadeHas = Ext.Array.findBy(sourceVectorLayer.getFeatures(), function (brigadeInArray, index) {
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


        }
        if (iconFeature.getProperties().customOptions.objectType === 'CALL') {
            var callHas = Ext.Array.findBy(sourceVectorLayer.getFeatures(), function (callInArray, index) {
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
    },


    setMarkers: function (call, brigades) {
        Isidamaps.app.getController('GlobalController').readMarkers(call, brigades);
    },


    createCallOfSocked: function (calls) {
        var me = this,
            call = calls[0];
        if (call.get('latitude') !== undefined && call.get('longitude') !== undefined) {
            var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([call.get('longitude'), call.get('latitude')])),
                id: call.get('callCardId'),
                customOptions: {
                    objectType: call.get('objectType'),
                    status: call.get('status'),
                    callCardNum: call.get('callCardNum'),
                    station: '' + call.get('station')
                },
                options: {
                    iconImageHref: 'resources/icon/' + call.get('iconName')
                }

            });
            var callHas = Ext.Array.findBy(me.callMarkers, function (callInArray, index) {
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
        var me = this;
        var brigade = brigades[0];
        if (brigade.get('latitude') !== undefined && brigade.get('longitude') !== undefined) {
            var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([brigade.get('longitude'), brigade.get('latitude')])),
                id: brigade.get('deviceId'),
                customOptions: {
                    objectType: brigade.get('objectType'),
                    profile: brigade.get('profile'),
                    status: brigade.get('status'),
                    station: '' + brigade.get('station'),
                    brigadeNum: brigade.get('brigadeNum')
                },
                options: {
                    iconImageHref: 'resources/icon/' + brigade.get('iconName')
                }
            });
            var brigadeHas = Ext.Array.findBy(me.brigadesMarkers, function (brigadeInArray, index) {
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


    resizeMap: function (Monitoring) {
        var div = Ext.get('mapId');
        Monitoring.map.setSize([div.getWidth(), div.getHeight()]);

    },
    createTableRoute: function () {
        var me = this;
        store = Ext.getStore('Isidamaps.store.RouteForTableStore');
        console.dir(store);
        me.arrRouteForTable.forEach(function (object) {
            var x = Ext.create('Isidamaps.model.Route');
            x.set('brigadeId', object.brigade.getProperties().id);
            x.set('brigadeNum', object.brigade.getProperties().customOptions.brigadeNum);
            x.set('profile', object.brigade.getProperties().customOptions.profile);
            x.set('distance', (object.route.routes[0].distance / 1000).toFixed(1));
            x.set('time', (object.route.routes[0].duration / 60).toFixed(0));
            store.add(x);
        });
    }
});
