Ext.define('Isidamaps.services.monitoringBrigadeOnCallView.MonitoringBrigadeController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.monitoringBrigade',
    MonitoringBrigade: null,
    filterBrigadeArray: [],
    filterCallArray: [],
    stompClient: null,
    urlGeodata: null,
    urlWebSocket: null,
    urlOpenStreetServerRoute: null,
    urlOpenStreetServerTiles: null,
    listen: {
        global: {
            windowClose: 'windowClose'
        }
    },

    mainBoxReady: function () {
        const me = this;
        Ext.defer(me.createMap, 100, me);
    },

    windowClose: function () {
        window.close();
    },



    sendName: function () {
        //stompClient.send("/app/hello", {}, JSON.stringify({ 'name': name }));
    },


    createMap: function () {
        var me = this;
        me.MonitoringBrigade = Ext.create('Isidamaps.services.monitoringBrigadeOnCallView.MapService', {
            filterBrigadeArray: me.filterBrigadeArray,
            filterCallArray: me.filterCallArray,
            urlOpenStreetServerTiles: me.urlOpenStreetServerTiles,
            urlOpenStreetServerRoute: me.urlOpenStreetServerRoute,
        });
        me.MonitoringBrigade.optionsObjectManager();
        ASOV.setMapManager({
            setMarkers: me.MonitoringBrigade.setMarkers.bind(this)
        }, Ext.History.currentToken);
        var ymapWrapper = me.lookupReference('ymapWrapper');
        ymapWrapper.on('resize', function () {
            me.MonitoringBrigade.resizeMap(me.MonitoringBrigade);
        });

    },


    getStoreMarkerInfo: function (object) {
        var me = this,
            urlInfoMarker = Ext.String.format(me.urlGeodata + '/info?objectid={0}&objecttype={1}', object.getProperties().id, object.getProperties().customOptions.objectType);
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
        this.fireTabEvent(this.lookupReference('RouteBrigadePanel'));
    },

    tabChange: function (panel, newTab, oldTab) {
        oldTab.fireEvent('tabExit');
        this.fireTabEvent(newTab);
    },

    fireTabEvent: function (tab) {
        tab.fireEvent('tabEnter');
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
                                        status = 'Проблемы';
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
                                            value: object.getProperties().customOptions.profile,
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
                                            renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
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
