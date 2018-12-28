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
    brigadeStatusesMap: (function () {
        const map = Ext.create('Ext.util.HashMap');
        map.add('FREE', '123');
        return map;
    })(),
    listen: {
        global: {
            checkedProfileBrigade: 'checkedProfileBrigade',
            checkedStatusBrigade: 'checkedStatusBrigade',
            checkedStationBrigade: 'checkedStationBrigade',
            checkedCallStatus: 'checkedCallStatus',
            addButtonsBrigadeOnPanel: 'addButtonsBrigadeOnPanel',
            addStationFilter: 'addStationFilter',
            getButtonBrigadeForChangeButton: 'getButtonBrigadeForChangeButton',
            buttonSearch: 'buttonSearch'
        }
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
        if (checkboxChecked === false) {
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
        }
        if (checkboxChecked === true) {
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
        }
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
                    if (checkbox.checked === true) {
                        i++
                    }
                });
                if (stationFilter.items.length === i + 1) {
                    me.lookupReference('allStation').setValue(false)
                }
                me.Monitoring.brigadesMarkers.forEach(function (brigade) {
                    if (checkboxValue === brigade.getProperties().customOptions.station && me.Monitoring.vectorSource.hasFeature(brigade)) {
                        me.Monitoring.vectorSource.removeFeature(brigade);
                    }
                });
                me.Monitoring.callMarkers.forEach(function (call) {
                    if (checkboxValue === call.getProperties().customOptions.station && me.Monitoring.vectorSource.hasFeature(call)) {
                        me.Monitoring.vectorSource.removeFeature(call);
                    }
                })
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
                })
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
        const me = this,
            property = me.getViewModel().getStore('Property');
        property.load(function (records) {
            records.forEach(function (data) {
                me.urlGeodata = data.get('urlGeodata');
                me.urlWebSocket = data.get('urlWebSocket');
                me.urlOpenStreetServerRoute = data.get('urlOpenStreetServerRoute');
                me.urlOpenStreetServerTiles = data.get('urlOpenStreetServerTiles');
            });
            me.createMap();
        });
    },

    connect: function () {
        let me = this,
            socket = new SockJS(me.urlWebSocket + '/geo');
        me.stompClient = Stomp.over(socket);
        me.stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                me.stompClient.subscribe('/geo-queue/geodata-updates', function (greeting) {
                    console.dir(greeting);
                    me.showGreeting(JSON.parse(greeting.body));
                });
            }.bind(this),
            function (e) {
                console.error(e, "Reconnecting WS");
                window.setTimeout(function () {
                    this.connect();
                }.bind(this), 2500);
            }.bind(this)
        );
    },

    showGreeting: function (message) {
        const me = this;
        console.dir(message);
        message.station = '' + message.station;
        if (me.Monitoring.station.indexOf(message.station) !== -1) {
            if (message.objectType === 'BRIGADE') {
                const storeBrigades = me.getViewModel().getStore('Brigades');
                storeBrigades.loadRawData(message);
                me.Monitoring.createMarkers();
            }
            if (message.objectType === 'CALL') {
                const storeCalls = me.getViewModel().getStore('Calls');
                storeCalls.loadRawData(message);
                me.Monitoring.createMarkers();
            }
        }
    },

    sendName: function () {

    },

    disconnect: function () {
        stompClient.disconnect();
        console.log("Disconnected");
    },

    createMap: function () {
        const me = this;
        me.connect();
        me.Monitoring = Ext.create('Isidamaps.services.monitoringView.MapService', {
            viewModel: me.getViewModel(),
            markerClick: me.markerClick.bind(me),
            clustersClick: me.clustersClick.bind(me),
            filterBrigadeArray: me.filterBrigadeArray,
            filterCallArray: me.filterCallArray,
            urlGeodata: me.urlGeodata,
            urlOpenStreetServerTiles: me.urlOpenStreetServerTiles,
            getStoreMarkerInfo: me.getStoreMarkerInfo
        });
        me.Monitoring.optionsObjectManager();
        ASOV.setMapManager({
            setStation: me.Monitoring.setStation.bind(this)
        }, Ext.History.currentToken);
        const ymapWrapper = me.lookupReference('ymapWrapper');
        ymapWrapper.on('resize', function () {
            me.Monitoring.resizeMap(me.Monitoring);
        });
        setInterval(function () {
            window.location.reload();
        }, 1800000);
    },

    addStationFilter: function () {
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
    },

    getButtonBrigadeForChangeButton: function (brigade) {
        const me = this,
            buttonBrigade = me.lookupReference('BrigadePanel'),
            brigadeHave = buttonBrigade.items.getByKey('id' + brigade.getProperties().id);
        if (brigadeHave === undefined) {
            me.addButtonsBrigadeOnPanel();
        }
    },

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
    },

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
    },

    getStoreMarkerInfo: function (object) {
        const me = this,
            urlInfoMarker = Ext.String.format(me.urlGeodata + '/info?objectid={0}&objecttype={1}',
                object.getProperties().id, object.getProperties().customOptions.objectType);
        if (object.getProperties().customOptions.objectType === 'BRIGADE') {
            return Ext.create('Ext.data.Store', {
                model: 'Isidamaps.model.InfoBrigade',
                proxy: {
                    type: 'ajax',
                    url: urlInfoMarker,
                    reader: {
                        type: 'json',
                        rootProperty: 'additionalInfo.brigade'
                    }
                },
                autoLoad: false
            });
        }
        if (object.getProperties().customOptions.objectType === 'CALL') {
            return Ext.create('Ext.data.Store', {
                model: 'Isidamaps.model.InfoCall',
                proxy: {
                    type: 'ajax',
                    url: urlInfoMarker,
                    reader: {
                        type: 'json',
                        rootProperty: 'additionalInfo.call'
                    }
                },
                autoLoad: false
            });
        }
        if (object.getProperties().customOptions.objectType === 'MEDORG') {
            return Ext.create('Ext.data.Store', {
                model: 'Isidamaps.model.InfoMedorgs',
                proxy: {
                    type: 'ajax',
                    url: urlInfoMarker,
                    reader: {
                        type: 'json',
                        rootProperty: 'additionalInfo.megOrg'
                    }
                },
                autoLoad: false
            });
        }
    },

    layoutReady: function () {
        const me = this;
        me.fireTabEvent(me.lookupReference('navigationPanel'));
        me.fireTabEvent(me.lookupReference('BrigadePanel'));
    },

    tabChange: function (panel, newTab, oldTab) {
        oldTab.fireEvent('tabExit');
        this.fireTabEvent(newTab);
    },

    fireTabEvent: function (tab) {
        tab.fireEvent('tabEnter');
    },

    errorMessage: function (msg) {
        Ext.Msg.show({
            title: 'Ошибка',
            message: msg,
            icon: Ext.Msg.ERROR,
            buttons: Ext.Msg.OK
        });
    },

    clustersClick: function (coords, cluster) {
        const me = this,
            ymapWrapper = Ext.getCmp('mapId'),
            sizeCmp = ymapWrapper.getSize(),
            win = Ext.WindowManager.getActive();
        if (win) {
            win.close();
        }

        if ((sizeCmp.width / 2.1) < coords[0]) {
            coords[0] -= 400;
            coords[1] += 50;
        } else {
            coords[0] += 300;
            coords[1] += 50;
        }
        if ((sizeCmp.height / 1.4) < coords[1]) {
            coords[1] -= 550;
        }
        Ext.create('Ext.window.Window', {
            title: 'Кластер',
            constrain: true,
            layout: 'hbox',
            resizable: false,
            border: 'fit',
            width: 750,
            height: 480,
            scrollable: 'vertical',
            items: [{
                xtype: 'panel',
                id: 'markerInClustersId',
                autoScroll: true,
                layout: 'vbox',
                height: '100%f',
                width: '25%'
            }, {
                xtype: 'panel',
                id: 'infoMarkerId',
                autoScroll: true,
                height: '100%',
                width: '75%'
            }]
        }).showAt(coords);
        const markerInClusters = Ext.getCmp('markerInClustersId');
        markerInClusters.removeAll();
        const infoMarker = Ext.getCmp('infoMarkerId');
        cluster.getProperties().features.forEach(function (marker) {
            if (marker.getProperties().customOptions.objectType === 'CALL') {
                function f() {
                    if (marker.getProperties().customOptions.status === 'NEW') {
                        return 'Новый';
                    }
                    if (marker.getProperties().customOptions.status === 'COMPLETED') {
                        return 'Завершен';
                    }
                    if (marker.getProperties().customOptions.status === 'ASSIGNED') {
                        return 'Исполнение';
                    }
                    return "";
                }

                markerInClusters.add(Ext.create('Ext.Button', {
                    text: 'Выз.№ ' + marker.getProperties().customOptions.callCardNum + " " + f(),
                    maxWidth: 170,
                    minWidth: 170,
                    margin: 5,
                    listeners: {
                        click: function () {
                            const storeMarker = me.getStoreMarkerInfo(marker);
                            infoMarker.removeAll();
                            storeMarker.load({
                                callback: function (records, operation, success) {
                                    if ((success === true && records.length === 0) || success === false) {
                                        me.errorMessage('Данные о вызове временно не доступны');
                                        return;
                                    }
                                    infoMarker.add(Ext.create('Ext.Panel', {
                                        layout: 'form',
                                        border: 'fit',
                                        autoScroll: true,
                                        resizable: false,
                                        width: '100%',
                                        items: me.callInfoForm,
                                        listeners: {
                                            afterrender: function (component) {
                                                const form = component.down('form');
                                                form.loadRecord(storeMarker.first());
                                            }
                                        }
                                    }))
                                }
                            })
                        }
                    }
                }))
            }
            if (marker.getProperties().customOptions.objectType === 'BRIGADE') {
                markerInClusters.add(Ext.create('Ext.Button', {
                    text: 'Бр.№ ' + marker.getProperties().customOptions.brigadeNum + " " + "(" + marker.getProperties().customOptions.profile + ")" + " " + marker.getProperties().customOptions.station,
                    maxWidth: 170,
                    minWidth: 170,
                    margin: 5,
                    listeners: {
                        click: function () {
                            const storeMarker = me.getStoreMarkerInfo(marker);
                            infoMarker.removeAll();
                            storeMarker.load({
                                callback: function (records, operation, success) {
                                    if ((success === true && records.length === 0) || success === false) {
                                        me.errorMessage('Данные о бригаде временно недоступны');
                                        return;
                                    }
                                    const status = me.brigadeStatusesMap.get(records[0].get('status') || 'Неизвестно');
                                    infoMarker.add(Ext.create('Ext.Panel', {
                                        layout: 'form',
                                        border: 'fit',
                                        autoScroll: true,
                                        resizable: false,
                                        width: '100%',
                                        items: [{
                                            xtype: 'form',
                                            autoScroll: true,
                                            height: '100%',
                                            width: '100%',
                                            items: [{
                                                xtype: 'displayfield',
                                                name: 'brigadeNum',
                                                fieldLabel: 'Номер бригады',
                                                labelWidth: '100%',
                                                margin: 0
                                            }, {
                                                xtype: 'displayfield',
                                                name: 'station',
                                                fieldLabel: 'Номер подстанции',
                                                labelWidth: '100%',
                                                margin: 0
                                            }, {
                                                xtype: 'displayfield',
                                                value: marker.getProperties().customOptions.profile,
                                                fieldLabel: 'Профиль бригады',
                                                labelWidth: '100%',
                                                margin: 0
                                            }, {
                                                xtype: 'displayfield',
                                                value: status,
                                                fieldLabel: 'Статус бригады',
                                                labelWidth: '100%',
                                                margin: 0
                                            }, {
                                                xtype: 'displayfield',
                                                fieldLabel: 'Старший бригады',
                                                name: 'chefName',
                                                labelWidth: '100%',
                                                margin: 0
                                            }, {
                                                xtype: 'displayfield',
                                                name: 'callCardNum',
                                                fieldLabel: 'Вызов',
                                                labelWidth: '100%',
                                                margin: 0
                                            }, {
                                                xtype: 'displayfield',
                                                name: 'address',
                                                fieldLabel: 'Адрес места вызова',
                                                labelWidth: 150,
                                                margin: 0
                                            }, {
                                                xtype: 'displayfield',
                                                name: 'passToBrigadeTime',
                                                fieldLabel: 'Время получения бригадой',
                                                renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
                                                labelWidth: '100%',
                                                margin: 0
                                            }]
                                        }],
                                        listeners: {
                                            afterrender: function (component) {
                                                const form = component.down('form');
                                                form.loadRecord(storeMarker.first());
                                            }
                                        }
                                    }))
                                }
                            })
                        }
                    }
                }))
            }
        })
    },

    markerClick: function (object, coord, infoMarker) {
        const me = this,
            win = Ext.WindowManager.getActive();
        if (win) {
            win.close();
        }

        const ymapWrapper = Ext.getCmp('mapId'),
            sizeCmp = ymapWrapper.getSize();

        sizeCmp.width = sizeCmp.width * 1.55;
        if (object.getProperties().customOptions.objectType === 'BRIGADE') {
            if ((sizeCmp.width / 2) < coord[0]) {
                coord[0] -= 500;
                coord[1] += 20;
            }
            if ((sizeCmp.height / 2) < coord[1]) {
                coord[1] -= 270;
            }
            infoMarker.load({
                callback: function (records, operation, success) {
                    if ((success === true && records.length === 0) || success === false) {
                        me.errorMessage('Данные о бригаде временно не доступны');
                        return;
                    }
                    let status = me.brigadeStatusesMap.get(records[0].get('status')) || 'Неизвестно';
                    Ext.create('Ext.window.Window', {
                        title: 'Бригада',
                        layout: 'form',
                        border: 'fit',
                        autoScroll: true,
                        resizable: false,
                        width: 500,
                        constrain: true,
                        items: [{
                            xtype: 'form',
                            autoScroll: true,
                            height: '100%',
                            width: '100%',
                            items: [{
                                xtype: 'displayfield',
                                name: 'brigadeNum',
                                fieldLabel: 'Номер бригады',
                                labelWidth: '100%',
                                margin: 0
                            }, {
                                xtype: 'displayfield',
                                name: 'station',
                                fieldLabel: 'Номер подстанции',
                                labelWidth: '100%',
                                margin: 0
                            }, {
                                xtype: 'displayfield',
                                value: object.getProperties().customOptions.profile,
                                fieldLabel: 'Профиль бригады',
                                labelWidth: '100%',
                                margin: 0
                            }, {
                                xtype: 'displayfield',
                                value: status,
                                fieldLabel: 'Статус бригады',
                                labelWidth: '100%',
                                margin: 0
                            }, {
                                xtype: 'displayfield',
                                fieldLabel: 'Старший бригады',
                                name: 'chefName',
                                labelWidth: '100%',
                                margin: 0
                            }, {
                                xtype: 'displayfield',
                                name: 'callCardNum',
                                fieldLabel: 'Вызов',
                                labelWidth: '100%',
                                margin: 0
                            }, {
                                xtype: 'displayfield',
                                name: 'address',
                                fieldLabel: 'Адрес места вызова',
                                labelWidth: 150,
                                margin: 0
                            }, {
                                xtype: 'displayfield',
                                name: 'passToBrigadeTime',
                                fieldLabel: 'Время получения бригадой',
                                renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
                                labelWidth: '100%',
                                margin: 0
                            }]
                        }],
                        listeners: {
                            afterrender: function (component) {
                                const form = component.down('form');
                                form.loadRecord(infoMarker.first());
                            }
                        }
                    }).showAt(coord);
                }
            })
        }
        if (object.getProperties().customOptions.objectType === 'CALL') {
            if ((sizeCmp.width / 2) < coord[0]) {
                coord[0] -= 400;
                coord[1] += 20;
            }
            if ((sizeCmp.height / 2) < coord[1]) {
                coord[0] += 50;
                coord[1] -= 490;
            }
            infoMarker.load({
                callback: function (records, operation, success) {
                    if ((success === true && records.length === 0) || success === false) {
                        me.errorMessage('Данные о вызове временно недоступны');
                        return;
                    }
                    Ext.create('Ext.window.Window', {
                        title: 'Вызов',
                        layout: 'form',
                        id: 'winId',
                        border: 'fit',
                        constrain: true,
                        autoScroll: true,
                        resizable: false,
                        width: 550,
                        items: me.callInfoForm,
                        listeners: {
                            afterrender: function (component) {
                                const form = component.down('form');
                                form.loadRecord(infoMarker.first());
                            }
                        }
                    }).showAt(coord);
                }
            })
        }
    }
});
