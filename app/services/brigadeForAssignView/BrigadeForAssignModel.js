Ext.define('Isidamaps.services.brigadeForAssignView.BrigadeForAssignModel', {
    extend: 'Isidamaps.services.monitoringView.MonitoringModel',
    alias: 'viewmodel.brigadeforassign',
    stores: {
        Routes: {
            proxy: {
                type: 'memory'
            }
        }
    }
});
