Ext.define('Isidamaps.services.brigadeForAssignView.MapService', {
    extend: 'Isidamaps.services.callHistoryView.MapService',
    map: null,
    points: [],
    objectManager: null,
    callMarkers: [],
    brigadesMarkers: [],
    vectorSource: null,
    vectorLayer: null,
    viewModel: null,
    arrRoute: [],
    arrpoints: [],
    brigades: [],
    urlGeodata: null,
    arrRouteForTable: [],
    errorBrigades: [],
    arrayRoute: [],
    urlOpenStreetServerRoute: null,
    urlOpenStreetServerTiles: null,
    callCoord: null,


    // ====.
    markerClick: Ext.emptyFn,
    clustersClick: Ext.emptyFn,
    // ====

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
                                        source: vectorSourceRoute
                                    });
                                    me.map.addLayer(vectorLayerRoute);
                                    me.arrRouteForTable.push(routeList);
                                    me.arrpoints = route.getProperties().geometry.flatCoordinates;
                                    me.arrRoute.push({
                                        brigadeId: brigadeMarker.getProperties().id,
                                        objectType: brigadeMarker.getProperties().customOptions.objectType,
                                        profile: brigadeMarker.getProperties().customOptions.profile,
                                        brigadeNum: brigadeMarker.getProperties().customOptions.brigadeNum,
                                        station: brigadeMarker.getProperties().customOptions.station,
                                        longitude: brigadeMarker.getProperties().geometry.flatCoordinates[1],
                                        latitude: brigadeMarker.getProperties().geometry.flatCoordinates[0],
                                        distance: (json.routes[0].distance / 1000).toFixed(1),
                                        time: (json.routes[0].duration / 60).toFixed(0),
                                        route: me.arrpoints
                                    });
                                    me.createTableRoute();
                                    me.callback();
                                    me.arrpoints = [];


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

    constructor: function (options) {
        var me = this;
        me.vectorSource = new ol.source.Vector({});
        me.markerClick = options.markerClick;
        me.clustersClick = options.clustersClick;
        me.viewModel = options.viewModel;
        me.getStoreMarkerInfo = options.getStoreMarkerInfo;
        me.urlGeodata = options.urlGeodata;
        me.urlOpenStreetServerRoute = options.urlOpenStreetServerRoute;
        me.urlOpenStreetServerTiles = options.urlOpenStreetServerTiles;
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

    callback: function () {
        var me = this;
        if (me.arrRoute.length === me.brigadesMarkers.length) {
            ASOV.setRoutes(me.arrRoute);
        }
    },

    createMarkers: function () {
        var me = this;
        if (me.callMarkers.length === 0) {
            me.createCallAlert();
        } else if (me.errorBrigades.length > 0) {
             me.createBrigadeAlert();
        }
        me.createBouns();  //в callHistory
        me.optionsObjectManager();

        me.brigadesMarkers.forEach(function (brigade) {
            brigade.setStyle(me.iconStyle(brigade));
            me.commonArrayMarkers.push(brigade);

        });
        me.callMarkers.forEach(function (call) {
            if (call.getProperties().customOptions.status !== "COMPLETED") {
                call.setStyle(me.iconStyle(call));
                me.commonArrayMarkers.push(call);
            }
        });
        me.vectorSource.addFeatures(me.commonArrayMarkers);
        me.createRoute();
        me.clusterOptions();
        me.map.addLayer(me.vectorLayer);
    },
    optionsObjectManager: function () {
        var me = this;
        var myForm = new Ext.tip.ToolTip({});
        me.map.on(['click', 'contextmenu'], function (evt) {
            evt.preventDefault();
            var eType = evt.type;
            var feature = me.map.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                    return feature;
                });
            if(feature!==undefined){
            if (eType === 'click') {
                if (feature.getProperties().customOptions === undefined) {
                    var geometry = feature.getGeometry(), coord = geometry.getCoordinates(),
                        pixel = me.map.getPixelFromCoordinate(coord);
                    if (feature.getProperties().features.length === 1) {
                        var storeMarker = me.getStoreMarkerInfo(feature.getProperties().features[0]);
                        var win = Ext.WindowManager.getActive();
                        if (win) {
                            win.close();
                        }
                        me.markerClick(feature.getProperties().features[0], pixel, storeMarker);
                    }
                    else {
                        var win = Ext.WindowManager.getActive();
                        if (win) {
                            win.close();
                        }
                        me.clustersClick(pixel, feature);
                    }
                }
                if (feature.getProperties().customOptions !== undefined) {
                    var style = feature.getStyle();
                    var timerId = setInterval(function () {
                        feature.setStyle(new ol.style.Style({}));
                    }, 1000);
                    var timerId2 = setInterval(function () {
                        feature.setStyle(style);
                    }, 2000);
// через 5 сек остановить повторы
                    setTimeout(function () {
                        clearInterval(timerId);
                        clearInterval(timerId2);
                        feature.setStyle(style);
                    }, 6000);
                }
            }
            else {
                if (feature.getProperties().features[0].getProperties().customOptions.objectType === 'BRIGADE') {
                    var store = me.viewModel.getStore('Routes'),
                        record = store.getById(feature.getProperties().features[0].getProperties().id);
                    store.each(function (rec) {
                        rec.set('checkBox', false);
                    });
                    record.set('checkBox', !record.get('checkBox'));
                }
            }
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

    createAnswer: function () {
        var me = this,
            store = me.viewModel.getStore('Routes'),
            br = store.query('checkBox', 'true'),
            brigadeId = br.getValues('brigadeId', 'data');
        if (brigadeId.length === 1) {
            ASOV.setBrigade(brigadeId[0]);
        } else (Ext.create('Ext.window.MessageBox').show({
            title: 'Ошибка',
            message: 'Не назначена бригада на вызов',
            icon: Ext.Msg.ERROR,
            buttons: Ext.Msg.OK
        }))
    },

    createCallAlert: function () {
        Ext.create('Ext.window.MessageBox').show({
            title: 'Ошибка',
            message: 'Нет координат вызова',
            icon: Ext.Msg.ERROR,
            buttons: Ext.Msg.OK
        })
    },

    createBrigadeAlert: function () {
        var me = this,
            stringError = Ext.String.format('Нет координат {0} бригад', me.errorBrigades);
        Ext.create('Ext.window.MessageBox').show({
            title: 'Ошибка',
            message: stringError,
            icon: Ext.Msg.ERROR,
            buttons: Ext.Msg.OK
        })
    },

    setMarkers: function (call, brigades) {
        this.BrigadeForAssign.readMarkers(call, brigades);
        console.dir(call);
        console.dir(brigades);
    },

    readMarkers: function (call, brigades) {
        var me = this;
        me.brigades = brigades;
        var t = Ext.Object.toQueryString({
                brigades: brigades
            }),
            urlRoute = Ext.String.format(me.urlGeodata + '/brigade?callcardid={0}&{1}', call, t);
        me.callStore = Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.Call',
            proxy: {
                type: 'ajax',
                url: urlRoute,
                reader: {
                    type: 'json',
                    rootProperty: 'call',
                    messageProperty: 'msjError'
                }
            },
            autoLoad: false
        });
        me.brigadeStore = Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.Brigade',
            proxy: {
                type: 'ajax',
                url: urlRoute,
                reader: {
                    type: 'json',
                    rootProperty: 'brigades',
                    messageProperty: 'msjError'
                }
            },
            autoLoad: false
        });
        me.callStore.load(function (records) {
            records.forEach(function (call) {
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
                    me.callMarkers.push(iconFeature);
                }
            });
            me.brigadeStore.load(function (records) {
                records.forEach(function (brigade) {
                    if (brigade.get('latitude') !== undefined && brigade.get('longitude') !== undefined) {
                        var iconFeature = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([brigade.get('longitude'), brigade.get('latitude')])),
                            id: brigade.get('deviceId'),
                            customOptions: {
                                objectType: brigade.get('objectType'),
                                profile: brigade.get('profile'),
                                status: brigade.get('status'),
                                station: brigade.get('station'),
                                brigadeNum: brigade.get('brigadeNum')
                            },
                            options: {
                                iconImageHref: 'resources/icon/' + brigade.get('iconName')
                            }
                        });

                        me.brigadesMarkers.push(iconFeature);
                    } else {
                        me.errorBrigades.push(brigade.get('brigadeNum'));
                    }
                });
                me.createMarkers();
            });
        });
    },

    createTableRoute: function () {
        var me = this;
        if (me.arrRouteForTable.length === me.brigadesMarkers.length) {
            var store = me.viewModel.getStore('Routes');
            me.arrRouteForTable.forEach(function (object) {
                var x = Ext.create('Isidamaps.model.Route');
                x.set('checkBox', false);
                x.set('brigadeId', object.brigade.getProperties().id);
                x.set('brigadeNum', object.brigade.getProperties().customOptions.brigadeNum);
                x.set('profile', object.brigade.getProperties().customOptions.profile);
                x.set('distance', (object.route.routes[0].distance / 1000).toFixed(1));
                x.set('time', (object.route.routes[0].duration / 60).toFixed(0));
                store.add(x);
            });
        }
    }

});