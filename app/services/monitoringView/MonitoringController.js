Ext.define('Isidamaps.services.monitoringView.MonitoringController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.monitoring',
    Monitoring: null,
    filterBrigadeArray: [],
    filterCallArray: [],
    stompClient: null,
    urlGeodata: null,
    urlWebSocket: null,
    urlOpenStreetServerRoute: null,
    urlOpenStreetServerTiles: null,
    listen: {
        global: {
            checkedProfileBrigade: 'checkedProfileBrigade',
            checkedStatusBrigade: 'checkedStatusBrigade',
            checkedStationBrigade: 'checkedStationBrigade',
            checkedCallStatus: 'checkedCallStatus',
            addButtonsBrigadeOnPanel: 'addButtonsBrigadeOnPanel',
            addStationFilter: 'addStationFilter',
            getButtonBrigadeForChangeButton: 'getButtonBrigadeForChangeButton',
            buttonSearch: 'buttonSearch',
            deletingAllMarkers: 'deletingAllMarkers'
        }
    },

    deletingAllMarkers: function () {
        var me = this;
        me.Monitoring.vectorSource.clear();
    },

    buttonSearch: function () {
        const me = this;
        let searchTrue = null;
        const searchText = Ext.getCmp('searchTextField').getValue();
        me.Monitoring.vectorLayer.getSource().getFeatures().forEach(function (features) {
            features.getProperties().features.forEach(function (feature) {
                if (feature.getProperties().customOptions.brigadeNum === searchText) {
                    me.Monitoring.map.getView().setCenter(features.getProperties().geometry.flatCoordinates);
                    me.Monitoring.map.getView().setZoom(18);
                    searchTrue = feature;
                    me.flash(features);
                    const t = setInterval(function run() {
                        me.flash(features);
                    }, 2000);

                    setTimeout(function () {
                        clearInterval(t);
                    }, 9000);
                }
            })
        });
        if (searchTrue === null) {
            Ext.getCmp('searchTextField').setActiveError('Не найдена бригада с данным номером');
        }
    },

    checkedCallStatus: function (checkbox) {
        const me = this,
            checkboxValue = checkbox.inputValue,
            checkboxChecked = checkbox.checked,
            stBf = this.lookupReference('callStatusFilter');
        if (checkboxChecked) {
            const index = me.filterCallArray.indexOf(checkboxValue);
            let j = 0;
            me.filterCallArray.splice(index, 1);
            me.Monitoring.callMarkers.forEach(function (call) {
                if (checkboxValue === call.getProperties().customOptions.status) {
                    if (me.filterCallArray.indexOf(call.getProperties().customOptions.station) === -1) {
                        me.Monitoring.vectorSource.addFeature(call);

                    }
                }
            });
            stBf.items.each(function (checkbox) {
                if (checkbox.checked === true) {
                    j++
                }
            });
            if (stBf.items.length === j) {
                me.lookupReference('allCalls').setValue(true)
            }
            return;
        }

        me.filterCallArray.push(checkboxValue);
        let i = 0;
        stBf.items.each(function (checkbox) {
            if (checkbox.checked === true) {
                i++
            }
        });
        if (stBf.items.length === i + 1) {
            me.lookupReference('allCalls').setValue(false)
        }
        me.Monitoring.callMarkers.forEach(function (call) {
            if (checkboxValue === call.getProperties().customOptions.status && me.Monitoring.vectorSource.hasFeature(call)) {
                me.Monitoring.vectorSource.removeFeature(call);
            }
        });
    },

    checkedStationBrigade: function (checkbox) {

        function func(checkbox, me) {
            const checkboxValue = checkbox.inputValue,
                checkboxChecked = checkbox.checked,
                stationFilter = me.lookupReference('stationFilter');
            if (checkboxChecked === false) {
                me.filterCallArray.push(checkboxValue);
                me.filterBrigadeArray.push(checkboxValue);
                let i = 0;
                stationFilter.items.each(function (checkbox) {
                    if (checkbox.checked) {
                        i++;
                    }
                });
                if (stationFilter.items.length === i + 1) {
                    me.lookupReference('allStation').setValue(false)
                }
                me.Monitoring.vectorSource.getFeatures().forEach(function (marker) {
                    if (checkboxValue === marker.getProperties().customOptions.station) {
                        me.Monitoring.vectorSource.removeFeature(marker);
                    }
                });
            }
            if (checkboxChecked === true) {
                const indexBrigade = me.filterBrigadeArray.indexOf(checkboxValue),
                    indexCall = me.filterCallArray.indexOf(checkboxValue);
                let j = 0;
                me.filterBrigadeArray.splice(indexBrigade, 1);
                me.filterCallArray.splice(indexCall, 1);
                me.Monitoring.brigadesMarkers.forEach(function (brigade) {
                    if (checkboxValue === brigade.getProperties().customOptions.station) {
                        if (me.filterBrigadeArray.indexOf(brigade.getProperties().customOptions.status) === -1 && me.filterBrigadeArray.indexOf(brigade.getProperties().customOptions.profile) === -1) {
                            me.Monitoring.vectorSource.addFeature(brigade);
                        }
                    }
                });
                me.Monitoring.callMarkers.forEach(function (call) {
                    if (checkboxValue === call.getProperties().customOptions.station) {
                        if (me.filterCallArray.indexOf(call.getProperties().customOptions.status) === -1 && call.getProperties().customOptions.status !== "COMPLETED") {
                            me.Monitoring.vectorSource.addFeature(call);
                        }
                    }
                });
                stationFilter.items.each(function (checkbox) {
                    if (checkbox.checked === true) {
                        j++
                    }
                });
                if (stationFilter.items.length === j) {
                    me.lookupReference('allStation').setValue(true)
                }
            }
            me.addButtonsBrigadeOnPanel();
        }

        setTimeout(func(checkbox, this), 40);
    },

    checkedProfileBrigade: function (checkbox) {
        function func(checkbox, me) {
            const checkboxValue = checkbox.inputValue,
                checkboxChecked = checkbox.checked,
                profileBrigadeFilter = me.lookupReference('profileBrigadeFilter');
            if (checkboxChecked === false) {
                me.filterBrigadeArray.push(checkboxValue);
                let i = 0;
                profileBrigadeFilter.items.each(function (checkbox) {
                    if (checkbox.checked === true) {
                        i++
                    }
                });
                if (profileBrigadeFilter.items.length === i + 1) {
                    me.lookupReference('allProfile').setValue(false)
                }
                me.Monitoring.brigadesMarkers.forEach(function (brigade) {
                    if (checkboxValue === brigade.getProperties().customOptions.profile && me.Monitoring.vectorSource.hasFeature(brigade)) {
                        me.Monitoring.vectorSource.removeFeature(brigade);
                    }
                });
            }
            if (checkboxChecked === true) {
                const index = me.filterBrigadeArray.indexOf(checkboxValue);
                let j = 0;
                me.filterBrigadeArray.splice(index, 1);
                me.Monitoring.brigadesMarkers.forEach(function (brigade) {
                    if (checkboxValue === brigade.getProperties().customOptions.profile) {
                        if (me.filterBrigadeArray.indexOf(brigade.getProperties().customOptions.status) === -1 && me.filterBrigadeArray.indexOf(brigade.getProperties().customOptions.station) === -1) {
                            me.Monitoring.vectorSource.addFeature(brigade);
                        }
                    }
                });
                profileBrigadeFilter.items.each(function (checkbox) {
                    if (checkbox.checked === true) {
                        j++
                    }
                });
                if (profileBrigadeFilter.items.length === j) {
                    me.lookupReference('allProfile').setValue(true)
                }
            }
            me.addButtonsBrigadeOnPanel();
        }

        setTimeout(func(checkbox, this), 40);
    },

    checkedStatusBrigade: function (checkbox) {
        function func(checkbox, me) {
            let checkboxValue = checkbox.inputValue,
                checkboxChecked = checkbox.checked,
                statusBrigadeFilter = me.lookupReference('statusBrigadeFilter');
            if (checkboxChecked === false) {
                me.filterBrigadeArray.push(checkboxValue);
                let i = 0;
                statusBrigadeFilter.items.each(function (checkbox) {
                    if (checkbox.checked === true) {
                        i++
                    }
                });
                if (statusBrigadeFilter.items.length === i + 1) {
                    me.lookupReference('allStatus').setValue(false)
                }
                me.Monitoring.brigadesMarkers.forEach(function (brigade) {
                    if (checkboxValue === brigade.getProperties().customOptions.status && me.Monitoring.vectorSource.hasFeature(brigade)) {
                        me.Monitoring.vectorSource.removeFeature(brigade);
                    }
                })
            }
            if (checkboxChecked === true) {
                const index = me.filterBrigadeArray.indexOf(checkboxValue);
                let j = 0;
                me.filterBrigadeArray.splice(index, 1);
                me.Monitoring.brigadesMarkers.forEach(function (brigade) {
                    if (checkboxValue === brigade.getProperties().customOptions.status) {
                        if (me.filterBrigadeArray.indexOf(brigade.getProperties().customOptions.profile) === -1 && me.filterBrigadeArray.indexOf(brigade.getProperties().customOptions.station) === -1) {
                            me.Monitoring.vectorSource.addFeature(brigade);
                        }
                    }
                });
                statusBrigadeFilter.items.each(function (checkbox) {
                    if (checkbox.checked === true) {
                        j++
                    }
                });
                if (statusBrigadeFilter.items.length === j) {
                    me.lookupReference('allStatus').setValue(true)
                }
            }
            me.addButtonsBrigadeOnPanel();
        }

        setTimeout(func(checkbox, this), 40);
    },

    mainBoxReady: function () {
        const me = this;
        Ext.defer(me.createMap, 100, me);
    },

    connect: function () {
        const me = this,
            socket = new SockJS(me.urlWebSocket + '/geo');
        me.stompClient = Stomp.over(socket);
        me.stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                me.stompClient.subscribe('/geo-queue/geodata-updates', function (msg) {
                    console.dir(msg);
                    me.loadSocketData(JSON.parse(msg.body));
                });
            }.bind(me),
            function (e) {
                console.error(e, "Reconnecting WS");
                Ext.defer(me.connect, 2500, me);
            }.bind(me)
        );
    },

    loadSocketData: function (message) {
        const me = this;
        console.dir(message);
        message.station = '' + message.station;
        if (me.Monitoring.station.indexOf(message.station) === -1) {
            return;
        }
        const store = me.getViewModel().getStore(message.objectType === 'BRIGADE' ? 'Brigades' : 'Calls');
        store.add(message);
    },

    disconnect: function () {
        stompClient.disconnect();
        console.log("Disconnected");
    },

    createMap: function () {
        const me = this;
        me.urlWebSocket = Isidamaps.getApplication().getController('GlobalController').urlWebSocket,
            me.urlGeodata = Isidamaps.getApplication().getController('GlobalController').urlGeodata,
            me.urlOpenStreetServerTiles = Isidamaps.getApplication().getController('GlobalController').urlOpenStreetServerTiles,
            me.connect();
        me.Monitoring = Ext.create('Isidamaps.services.monitoringView.MapService', {
            viewModel: me.getViewModel(),
            markerClick: me.markerClick.bind(me),
            filterBrigadeArray: me.filterBrigadeArray,
            filterCallArray: me.filterCallArray,
            urlGeodata: me.urlGeodata,
            urlOpenStreetServerTiles: me.urlOpenStreetServerTiles
        })
        ;
        me.Monitoring.optionsObjectManager();
        ASOV.setMapManager({
            setStation: me.Monitoring.setStation.bind(me)
        }, Ext.History.currentToken);
        me.Monitoring.readStation(['9']);
        const ymapWrapper = me.lookupReference('ymapWrapper');
        ymapWrapper.on('resize', function () {
            me.Monitoring.resizeMap(me.Monitoring);
        });
        setInterval(function () {
            window.location.reload();
        }, 1800000);

    },

    addStationFilter:

        function () {
            const me = this,
                checkboxStation = me.lookupReference('stationFilter'),
                records = me.Monitoring.station;
            records.forEach(function (rec) {
                checkboxStation.add(Ext.create('Ext.form.field.Checkbox', {
                    boxLabel: rec,
                    inputValue: rec,
                    checked: true,
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedStationBrigade', checkbox, checked);
                            }
                        }
                    }
                }));
            })
        }

    ,

    getButtonBrigadeForChangeButton: function (brigade) {
        const me = this,
            buttonBrigade = me.lookupReference('BrigadePanel'),
            brigadeHave = buttonBrigade.items.getByKey('id' + brigade.getProperties().id);
        if (brigadeHave === undefined) {
            me.addButtonsBrigadeOnPanel();
        }
    }
    ,

    addButtonsBrigadeOnPanel: function () {
        const me = this,
            buttonBrigade = me.lookupReference('BrigadePanel'),
            brigadeSort = [];
        buttonBrigade.removeAll();
        me.Monitoring.vectorLayer.getSource().getFeatures().forEach(function (features) {
            features.getProperties().features.forEach(function (feature) {
                if (feature.getProperties().customOptions.objectType === 'BRIGADE') {
                    brigadeSort.push(feature);
                }
            })
        });

        brigadeSort.sort(function (a, b) {
            return a.getProperties().customOptions.brigadeNum - b.getProperties().customOptions.brigadeNum
        });

        brigadeSort.forEach(function (e) {
            if (e.getProperties().customOptions.brigadeNum === undefined) {
                return;
            }
            buttonBrigade.add(Ext.create('Ext.Button', {
                text: e.getProperties().customOptions.brigadeNum + " " + "(" + e.getProperties().customOptions.profile + ")" + " " + e.getProperties().customOptions.station,
                maxWidth: 110,
                minWidth: 110,
                margin: 5,
                listeners: {
                    click: function (r) {
                        me.Monitoring.vectorSource.forEachFeature(function (features) {
                            const idE = e.getProperties().id,
                                idF = features.getProperties().id;
                            if (idF === idE) {   //для того что me.markerClick() нужен features
                                const infoMarker = me.getStoreMarkerInfo(features);
                                me.markerClick(features, [r.getXY()[0] + 110, r.getXY()[1] + 30], infoMarker);
                                me.Monitoring.map.getView().setCenter(features.getProperties().geometry.flatCoordinates);
                                me.Monitoring.map.getView().setZoom(18);
                                me.flash(features);
                                const t = setInterval(function run() {
                                    me.flash(features);
                                }, 2000);

                                setTimeout(function () {
                                    clearInterval(t);
                                }, 6000);
                            }
                        });
                    }
                }
            }))
        })
    }
    ,

    flash: function (features) {
        const me = this,
            listenerKey = me.Monitoring.map.on('postcompose', animate),
            start = new Date().getTime(),
            duration = 3000;

        me.Monitoring.map.render();

        function animate(evt) {
            const vectorContext = evt.vectorContext,
                frameState = evt.frameState,
                flashGeom = features.getGeometry().clone(),
                elapsed = frameState.time - start,
                elapsedRatio = elapsed / duration;
            // radius will be 5 at start and 30 at end.
            const radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
            const opacity = ol.easing.easeOut(1 - elapsedRatio);

            const style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(255, 0, 0, ' + opacity + ')',
                        width: 0.25 + opacity
                    })
                })
            });
            vectorContext.setStyle(style);
            vectorContext.drawGeometry(flashGeom);
            if (elapsed > duration) {
                new ol.Observable.unByKey(listenerKey);
                return;
            }
            // tell OpenLayers to continue postcompose animation
            me.Monitoring.map.render();
        }
    }
    ,

    layoutReady: function () {
        const me = this;
        me.fireTabEvent(me.lookup('navigationPanel'));
        me.fireTabEvent(me.lookup('BrigadePanel'));
    }
    ,

    tabChange: function (panel, newTab, oldTab) {
        oldTab.fireEvent('tabExit');
        this.fireTabEvent(newTab);
    }
    ,

    fireTabEvent: function (tab) {
        tab.fireEvent('tabEnter');
    }
    ,

    errorMessage: function (msg) {
        Ext.Msg.show({
            title: 'Ошибка',
            message: msg,
            icon: Ext.Msg.ERROR,
            buttons: Ext.Msg.OK
        });
    }
    ,


    markerClick: function (object, coord, infoMarker) {
        const me = this,
            win = Ext.WindowManager.getActive();
        if (win) {
            win.close();
        }

        const sizeCmp = Ext.getCmp('mapId').getSize(),
            params = {
                objecttype: object.getProperties().customOptions.objectType,
                objectid: object.getProperties().id
            };

        sizeCmp.width = sizeCmp.width * 1.55;
        const options = {
            params: params,
            store: infoMarker,
            coord: coord,
            sizeCmp: sizeCmp
        };
        if (object.getProperties().customOptions.objectType === 'BRIGADE') {
            me.brigadeMarkerClick(options);
            return;
        }

        me.callMarkerClick(options);
    }
    ,

    brigadeMarkerClick: function (options) {
        const me = this,
            coord = options.coord,
            sizeCmp = options.sizeCmp;
        if ((sizeCmp.width / 2) < coord[0]) {
            coord[0] -= 500;
            coord[1] += 20;
        }
        if ((sizeCmp.height / 2) < coord[1]) {
            coord[1] -= 270;
        }
        options.store.load({
            params: options.params,
            callback: function (records, operation, success) {
                if ((success === true && records.length === 0) || success === false) {
                    me.errorMessage('Данные о бригаде временно не доступны');
                    return;
                }
                // FIXME define formula in VM
                const status = me.brigadeStatusesMap.get(records[0].get('status')) || 'Неизвестно',
                    record = records[0];
                record.set('status', status);
                const brigadeInfoWidget = Ext.widget('brigadeInfoWindow'),
                    brigadeInfoViewModel = brigadeInfoWidget.getViewModel();
                brigadeInfoViewModel.set('record', record);
                brigadeInfoWidget.show()/*At(coord)*/;
            }
        });
    }
    ,

    callMarkerClick: function (options) {
        const me = this,
            coord = options.coord,
            sizeCmp = options.sizeCmp;
        if ((sizeCmp.width / 2) < coord[0]) {
            coord[0] -= 400;
            coord[1] += 20;
        }
        if ((sizeCmp.height / 2) < coord[1]) {
            coord[0] += 50;
            coord[1] -= 490;
        }
        options.store.load({
            params: options.params,
            callback: function (records, operation, success) {
                if ((success === true && records.length === 0) || success === false) {
                    me.errorMessage('Данные о вызове временно недоступны');
                    return;
                }
                const callInfoWidget = Ext.widget('callInfo'),
                    callInfoViewModel = callInfoWidget.getViewModel();
                callInfoViewModel.set('record', records[0]);
                callInfoWidget.show()/*At(coord)*/;
            }
        })
    }
})
;
