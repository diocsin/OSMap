Ext.define('Isidamaps.services.brigadeForAssign.MapService', {
    extend: 'Isidamaps.services.monitoring.MapService',
    vectorSource: null,
    vectorLayer: null,
    arrRoute: [],
    arrRouteForTable: [],

    constructor: function (options) {
        const me = this;
        me.vectorSource = new ol.source.Vector({});
        me.urlOpenStreetServerRoute = options.urlOpenStreetServerRoute;
        me.urlOpenStreetServerTiles = options.urlOpenStreetServerTiles;
        me.map = me.createMap();
        me.clusterOptions();
        me.map.addLayer(me.vectorLayer);
    },

    setMarkers: function (call, brigades) {
        Isidamaps.app.getController('AppController').readMarkersBrigadeForAssign(call, brigades);
    },

    listenerStore: function () {
        Ext.getStore('Isidamaps.store.BrigadesFirstLoadStore').on('add', function (store, records, options) {
            this.storeBrigade(records)
        }, this);
        Ext.getStore('Isidamaps.store.CallsFirstLoadStore').on('add', function (store, records, options) {
            this.storeCall(records)
        }, this);

    },

    createRoute: function () {
        const me = this,
            arrayRoute = [];
        let arrpoints = [];
        if (me.callMarkers.length > 0 && me.brigadesMarkers.length > 0) {
            let coordCall = me.callMarkers[0].getGeometry().getCoordinates();
            me.getNearest(coordCall).then(function (coord_street) {
                let callCoord = coord_street;
                me.brigadesMarkers.forEach(function (feature) {
                    const coordBrigade = feature.getGeometry().getCoordinates();
                    me.getNearest(coordBrigade).then(function (coord_street) {
                        const point1 = callCoord.join(),
                            point2 = coord_street.join(),
                            routeDraw = function () {
                                fetch(me.urlOpenStreetServerRoute + '/route/v1/driving/' + point2 + ';' + point1).then(function (response) {
                                    return response.json();
                                }).then(function (json) {
                                    if (json.code === 'Ok') {
                                        const polyline = json.routes[0].geometry;
                                        let route = new ol.format.Polyline({
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
                                                brigadeNum: me.getCustomOptions(feature).brigadeNum
                                            }
                                        });
                                        const styles = {
                                            route: new ol.style.Style({
                                                stroke: new ol.style.Stroke({
                                                    width: 4, color: [255, 0, 0, 0.8]
                                                })
                                            })
                                        };
                                        const routeList = {
                                            brigade: feature,
                                            route: json
                                        };
                                        route.setStyle(styles.route);
                                        arrayRoute.push(route);
                                        const vectorSourceRoute = new ol.source.Vector({
                                            features: arrayRoute
                                        });
                                        const vectorLayerRoute = new ol.layer.Vector({
                                            source: vectorSourceRoute
                                        });
                                        me.map.addLayer(vectorLayerRoute);
                                        me.arrRouteForTable.push(routeList);
                                        arrpoints = route.getProperties().geometry.flatCoordinates;
                                        me.arrRoute.push({
                                            brigadeId: feature.getProperties().id,
                                            objectType: me.getCustomOptions(feature).objectType,
                                            profile: me.getCustomOptions(feature).profile,
                                            brigadeNum: me.getCustomOptions(feature).brigadeNum,
                                            station: me.getCustomOptions(feature).station,
                                            longitude: feature.getProperties().geometry.flatCoordinates[1],
                                            latitude: feature.getProperties().geometry.flatCoordinates[0],
                                            distance: (json.routes[0].distance / 1000).toFixed(1),
                                            time: (json.routes[0].duration / 60).toFixed(0),
                                            route: arrpoints
                                        });
                                        me.createTableRoute();
                                        me.callback();
                                        arrpoints = [];
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
        me.addBrigadesOnMap();
    },

    callback: function () {
        const me = this;
        if (me.arrRoute.length === me.brigadesMarkers.length) {
            ASOV.setRoutes(me.arrRoute);
        }
    },

    createAnswer: function () {
        const store = Ext.getStore('Isidamaps.store.RouteForTableStore'),
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
    }
});