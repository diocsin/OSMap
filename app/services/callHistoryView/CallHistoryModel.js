Ext.define('Isidamaps.services.callHistoryView.CallHistoryModel', {
    extend: 'Isidamaps.services.monitoringView.MonitoringModel',
    alias: 'viewmodel.callhistory',
    stores: {
        Route: {
            proxy: {
                type: 'memory'
            }
        }
    }
});
