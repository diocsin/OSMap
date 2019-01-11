Ext.define('Isidamaps.services.monitoringBrigadeOnCallView.MapService', {
    extend: 'Isidamaps.services.callHistoryView.MapService',
    map: null,
    callsModel: null,
    viewModel: null,
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
    commonArrayMarkers: [],
    // ====
    markerClick: Ext.emptyFn,
    getStoreMarkerInfo: Ext.emptyFn,
    // ====
    callInfoForm: [{
        xtype: 'form',
        height: '100%',
        width: '100%',
        margin: 0,
        items: [{
            xtype: 'displayfield',
            name: 'callCardNum',
            fieldLabel: 'Номер вызова',
            labelWidth: '100%',
            margin: 0
        },
            {
                xtype: 'displayfield',
                name: 'createTime',
                fieldLabel: 'Время создания вызова',
                labelWidth: '100%',
                renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
                margin: 0
            },
            {
                xtype: 'displayfield',
                name: 'regBeginTime',
                fieldLabel: 'Время приема вызова',
                labelWidth: '100%',
                renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
                margin: 0
            },
            {
                xtype: 'textareafield',
                name: 'reason',
                labelWidth: 100,
                width: 500,
                readOnly: true,
                fieldLabel: 'Повод к вызову',
                margin: '0px 0px 5px 0px'
            },
            {
                xtype: 'textareafield',
                name: 'reasonComment',
                labelWidth: 100,
                width: 500,
                readOnly: true,
                fieldLabel: 'Комментарий',
                margin: '5px 0px 0px 0px'
            },
            {
                xtype: 'displayfield',
                name: 'address',
                labelWidth: '100%',
                fieldLabel: 'Адрес места вызова',
                margin: 0
            },
            {
                xtype: 'displayfield',
                name: 'enter',
                labelWidth: '100%',
                fieldLabel: 'Особенности входа',
                margin: 0
            },
            {
                xtype: 'displayfield',
                name: 'phone',
                labelWidth: '100%',
                fieldLabel: 'Телефон',
                margin: 0
            },
            {
                xtype: 'displayfield',
                name: 'fullName',
                labelWidth: '100%',
                fieldLabel: 'ФИО',
                margin: 0
            },
            {
                xtype: 'displayfield',
                name: 'brigadeNum',
                labelWidth: '100%',
                fieldLabel: 'Номер бригады',
                margin: 0
            },
            {
                xtype: 'displayfield',
                name: 'brigadeAssignTime',
                labelWidth: '100%',
                fieldLabel: 'Время назначения бригады на вызов',
                renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
                margin: 0
            },
            {
                xtype: 'displayfield',
                name: 'brigadeArrivalTime',
                labelWidth: '100%',
                fieldLabel: 'Время прибытия бригады к месту вызова',
                renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
                margin: 0
            },
            {
                xtype: 'displayfield',
                name: 'hospital',
                labelWidth: '100%',
                fieldLabel: 'Стационар',
                margin: 0
            }
        ]
    }],

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
        me.markerClick = options.markerClick;
        me.viewModel = options.viewModel;
        me.filterBrigadeArray = options.filterBrigadeArray;
        me.filterCallArray = options.filterCallArray;
        me.urlGeodata = options.urlGeodata;
        me.urlOpenStreetServerTiles = options.urlOpenStreetServerTiles;
        me.urlOpenStreetServerRoute = options.urlOpenStreetServerRoute;
        me.getStoreMarkerInfo = options.getStoreMarkerInfo;
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

    addMarkers: function () {
        var me = this;
        me.createBouns();
        me.brigadesMarkers.forEach(function (brigade) {
            if (brigade.getProperties().customOptions.status !== 'WITHOUT_SHIFT') {
                brigade.setStyle(me.iconStyle(brigade));
                me.commonArrayMarkers.push(brigade);
            }
        });
        me.callMarkers.forEach(function (call) {
            if (call.getProperties().customOptions.status !== "COMPLETED") {
                call.setStyle(me.iconStyle(call));
                me.commonArrayMarkers.push(call);
            }
        });

        me.vectorSource = new ol.source.Vector();
        me.commonArrayMarkers.forEach(function (feature) {
            me.vectorSource.addFeature(feature);
        });
        me.vectorLayer = new ol.layer.Vector({
            source: me.vectorSource
        });
        me.createRoute();
        me.map.addLayer(me.vectorLayer);

    },


    addMarkersSocket: function (iconFeature) {
        var me = this,
            sourceVectorLayer = me.vectorLayer.getSource();
        var id = iconFeature.getProperties().id;
        if (iconFeature.getProperties().customOptions.objectType === 'BRIGADE') {
            sourceVectorLayer.getFeatures().forEach(function (brigade) {
                if (brigade.getProperties().id === id) {
                    sourceVectorLayer.removeFeature(brigade);
                    me.map.getLayers().getArray().forEach(function (layer) {
                        if (layer.renderMode_ === 'route') {
                            me.map.removeLayer(layer);
                        }
                    })
                }

            });

            iconFeature.setStyle(me.iconStyle(iconFeature));
            sourceVectorLayer.addFeature(iconFeature);
            me.createRoute();


        }
        if (iconFeature.getProperties().customOptions.objectType === 'CALL') {
            if (me.vectorLayer.getSource().hasFeature(iconFeature)) {
                sourceVectorLayer.getFeatures().forEach(function (call) {
                    if (call.getProperties().id === id) {
                        sourceVectorLayer.removeFeature(call);
                    }
                });
            }
            iconFeature.setStyle(me.iconStyle(iconFeature));
            sourceVectorLayer.addFeature(iconFeature);
        }
    },

    setMarkers: function (call, brigades) {
        this.MonitoringBrigade.readMarkers(call, brigades);
    },

    readMarkers: function (call, brigades) {
        var me = this;
        me.brigadesMarkers = [];
        me.callMarkers = [];
        me.callId = call;
        me.brigadeId = brigades[0];
        var t = Ext.Object.toQueryString({
                brigades: brigades
            }),
            urlRoute = Ext.String.format(me.urlGeodata + '/brigade?callcardid={0}&{1}', me.callId, t);
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
                    }
                });
                me.addMarkers();
                me.listenerStore();
            });
        });
    },
    listenerStore: function () {
        var me = this;
        me.viewModel.getStore('Brigades').on('add', function (store, records, index) {
            this.createBrigadeOfSocked(records)
        }, this);
        me.viewModel.getStore('Calls').on('add', function (store, records, index) {
            this.createCallOfSocked(records)
        }, this);
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
            me.viewModel.getStore('Calls').clearData();
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
            me.viewModel.getStore('Brigades').clearData();
        }
    },


    resizeMap: function (Monitoring) {

        var div = Ext.get('mapId');
        Monitoring.map.setSize([div.getWidth(), div.getHeight()]);

    },
    createTableRoute: function () {
        var me = this,
            store = me.viewModel.getStore('Route');
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
