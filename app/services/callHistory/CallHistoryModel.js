Ext.define('Isidamaps.services.callHistory.CallHistoryModel', {
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
