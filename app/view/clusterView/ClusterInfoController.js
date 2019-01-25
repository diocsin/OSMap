Ext.define('Isidamaps.view.clusterView.ClusterInfoController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.clusterInfoController',

    clustersClick: function (cluster) {
        const me = this,
            win = Ext.WindowManager.getActive();
        if (win) {
            win.close();
        }

        const clusterInfo = Ext.widget('clusterInfo');
        clusterInfo.show();
        const buttonsHolder = clusterInfo.lookup('buttonsHolder'),
            infoHolder = clusterInfo.lookup('infoHolder');
        cluster.getProperties().features.forEach(function (marker) {
            const params = {
                objecttype: marker.getProperties().customOptions.objectType,
                objectid: marker.getProperties().id
            };
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

                buttonsHolder.add(Ext.create('Ext.Button', {
                    text: 'Выз.№ ' + marker.getProperties().customOptions.callCardNum + " " + f(),
                    maxWidth: 170,
                    minWidth: 170,
                    margin: 5,
                    listeners: {
                        click: function () {
                            const storeMarker = Isidamaps.app.getController('AppController').getStoreMarkerInfo(marker);
                            infoHolder.removeAll();
                            storeMarker.load({
                                params: params,
                                callback: function (records, operation, success) {
                                    if ((success === true && records.length === 0) || success === false) {
                                        me.errorMessage('Данные о вызове временно недоступны');
                                        return;
                                    }
                                    const callInfoForm = Ext.widget('callInfoForm'),
                                        callInfoViewModel = callInfoForm.getViewModel();
                                    callInfoViewModel.set('record', records[0]);
                                    infoHolder.add(callInfoForm);
                                }
                            })
                        }
                    }
                }))
            }
            if (marker.getProperties().customOptions.objectType === 'BRIGADE') {
                buttonsHolder.add(Ext.create('Ext.Button', {
                    text: 'Бр.№ ' + marker.getProperties().customOptions.brigadeNum + " " + "(" + marker.getProperties().customOptions.profile + ")" + " " + marker.getProperties().customOptions.station,
                    maxWidth: 170,
                    minWidth: 170,
                    margin: 5,
                    listeners: {
                        click: function () {
                            const storeMarker = Isidamaps.app.getController('AppController').getStoreMarkerInfo(marker);
                            infoHolder.removeAll();
                            storeMarker.load({
                                params: params,
                                callback: function (records, operation, success) {
                                    if ((success === true && records.length === 0) || success === false) {
                                        me.errorMessage('Данные о бригаде временно недоступны');
                                        return;
                                    }
                                    // FIXME formula?
                                    const record = records[0];
                                    record.set('status', Isidamaps.app.getController('AppController').brigadeStatusesMap.get(records[0].get('status') || 'Неизвестно'));
                                    const brigadeInfoForm = Ext.widget('brigadeInfoForm'),
                                        brigadeInfoViewModel = brigadeInfoForm.getViewModel();
                                    brigadeInfoViewModel.set('record', record);
                                    infoHolder.add(brigadeInfoForm);
                                }
                            })
                        }
                    }
                }))
            }
        })
    },
    errorMessage: function (msg) {
        Ext.Msg.show({
            title: 'Ошибка',
            message: msg,
            icon: Ext.Msg.ERROR,
            buttons: Ext.Msg.OK
        });
    },
});