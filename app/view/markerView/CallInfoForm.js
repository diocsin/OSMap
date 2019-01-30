Ext.define('Isidamaps.view.markerView.CallInfoForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.callInfoForm',
    bodyStyle: 'padding: 0 5px 0',
    border: false,
    viewModel: true,
    items: [{
        xtype: 'displayfield',
        bind: '{record.callCardNum}',
        fieldLabel: 'Номер вызова',
        labelWidth: '100%',
        margin: 0
    }, {
        xtype: 'displayfield',
        bind: '{record.createTime}',
        fieldLabel: 'Время создания вызова',
        labelWidth: '100%',
        renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
        margin: 0
    }, {
        xtype: 'displayfield',
        bind: '{record.regBeginTime}',
        fieldLabel: 'Время приема вызова',
        labelWidth: '100%',
        renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
        margin: 0
    }, {
        xtype: 'textareafield',
        bind: '{recod.reason}',
        labelWidth: 100,
        width: 500,
        readOnly: true,
        fieldLabel: 'Повод к вызову',
        margin: '0px 0px 5px 0px'
    }, {
        xtype: 'textareafield',
        bind: '{record.reasonComment}',
        labelWidth: 100,
        width: 500,
        readOnly: true,
        fieldLabel: 'Комментарий',
        margin: '5px 0px 0px 0px'
    }, {
        xtype: 'displayfield',
        bind: '{record.address}',
        labelWidth: '100%',
        fieldLabel: 'Адрес места вызова',
        margin: 0
    }, {
        xtype: 'displayfield',
        bind: '{record.enter}',
        labelWidth: '100%',
        fieldLabel: 'Особенности входа',
        margin: 0
    }, {
        xtype: 'displayfield',
        bind: '{record.phone}',
        labelWidth: '100%',
        fieldLabel: 'Телефон',
        margin: 0
    }, {
        xtype: 'displayfield',
        bind: '{record.fullName}',
        labelWidth: '100%',
        fieldLabel: 'ФИО',
        margin: 0
    }, {
        xtype: 'displayfield',
        bind: '{record.brigadeNum}',
        labelWidth: '100%',
        fieldLabel: 'Номер бригады',
        margin: 0
    }, {
        xtype: 'displayfield',
        bind: '{record.brigadeAssignTime}',
        labelWidth: '100%',
        fieldLabel: 'Время назначения бригады на вызов',
        renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
        margin: 0
    }, {
        xtype: 'displayfield',
        bind: '{record.brigadeArrivalTime}',
        labelWidth: '100%',
        fieldLabel: 'Время прибытия бригады к месту вызова',
        renderer: Ext.util.Format.dateRenderer('Y-m-d, H:i:s'),
        margin: 0
    }, {
        xtype: 'displayfield',
        bind: '{record.hospital}',
        labelWidth: '100%',
        fieldLabel: 'Стационар',
        margin: 0
    }]
});