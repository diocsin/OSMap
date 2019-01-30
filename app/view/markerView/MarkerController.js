Ext.define('Isidamaps.view.markerView.MarkerController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.MarkerController',

    markerClick: function (object) {
        const me = this,
            win = Ext.WindowManager.getActive();
        if (win) {
            win.close();
        }
        const storeMarker = Isidamaps.app.getController('AppController').getStoreMarkerInfo(object),
            params = {
                objecttype: object.getProperties().customOptions.objectType,
                objectid: object.getProperties().id
            };


        const options = {
            params: params,
            store: storeMarker
        };
        if (object.getProperties().customOptions.objectType === 'BRIGADE') {
            me.brigadeMarkerClick(options, object);
            return;
        }

        me.callMarkerClick(options);
    }
    ,

    brigadeMarkerClick: function (options, object) {
        const me = this;
        options.store.load({
            params: options.params,
            callback: function (records, operation, success) {
                if ((success === true && records.length === 0) || success === false) {
                    me.errorMessage('Данные о бригаде временно не доступны');
                    return;
                }
                // FIXME define formula in VM
                const status = Isidamaps.app.getController('AppController').brigadeStatusesMap.get(records[0].get('status')) || 'Неизвестно',
                    record = records[0];
                console.dir(record);
                record.set({
                    'status': status,
                    'profile': object.getProperties().customOptions.profile
                });


                const brigadeInfoWidget = Ext.widget('brigadeInfo'),
                    brigadeInfoViewModel = brigadeInfoWidget.getViewModel();
                brigadeInfoViewModel.set('record', record);
                brigadeInfoWidget.show()/*At(coord)*/;
            }
        });
    }
    ,

    callMarkerClick: function (options) {
        const me = this;
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