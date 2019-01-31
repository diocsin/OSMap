Ext.define('Isidamaps.services.monitoring.MapService', {
    map: null,
    brigadesMarkers: [],
    callMarkers: [],
    filterBrigadeArray: [],
    filterCallArray: [],
    urlOpenStreetServerTiles: null,
    urlOpenStreetServerRoute: null,
    vectorLayer: null,
    vectorSource: null,

    constructor: function (options) {
        const me = this;
        me.vectorSource = new ol.source.Vector({});
        me.filterBrigadeArray = options.filterBrigadeArray;
        me.filterCallArray = options.filterCallArray;
        me.urlOpenStreetServerTiles = options.urlOpenStreetServerTiles;
        me.map = me.createMap();
        me.clusterOptions();
        me.map.addLayer(me.vectorLayer);

    },

    getCustomOptions: function (feature) {
        return feature.getProperties().customOptions
    },

    optionsObjectManager: function () {
        const me = this,
            myForm = new Ext.tip.ToolTip({});
        me.map.on('click', function (evt) {
            const feature = me.map.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                    return feature;
                });
            if (feature && !me.getCustomOptions(feature)) {
                if (feature.getProperties().features.length === 1) {
                    Ext.widget('callInfo').getController().markerClick(feature.getProperties().features[0]);
                }
                else {
                    Ext.widget('clusterInfo').getController().clustersClick(feature);
                }
            }
            if (feature && me.getCustomOptions(feature)) {
                const style = feature.getStyle(),
                    timerId = setInterval(function () {
                        feature.setStyle(new ol.style.Style({}));
                    }, 1000),
                    timerId2 = setInterval(function () {
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
            const pixel = me.map.getEventPixel(e.originalEvent),
                hit = me.map.hasFeatureAtPixel(pixel);
            me.map.getTargetElement().style.cursor = hit ? 'pointer' : '';

            if (hit) {
                const feature = me.map.forEachFeatureAtPixel(pixel,
                    function (feature) {
                        return feature;
                    });
                if (me.getCustomOptions(feature) && me.getCustomOptions(feature).objectType === 'route') {
                        myForm.setData('Маршрут ' + me.getCustomOptions(feature).brigadeNum + ' бригады');
                        myForm.show();
                        myForm.setPosition(e.pointerEvent.clientX + 10, e.pointerEvent.clientY + 10);
                }
            }
            else {
                myForm.hide();
            }

        });

    },

    createMap: function () {
        const me = this;
        return new ol.Map({
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
        const me = this;
        let maxFeatureCount;
        const textFill = new ol.style.Fill({
            color: '#fff'
        });
        const textStroke = new ol.style.Stroke({
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

        const calculateClusterInfo = function () {
            maxFeatureCount = 0;
            const features = me.vectorLayer.getSource().getFeatures();
            let feature, radius;
            for (let i = features.length - 1; i >= 0; --i) {
                feature = features[i];
                const originalFeatures = feature.get('features');
                const extent = ol.extent.createEmpty();
                let j = (void 0), jj = (void 0);
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
            let style;
            const size = feature.get('features').length;
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
                const originalFeature = feature.get('features')[0];
                style = createEarthquakeStyle(originalFeature);
            }
            return style;
        }
    },

    iconStyle: function (feature) {
        const me = this,
            icon = feature.getProperties().options.iconImageHref,
            textFill = new ol.style.Fill({
                color: '#00000'
            });
        const textBackgroundStroke = new ol.style.Stroke({
            color: '#000000',
            lineCap: 'round',
            lineJoin: 'round'
        });
        const textBackgroundFill = new ol.style.Fill({
            color: '#ffffff'
        });
        if (me.getCustomOptions(feature).objectType === "BRIGADE") {
            return new ol.style.Style({
                image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
                    src: icon,
                    scale: 0.5,
                })),

                text: new ol.style.Text({
                    text: me.getCustomOptions(feature).brigadeNum + "(" + me.getCustomOptions(feature).profile + ")",
                    offsetX: 35,
                    offsetY: -20,
                    font: '14px sans-serif',
                    fill: textFill,
                    padding: [1, 1, 1, 1],
                    backgroundFill: textBackgroundFill,
                    backgroundStroke: textBackgroundStroke,

                })
            });
        }
        if (me.getCustomOptions(feature).objectType === "CALL") {
            return new ol.style.Style({
                image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
                    src: icon,
                    scale: 0.4,
                })),
            });
        }
    },

    createBouns: function () {
        const me = this,
            arrayLatitude = [],
            arrayLongitude = [],
            call = me.callMarkers[0];

        let coord = call.getGeometry().getCoordinates(),
            lon = coord[0],
            lat = coord[1];
        arrayLatitude.push(lon);
        arrayLongitude.push(lat);

        me.brigadesMarkers.forEach(function (brigade) {
            let coord = brigade.getGeometry().getCoordinates(),
                lon = coord[0],
                lat = coord[1];
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

    getNearest: function (coord) {
        const me = this,
            coord4326 = this.to4326(coord),
            t = [(+(coord4326[0] * 10000)) / 10000, (+(coord4326[1] * 10000)) / 10000];
        return new Promise(function (resolve, reject) {
            fetch(me.urlOpenStreetServerRoute + '/nearest/v1/driving/' + t.join()).then(function (response) {
                return response.json();
            }).then(function (json) {
                if (json.code === 'Ok') resolve(json.waypoints[0].location);
                else reject();
            });
        });
    },

    addCallOnMap: function () {
        const me = this;
        me.callMarkers.forEach(function (call) {
            call.setStyle(me.iconStyle(call));
        });
        me.vectorSource.addFeatures(me.callMarkers);
    },

    addBrigadesOnMap: function () {
        const me = this;
        me.brigadesMarkers.forEach(function (item) {
            item.setStyle(me.iconStyle(item));
        });
        me.vectorSource.addFeatures(me.brigadesMarkers);

        function func() {
            me.addButtonsBrigadeOnPanel();
        }

        setTimeout(func, 20);
    },

    addMarkersSocket: function (feature) {
        const me = this,
            sourceVectorLayer = me.vectorLayer.getSource().getSource(),
            id = feature.getProperties().id;
        if (me.getCustomOptions(feature).objectType === 'BRIGADE') {
            let brigadeHas = Ext.Array.findBy(sourceVectorLayer.getFeatures(), function (brigadeInArray, index) {
                if (brigadeInArray.getProperties().id === id) {
                    return brigadeInArray;
                }
            });

            if (brigadeHas) {
                sourceVectorLayer.removeFeature(brigadeHas);
            }

            if (!brigadeHas || feature.getProperties().customOptions.status === 'WITHOUT_SHIFT') {
                me.addButtonsBrigadeOnPanel();
            }

            if (!Ext.Array.contains(me.filterBrigadeArray, me.getCustomOptions(feature).station) &&
                !Ext.Array.contains(me.filterBrigadeArray, me.getCustomOptions(feature).status) &&
                !Ext.Array.contains(me.filterBrigadeArray, me.getCustomOptions(feature).profile) &&
                me.getCustomOptions(feature).status !== "WITHOUT_SHIFT") {
                function func() {
                    feature.setStyle(me.iconStyle(feature));
                    sourceVectorLayer.addFeature(feature);
                }

                setTimeout(func, 20);
            }
            return;
        }
        if (feature.getProperties().customOptions.objectType === 'CALL') {
            let callHas = Ext.Array.findBy(sourceVectorLayer.getFeatures(), function (callInArray, index) {
                if (callInArray.getProperties().id === id) {
                    return callInArray;
                }
            });
            if (callHas) {
                sourceVectorLayer.removeFeature(callHas);
            }

            if (!Ext.Array.contains(me.filterBrigadeArray, me.getCustomOptions(feature).status) &&
                !Ext.Array.contains(me.filterBrigadeArray, me.getCustomOptions(feature).station) &&
                me.getCustomOptions(feature).status !== "COMPLETED") {
                feature.setStyle(me.iconStyle(feature));
                sourceVectorLayer.addFeature(feature);
            }
        }
    },

    addButtonsBrigadeOnPanel: function () {
        Ext.fireEvent('addButtonsBrigadeOnPanel');
    },

    addStationFilter: function () {
        Ext.fireEvent('addStationFilter');
    },

    setStation: function (stations) {
        Isidamaps.app.getController('AppController').readStation(stations);
    },

    listenerWebSockedStore: function () {
        Ext.getStore('Isidamaps.store.BrigadeFromWebSockedStore').on('add', function (store, records, index) {
            this.createBrigadeOfSocked(records)
        }, this);
        Ext.getStore('Isidamaps.store.CallFromWebSockedStore').on('add', function (store, records, index) {
            this.createCallOfSocked(records)
        }, this);
    },

    createCallOfSocked: function (calls) {
        const me = this;
        let call = calls[0];
        if (call.get('latitude') && call.get('longitude')) {
            const feature = me.createCallFeature(call);
            const callHas = Ext.Array.findBy(me.callMarkers, function (callInArray, index) {
                if (callInArray.getProperties().id === call.get('callCardId')) {
                    return callInArray;
                }
            });
            Ext.Array.remove(me.callMarkers, callHas);
            if (me.getCustomOptions(feature).status !== "COMPLETED") {
                Ext.Array.push(me.callMarkers, feature);
            }
            me.addMarkersSocket(feature);
            Ext.getStore('Isidamaps.store.CallFromWebSockedStore').clearData();
        }
    },

    createBrigadeOfSocked: function (brigades) {
        const me = this;
        let brigade = brigades[0];
        if (brigade.get('latitude') && brigade.get('longitude')) {
            const feature = me.createBrigadeFeature(brigade);
            const brigadeHas = Ext.Array.findBy(me.brigadesMarkers, function (brigadeInArray, index) {
                if (brigadeInArray.getProperties().id === brigade.get('deviceId')) {
                    return brigadeInArray;
                }
            });
            Ext.Array.remove(me.brigadesMarkers, brigadeHas);
            if (me.getCustomOptions(feature).status !== 'WITHOUT_SHIFT') {
                Ext.Array.push(me.brigadesMarkers, feature);
            }
            me.addMarkersSocket(feature);
            Ext.getStore('Isidamaps.store.BrigadeFromWebSockedStore').clearData();
        }
    },

    listenerStore: function () {
        Ext.getStore('Isidamaps.store.BrigadesFirstLoadStore').on('load', function (store, records, options) {
            this.storeBrigade(records)
        }, this);
        Ext.getStore('Isidamaps.store.CallsFirstLoadStore').on('load', function (store, records, options) {
            this.storeCall(records)
        }, this);

    },

    storeCall: function (records) {
        const me = this;
        records.forEach(function (call) {
            if (call.get('latitude') && call.get('longitude')) {
                const feature = me.createCallFeature(call);
                me.callMarkers.push(feature);
            }
        });
        me.addCallOnMap();
    },

    storeBrigade: function (records) {
        const me = this;
        Ext.Array.clean(me.brigadesMarkers);
        Ext.Array.clean(me.callMarkers);
        records.forEach(function (brigade) {
            if (brigade.get('latitude') && brigade.get('longitude')) {
                const feature = me.createBrigadeFeature(brigade);
                me.brigadesMarkers.push(feature);
            }
        });
        me.addStationFilter();
        me.addBrigadesOnMap();
        me.listenerWebSockedStore();
    },

    createCallFeature: function (call) {
        return new ol.Feature({
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
    },

    createBrigadeFeature: function (brigade) {
        return new ol.Feature({
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
    },

    resizeMap: function (Monitoring) {
        const div = Ext.get('mapId');
        Monitoring.map.setSize([div.getWidth(), div.getHeight()]);
    },

    to4326: function (coord) {
        return ol.proj.transform([
            parseFloat(coord[0]), parseFloat(coord[1])
        ], 'EPSG:3857', 'EPSG:4326');
    },

    createTableRoute: function () {
        const me = this;
        if (me.arrRouteForTable.length === me.brigadesMarkers.length) {
            const store = Ext.getStore('Isidamaps.store.RouteForTableStore');
            me.arrRouteForTable.forEach(function (feature) {
                var x = Ext.create('Isidamaps.model.Route');
                x.set('brigadeId', feature.brigade.getProperties().id);
                x.set('brigadeNum', me.getCustomOptions(feature.brigade).brigadeNum);
                x.set('profile', me.getCustomOptions(feature.brigade).profile);
                x.set('distance', (feature.route.routes[0].distance / 1000).toFixed(1));
                x.set('time', (feature.route.routes[0].duration / 60).toFixed(0));
                store.add(x);
            });
        }
    }
});
