Ext.define('Isidamaps.services.monitoringView.MonitoringController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.monitoring',
    Monitoring: null,
    filterBrigadeArray: [],
    filterCallArray: [],
    stompClient: null,
    urlGeodata: null,
    urlWebSocket: null,
    listen: {
        global: {
            checkedProfileBrigade: 'checkedProfileBrigade',
            checkedStatusBrigade: 'checkedStatusBrigade',
            checkedStationBrigade: 'checkedStationBrigade',
            checkedCallStatus: 'checkedCallStatus',
            addButtonsBrigadeOnPanel: 'addButtonsBrigadeOnPanel',
            addStationFilter: 'addStationFilter'
        }
    },

    checkedCallStatus: function (checkbox) {
        var me = this,
            checkboxValue = checkbox.inputValue,
            checkboxChecked = checkbox.checked,
            stBf = this.lookupReference('callStatusFilter');
        if (checkboxChecked === false) {
            me.filterCallArray.push(checkboxValue);
            var i = 0;
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
            var index = me.filterCallArray.indexOf(checkboxValue),
                j = 0;
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
        var me = this,
            checkboxValue = checkbox.inputValue,
            checkboxChecked = checkbox.checked,
            stationFilter = this.lookupReference('stationFilter');
        if (checkboxChecked === false) {
            me.filterCallArray.push(checkboxValue);
            me.filterBrigadeArray.push(checkboxValue);
            var i = 0;
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
            var indexBrigade = me.filterBrigadeArray.indexOf(checkboxValue),
                indexCall = me.filterCallArray.indexOf(checkboxValue),
                j = 0;
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
    },

    checkedProfileBrigade: function (checkbox) {
        var me = this,
            checkboxValue = checkbox.inputValue,
            checkboxChecked = checkbox.checked,
            profileBrigadeFilter = this.lookupReference('profileBrigadeFilter');
        if (checkboxChecked === false) {
            me.filterBrigadeArray.push(checkboxValue);
            var i = 0;
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
            var index = me.filterBrigadeArray.indexOf(checkboxValue),
                j = 0;
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
    },

    checkedStatusBrigade: function (checkbox) {
        var me = this,
            checkboxValue = checkbox.inputValue,
            checkboxChecked = checkbox.checked,
            statusBrigadeFilter = this.lookupReference('statusBrigadeFilter');
        if (checkboxChecked === false) {
            me.filterBrigadeArray.push(checkboxValue);
            var i = 0;
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
            var index = me.filterBrigadeArray.indexOf(checkboxValue),
                j = 0;
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
    },

    mainBoxReady: function () {
        var me = this,
            property = me.getViewModel().getStore('Property');
        property.load(function (records) {
            records.forEach(function (data) {
                me.urlGeodata = data.get('urlGeodata');
                me.urlWebSocket = data.get('urlWebSocket');
            });
            me.createMap();
        });
    },

    connect: function () {
        var me = this,
            socket = new SockJS(me.urlWebSocket + '/geo');
        me.stompClient = Stomp.over(socket);
        me.stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            me.stompClient.subscribe('/geo-queue/geodata-updates', function (greeting) {
                console.dir(greeting);
                me.showGreeting(JSON.parse(greeting.body));
            });
        });
    },

    showGreeting: function (message) {
        var me = this;
        message.station = '' + message.station;
        if (me.Monitoring.station.indexOf(message.station) !== -1) {
            if (message.objectType === 'BRIGADE') {
                var storeBrigades = me.getViewModel().getStore('Brigades');
                storeBrigades.loadRawData(message);
                me.Monitoring.createMarkers();
            }
            if (message.objectType === 'CALL') {
                var storeCalls = me.getViewModel().getStore('Calls');
                storeCalls.loadRawData(message);
                me.Monitoring.createMarkers();
            }
        }
    },

    sendName: function () {
        //stompClient.send("/app/hello", {}, JSON.stringify({ 'name': name }));
    },
    disconnect: function () {
        stompClient.disconnect();
        console.log("Disconnected");
    },

    createMap: function () {
        var me = this;
        me.connect();
        me.Monitoring = Ext.create('Isidamaps.services.monitoringView.MapService', {
            viewModel: me.getViewModel(),
            markerClick: me.markerClick,
            clustersClick: me.clustersClick,
            filterBrigadeArray: me.filterBrigadeArray,
            filterCallArray: me.filterCallArray,
            urlGeodata: me.urlGeodata,
            getStoreMarkerInfo: me.getStoreMarkerInfo
        });
        me.Monitoring.readStation(['1', '2', '3', '4', '5', '13']);
        me.Monitoring.optionsObjectManager();
        ASOV.setMapManager({
            setStation: me.Monitoring.setStation.bind(this)
        }, Ext.History.currentToken);
        var ymapWrapper = me.lookupReference('ymapWrapper');
        ymapWrapper.on('resize', function () {
            me.Monitoring.resizeMap(me.Monitoring);
        });
    },

    addStationFilter: function () {
        var me = this,
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

    addButtonsBrigadeOnPanel: function () {
        var me = this,
            buttonBrigade = me.lookupReference('BrigadePanel'),
            brigadeSort = [];
        me.Monitoring.vectorLayer.getSource().getFeatures().forEach(function (features) {
            features.getProperties().features.forEach(function (feature) {
                if (feature.getProperties().customOptions.objectType === 'BRIGADE') {
                    brigadeSort.push(feature);
                }
            })
        });
        buttonBrigade.removeAll();
        brigadeSort.sort(function (a, b) {
            return a.getProperties().customOptions.brigadeNum - b.getProperties().customOptions.brigadeNum
        });
        brigadeSort.forEach(function (e) {
            if (e.getProperties().customOptions.brigadeNum !== undefined) {
                buttonBrigade.add(Ext.create('Ext.Button', {
                    text: e.getProperties().customOptions.brigadeNum,
                    minWidth: 70,
                    margin: 5,
                    listeners: {
                        click: function (r) {
                            me.Monitoring.vectorLayer.getSource().getFeatures().forEach(function (features) {
                                if (features.getProperties().features.indexOf(e) !== -1) {
                                    var infoMarker = me.getStoreMarkerInfo(features);
                                    me.markerClick(features, [r.getXY()[0] + 80, r.getXY()[1] + 30], infoMarker);
                                }
                            });
                        }
                    }
                }))
            }
        })
    },

    getStoreMarkerInfo: function (object) {
        console.dir(object);
        var me = this,
            urlInfoMarker = Ext.String.format(me.urlGeodata + '/info?objectid={0}&objecttype={1}', object.getProperties().features[0].getProperties().id, object.getProperties().features[0].getProperties().customOptions.objectType);
        if (object.getProperties().features[0].getProperties().customOptions.objectType === 'BRIGADE') {
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
        if (object.getProperties().features[0].getProperties().customOptions.objectType === 'CALL') {
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
        if (object.getProperties().features[0].getProperties().customOptions.objectType === 'MEDORG') {
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
        this.fireTabEvent(this.lookupReference('navigationPanel'));
        this.fireTabEvent(this.lookupReference('BrigadePanel'));
    },

    tabChange: function (panel, newTab, oldTab) {
        oldTab.fireEvent('tabExit');
        this.fireTabEvent(newTab);
    },

    fireTabEvent: function (tab) {
        tab.fireEvent('tabEnter');
    },

    clustersClick: function (coords, cluster) {
        function errorMessage(marker) {
            var markerMessage = null;
            if (marker === 'CALL') {
                markerMessage = 'Данные о вызове временно не доступны';
            }
            if (marker === 'BRIGADE') {
                markerMessage = 'Данные о бригаде временно не доступны';
            }
            Ext.create('Ext.window.MessageBox').show({
                title: 'Ошибка',
                message: markerMessage,
                icon: Ext.Msg.ERROR,
                buttons: Ext.Msg.OK
            })
        }

        var me = this,
            ymapWrapper = Ext.getCmp('mapId'),
            sizeCmp = ymapWrapper.getSize(),
            win = Ext.WindowManager.getActive();
        if (win) {
            win.close();
        }

        if ((sizeCmp.width / 2) < coords[0]) {
            coords[0] -= 450;
            coords[1] += 50;
        }
        else {
            coords[0] += 300;
            coords[1] += 50;
        }
        if ((sizeCmp.height / 2) < coords[1]) {
            coords[1] -= 550;
        }
        Ext.create('Ext.window.Window', {
            title: 'Кластер',
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
                height: '100%',
                width: '21%'
            },
                {
                    xtype: 'panel',
                    id: 'infoMarkerId',
                    autoScroll: true,
                    height: '100%',
                    width: '79%'
                }
            ]
        }).showAt(coords);
        var markerInClusters = Ext.getCmp('markerInClustersId');
        markerInClusters.removeAll();
        var infoMarker = Ext.getCmp('infoMarkerId');
        cluster.getProperties().features.forEach(function (marker) {
            if (marker.getProperties().customOptions.objectType === 'CALL') {
                markerInClusters.add(Ext.create('Ext.Button', {
                    text: 'Вызов№ ' + marker.getProperties().customOptions.callCardNum,
                    maxWidth: 140,
                    minWidth: 140,
                    margin: 5,
                    listeners: {
                        click: function () {
                            var clusterOneMarker = cluster;
                            clusterOneMarker.getProperties().features = [];
                            clusterOneMarker.getProperties().features.push(marker);
                            var storeMarker = me.getStoreMarkerInfo(clusterOneMarker);
                            infoMarker.removeAll();
                            storeMarker.load({
                                callback: function (records, operation, success) {
                                    if (success === true) {
                                        if (records.length === 0) {
                                            errorMessage('CALL');
                                        }
                                    }
                                    if (success === false) {
                                        try {
                                            errorMessage('CALL');
                                        } catch (e) {
                                            errorMessage('CALL');
                                        }
                                    }
                                    if (success === true) {
                                        if (records.length > 0) {
                                            infoMarker.add(Ext.create('Ext.Panel', {
                                                layout: 'form',
                                                border: 'fit',
                                                autoScroll: true,
                                                resizable: false,
                                                width: '100%',
                                                items: me.callInfoForm,
                                                listeners: {
                                                    afterrender: function (component) {
                                                        var form = component.down('form');
                                                        form.loadRecord(storeMarker.first());
                                                    }
                                                }
                                            }))
                                        }
                                    }
                                }
                            })
                        }
                    }
                }))
            }

            if (marker.getProperties().customOptions.objectType === 'BRIGADE') {
                markerInClusters.add(Ext.create('Ext.Button', {
                    text: 'Бригада № ' + marker.getProperties().customOptions.brigadeNum,
                    maxWidth: 140,
                    minWidth: 140,
                    margin: 5,
                    listeners: {
                        click: function () {
                            var clusterOneMarker = cluster;
                            clusterOneMarker.getProperties().features = [];
                            clusterOneMarker.getProperties().features.push(marker);
                            var storeMarker = me.getStoreMarkerInfo(clusterOneMarker);
                            infoMarker.removeAll();
                            storeMarker.load({
                                callback: function (records, operation, success) {
                                    if (success === true) {
                                        if (records.length === 0) {
                                            errorMessage('BRIGADE');
                                        }
                                    }
                                    if (success === false) {
                                        try {
                                            errorMessage('BRIGADE');
                                        } catch (e) {
                                            errorMessage('BRIGADE');
                                        }
                                    }
                                    if (success === true) {
                                        if (records.length > 0) {
                                            var status = null;
                                            records.forEach(function (brigade) {
                                                switch (brigade.get('status')) {
                                                    case 'FREE':
                                                        status = 'Свободна';
                                                        break;
                                                    case 'ON_EVENT':
                                                        status = 'Дежурство на мероприятии';
                                                        break;
                                                    case 'WITHOUT_SHIFT':
                                                        status = 'Вне графика';
                                                        break;
                                                    case 'CRASH_CAR':
                                                        status = 'Ремонт';
                                                        break;
                                                    case 'PASSED_BRIGADE':
                                                        status = 'Принял вызов';
                                                        break;
                                                    case 'AT_CALL':
                                                        status = 'На вызове';
                                                        break;
                                                    case 'RELAXON':
                                                        status = 'Обед';
                                                        break;
                                                    case 'GO_HOSPITAL':
                                                        status = 'Транспортировка в стационар';
                                                        break;
                                                    case 'HIJACKING':
                                                        status = 'Нападение на бригаду';
                                                        break;
                                                    default:
                                                        status = 'Неизвестно';
                                                        break;
                                                }
                                            });
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
                                                    },
                                                        {
                                                            xtype: 'displayfield',
                                                            name: 'station',
                                                            fieldLabel: 'Номер подстанции',
                                                            labelWidth: '100%',
                                                            margin: 0
                                                        },
                                                        {
                                                            xtype: 'displayfield',
                                                            value: marker.customOptions.profile,
                                                            fieldLabel: 'Профиль бригады',
                                                            labelWidth: '100%',
                                                            margin: 0
                                                        },
                                                        {
                                                            xtype: 'displayfield',
                                                            value: status,
                                                            fieldLabel: 'Статус бригады',
                                                            labelWidth: '100%',
                                                            margin: 0
                                                        },
                                                        {
                                                            xtype: 'displayfield',
                                                            fieldLabel: 'Старший бригады',
                                                            name: 'chefName',
                                                            labelWidth: '100%',
                                                            margin: 0
                                                        },
                                                        {
                                                            xtype: 'displayfield',
                                                            name: 'callCardNum',
                                                            fieldLabel: 'Вызов',
                                                            labelWidth: '100%',
                                                            margin: 0
                                                        },
                                                        {
                                                            xtype: 'displayfield',
                                                            name: 'address',
                                                            fieldLabel: 'Адрес места вызова',
                                                            labelWidth: 150,
                                                            margin: 0
                                                        },
                                                        {
                                                            xtype: 'displayfield',
                                                            name: 'passToBrigadeTime',
                                                            fieldLabel: 'Время получения бригадой',
                                                            renderer: Ext.util.Format.dateRenderer('Y-m-d, h:i:s'),
                                                            labelWidth: '100%',
                                                            margin: 0
                                                        }
                                                    ]
                                                }],
                                                listeners: {
                                                    afterrender: function (component) {
                                                        var form = component.down('form');
                                                        form.loadRecord(storeMarker.first());
                                                    }
                                                }
                                            }))
                                        }
                                    }
                                }
                            })
                        }
                    }
                }))
            }
        })
    },

    markerClick: function (object, coord, infoMarker) {
        var me = this;
        var win = Ext.WindowManager.getActive();
        if (win) {
            win.close();
        }
        function errorMessage(marker) {
            var markerMessage = null;
            if (marker === 'CALL') {
                markerMessage = 'Данные о вызове временно не доступны';
            }
            if (marker === 'BRIGADE') {
                markerMessage = 'Данные о бригаде временно не доступны';
            }
            Ext.create('Ext.window.MessageBox').show({
                title: 'Ошибка',
                message: markerMessage,
                icon: Ext.Msg.ERROR,
                buttons: Ext.Msg.OK
            })
        }

        var ymapWrapper = Ext.getCmp('mapId'),
            sizeCmp = ymapWrapper.getSize();

        sizeCmp.width = sizeCmp.width * 1.55;
        if (object.getProperties().features[0].getProperties().customOptions.objectType === 'BRIGADE') {
            if ((sizeCmp.width / 2) < coord[0]) {
                coord[0] -= 500;
                coord[1] += 20;
            }
            if ((sizeCmp.height / 2) < coord[1]) {
                coord[1] -= 270;
            }
            infoMarker.load({
                callback: function (records, operation, success) {
                    if (success === true) {
                        if (records.length === 0) {
                            errorMessage('BRIGADE');
                        }
                    }
                    if (success === false) {
                        try {
                            errorMessage('BRIGADE');
                        } catch (e) {
                            errorMessage('BRIGADE');
                        }
                    }
                    if (success === true) {
                        if (records.length > 0) {
                            var status = null;
                            records.forEach(function (brigade) {
                                switch (brigade.get('status')) {
                                    case 'FREE':
                                        status = 'Свободна';
                                        break;
                                    case 'ON_EVENT':
                                        status = 'Дежурство на мероприятии';
                                        break;
                                    case 'WITHOUT_SHIFT':
                                        status = 'Вне графика';
                                        break;
                                    case 'CRASH_CAR':
                                        status = 'Ремонт';
                                        break;
                                    case 'PASSED_BRIGADE':
                                        status = 'Принял вызов';
                                        break;
                                    case 'AT_CALL':
                                        status = 'На вызове';
                                        break;
                                    case 'RELAXON':
                                        status = 'Обед';
                                        break;
                                    case 'GO_HOSPITAL':
                                        status = 'Транспортировка в стационар';
                                        break;
                                    case 'HIJACKING':
                                        status = 'Нападение на бригаду';
                                        break;
                                    default:
                                        status = 'Неизвестно';
                                        break;
                                }
                            });
                            Ext.create('Ext.window.Window', {
                                title: 'Бригада',
                                layout: 'form',
                                border: 'fit',
                                autoScroll: true,
                                resizable: false,
                                width: 500,
                                //height: 250,
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
                                    },
                                        {
                                            xtype: 'displayfield',
                                            name: 'station',
                                            fieldLabel: 'Номер подстанции',
                                            labelWidth: '100%',
                                            margin: 0
                                        },
                                        {
                                            xtype: 'displayfield',
                                            value: object.getProperties().features[0].getProperties().customOptions.profile,
                                            fieldLabel: 'Профиль бригады',
                                            labelWidth: '100%',
                                            margin: 0
                                        },
                                        {
                                            xtype: 'displayfield',
                                            value: status,
                                            fieldLabel: 'Статус бригады',
                                            labelWidth: '100%',
                                            margin: 0
                                        },
                                        {
                                            xtype: 'displayfield',
                                            fieldLabel: 'Старший бригады',
                                            name: 'chefName',
                                            labelWidth: '100%',
                                            margin: 0
                                        },
                                        {
                                            xtype: 'displayfield',
                                            name: 'callCardNum',
                                            fieldLabel: 'Вызов',
                                            labelWidth: '100%',
                                            margin: 0
                                        },
                                        {
                                            xtype: 'displayfield',
                                            name: 'address',
                                            fieldLabel: 'Адрес места вызова',
                                            labelWidth: 150,
                                            margin: 0
                                        },
                                        {
                                            xtype: 'displayfield',
                                            name: 'passToBrigadeTime',
                                            fieldLabel: 'Время получения бригадой',
                                            renderer: Ext.util.Format.dateRenderer('Y-m-d, h:i:s'),
                                            labelWidth: '100%',
                                            margin: 0
                                        }
                                    ]
                                }],
                                listeners: {
                                    afterrender: function (component) {
                                        var form = component.down('form');
                                        form.loadRecord(infoMarker.first());
                                    }
                                }
                            }).showAt(coord);
                        }
                    }
                }
            })
        }
        if (object.getProperties().features[0].getProperties().customOptions.objectType === 'CALL') {
            if ((sizeCmp.width / 2) < coord[0]) {
                coord[0] -= 600;
                coord[1] += 20;
            }
            if ((sizeCmp.height / 2) < coord[1]) {
                coord[0] += 20;
                coord[1] -= 470;
            }
            infoMarker.load({
                callback: function (records, operation, success) {
                    if (success === true) {
                        if (records.length === 0) {
                            errorMessage('CALL');
                        }
                    }
                    if (success === false) {
                        try {
                            errorMessage('CALL');
                        } catch (e) {
                            errorMessage('CALL');
                        }
                    }
                    if (success === true) {
                        if (records.length > 0) {
                            Ext.create('Ext.window.Window', {
                                title: 'Вызов',
                                layout: 'form',
                                id: 'winId',
                                border: 'fit',
                                autoScroll: true,
                                resizable: false,
                                width: 550,
                                items: me.callInfoForm,
                                listeners: {
                                    afterrender: function (component) {
                                        var form = component.down('form');
                                        form.loadRecord(infoMarker.first());
                                    }
                                }
                            }).showAt(coord);
                        }
                    }
                }
            })
        }
    }
});
