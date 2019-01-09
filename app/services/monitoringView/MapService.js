Ext.define('Isidamaps.services.monitoringView.MapService', {
    map: null,
    callsModel: null,
    viewModel: null,
    brigadesMarkers: [],
    callMarkers: [],
    filterBrigadeArray: [],
    filterCallArray: [],
    station: [],
    urlGeodata: null,
    urlOpenStreetServerTiles: null,
    vectorLayer: null,
    vectorSource: null,
    commonArrayMarkers: [],
    // ====
    markerClick: Ext.emptyFn,
    clustersClick: Ext.emptyFn,
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
        me.clustersClick = options.clustersClick;
        me.viewModel = options.viewModel;
        me.filterBrigadeArray = options.filterBrigadeArray;
        me.filterCallArray = options.filterCallArray;
        me.urlGeodata = options.urlGeodata;
        me.urlOpenStreetServerTiles = options.urlOpenStreetServerTiles;
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

    clusterOptions: function () {

        var me = this;
        var currentResolution;
        var maxFeatureCount;
        var textFill = new ol.style.Fill({
            color: '#fff'
        });
        var textStroke = new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.6)',
            width: 3
        });
        me.vectorLayer = new ol.layer.Vector({
            source: new ol.source.Cluster({
                distance: 10,
                source: me.vectorSource
            }),
            style: styleFunction
        });

        function createEarthquakeStyle(feature) {

            return me.iconStyle(feature);

        }

        var calculateClusterInfo = function () {
            maxFeatureCount = 0;
            var features = me.vectorLayer.getSource().getFeatures();
            var feature, radius;
            for (var i = features.length - 1; i >= 0; --i) {
                feature = features[i];
                var originalFeatures = feature.get('features');
                var extent = ol.extent.createEmpty();
                var j = (void 0), jj = (void 0);
                for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
                    ol.extent.extend(extent, originalFeatures[j].getGeometry().getExtent());
                }
                maxFeatureCount = Math.max(maxFeatureCount, jj);
                radius = 20;
                feature.set('radius', radius);
            }
        };

        function styleFunction(feature, resolution) {
            calculateClusterInfo(resolution);
            currentResolution = resolution;
            var style;
            var size = feature.get('features').length;
            if (size > 1) {
                style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: feature.get('radius'),
                        fill: new ol.style.Fill({
                            color: [23, 130, 252, Math.min(0.8, 0.4 + (size / maxFeatureCount))]
                        })
                    }),
                    text: new ol.style.Text({
                        text: size.toString(),
                        font: '13px sans-serif',
                        fill: textFill,
                        stroke: textStroke
                    })
                });
            } else {
                var originalFeature = feature.get('features')[0];
                style = createEarthquakeStyle(originalFeature);
            }
            return style;
        }
    },

    optionsObjectManager: function () {
        var me = this;
        var myForm = new Ext.tip.ToolTip({});
        me.map.on('click', function (evt) {

            var feature = me.map.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                    return feature;
                });
            if (feature !== undefined && feature.getProperties().customOptions === undefined) {
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
            if (feature !== undefined && feature.getProperties().customOptions !== undefined) {
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
        me.clusterOptions();
        me.map.addLayer(me.vectorLayer);

        function func() {
            me.addButtonsBrigadeOnPanel();
        }

        setTimeout(func, 20);

    },


    addMarkersSocket: function (iconFeature) {
        var me = this,
            sourceVectorLayer = me.vectorLayer.getSource().getSource();
        var id = iconFeature.getProperties().id;
        if (iconFeature.getProperties().customOptions.objectType === 'BRIGADE') {
            sourceVectorLayer.getFeatures().forEach(function (brigade) {
                if (brigade.getProperties().id === id) {
                    sourceVectorLayer.removeFeature(brigade);
                    if (iconFeature.getProperties().customOptions.status === 'WITHOUT_SHIFT') {
                        me.addButtonsBrigadeOnPanel();
                    }
                }

            });

            if (me.filterBrigadeArray.indexOf(iconFeature.getProperties().customOptions.station) === -1 &&
                me.filterBrigadeArray.indexOf(iconFeature.getProperties().customOptions.status) === -1 &&
                me.filterBrigadeArray.indexOf(iconFeature.getProperties().customOptions.profile) === -1 &&
                iconFeature.getProperties().customOptions.status !== "WITHOUT_SHIFT") {
                function func() {

                    iconFeature.setStyle(me.iconStyle(iconFeature));
                    sourceVectorLayer.addFeature(iconFeature);
                    //Ext.fireEvent('getButtonBrigadeForChangeButton', iconFeature);
                }

                setTimeout(func, 20);
            }
            return;
        }
        if (iconFeature.getProperties().customOptions.objectType === 'CALL') {
            if (iconFeature.getProperties().customOptions.status === "COMPLETED" || me.vectorLayer.getSource().hasFeature(iconFeature)) {
                sourceVectorLayer.getFeatures().forEach(function (call) {
                    if (call.getProperties().id === id) {
                        sourceVectorLayer.removeFeature(call);
                    }
                });
            }

            if (me.filterCallArray.indexOf(iconFeature.getProperties().customOptions.status) === -1 &&
                me.filterCallArray.indexOf(iconFeature.getProperties().customOptions.station) === -1 &&
                iconFeature.getProperties().customOptions.status !== "COMPLETED") {
                iconFeature.setStyle(me.iconStyle(iconFeature));
                sourceVectorLayer.addFeature(iconFeature);
            }
        }
    },

    addButtonsBrigadeOnPanel: function () {
        Ext.fireEvent('addButtonsBrigadeOnPanel');
    },

    addStationFilter: function () {
        Ext.fireEvent('addStationFilter');
    },

    setStation: function (station) {
        this.Monitoring.readStation(station);
    },

    storeCall: function (urlCall) {
        var me = this;
        Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.Call',
            proxy: {
                type: 'ajax',
                url: urlCall,
                reader: {
                    type: 'json'
                }
            },
            autoLoad: false
        }).load(function (records) {
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
            me.addMarkers();
        })
    },

    storeBrigade: function (urlBrigade, urlCall) {
        var me = this;
        Ext.create('Ext.data.Store', {
            model: 'Isidamaps.model.Brigade',
            proxy: {
                type: 'ajax',
                url: urlBrigade,
                reader: {
                    type: 'json'
                }
            },
            autoLoad: false
        }).load(function (records) {
            records.forEach(function (brigade) {
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

                    me.brigadesMarkers.push(iconFeature);
                }
            });
            me.addStationFilter();
            me.storeCall(urlCall);
        })
    },

    readStation: function (station) {
        var me = this;
        station.forEach(function (st) {
            me.station.push(Ext.String.trim(st));
        });
        var statuses = ['NEW', 'ASSIGNED'];
        var t = Ext.Object.toQueryString({
                stations: me.station
            }),
            s = Ext.Object.toQueryString({
                statuses: statuses
            }),
            urlBrigade = Ext.String.format(me.urlGeodata + '/data?{0}&statuses=', t),
            urlCall = Ext.String.format(me.urlGeodata + '/call?{0}&{1}', t, s);
        me.brigadesMarkers = [];
        me.callMarkers = [];
        me.storeBrigade(urlBrigade, urlCall);
    },

    createMarkers: function () {
        var me = this,
            callRecords = me.viewModel.getStore('Calls').getData().items;
        callRecords.forEach(function (call) {
            me.callMarkers.forEach(function (callInArray) {
                if (callInArray.getProperties().id === call.get('callCardId')) {
                    var index = me.callMarkers.indexOf(callInArray);
                    me.callMarkers.splice(index, 1);
                }
            });
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
                me.addMarkersSocket(iconFeature);
                me.viewModel.getStore('Calls').clearData();
            }

        });
        var brigadeRecords = me.viewModel.getStore('Brigades').getData().items;
        brigadeRecords.forEach(function (brigade) {
            me.brigadesMarkers.forEach(function (brigadeInArray) {
                if (brigadeInArray.getProperties().id === brigade.get('deviceId')) {
                    var index = me.brigadesMarkers.indexOf(brigadeInArray);
                    me.brigadesMarkers.splice(index, 1);
                }
            });
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

                me.brigadesMarkers.push(iconFeature);
                me.addMarkersSocket(iconFeature);
                me.viewModel.getStore('Brigades').clearData();
            }

        });

    },

    resizeMap: function (Monitoring) {

        var div = Ext.get('mapId');
        Monitoring.map.setSize([div.getWidth(), div.getHeight()]);

    }
});
