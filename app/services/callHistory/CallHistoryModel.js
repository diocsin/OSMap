Ext.define('Isidamaps.services.callHistory.CallHistoryModel', {
    alias: 'viewmodel.callhistory',
    stores: {
        Route: {
            proxy: {
                type: 'memory'
            }
        }
    }
});
