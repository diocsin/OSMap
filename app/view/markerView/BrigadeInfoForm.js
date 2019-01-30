Ext.define('Isidamaps.view.markerView.BrigadeInfoForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.brigadeInfoForm',
    autoScroll: true,
    viewModel: true,
    bodyStyle: 'padding: 0 5px 0',
    border: false,
    defaults: {
        margin: 0,
        labelWidth: '100%'
    },
    items: [{
        xtype: 'displayfield',
        bind: '{record.brigadeNum}',
        fieldLabel: 'Номер бригады'
    }, {
        xtype: 'displayfield',
        bind:  '{record.station}',
        fieldLabel: 'Номер подстанции'
    }, {
        xtype: 'displayfield',
        bind: '{record.profile}',
        fieldLabel: 'Профиль бригады'
    }, {
        xtype: 'displayfield',
        bind: '{record.status}',
        fieldLabel: 'Статус бригады'
    }, {
        xtype: 'displayfield',
        fieldLabel: 'Старший бригады',
        bind: '{record.chefName}'
    }, {
        xtype: 'displayfield',
        bind: '{record.callCardNum}',
        fieldLabel: 'Вызов'
    }, {
        xtype: 'displayfield',
        bind: '{record.address}',
        fieldLabel: 'Адрес места вызова',
        labelWidth: 150
    }, {
        xtype: 'displayfield',
        bind: '{record.passToBrigadeTime}',
        name: 'passToBrigadeTime',
        fieldLabel: 'Время получения бригадой',
        renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s')
    }]
});