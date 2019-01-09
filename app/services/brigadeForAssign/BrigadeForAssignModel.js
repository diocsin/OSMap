Ext.define('Isidamaps.services.brigadeForAssign.BrigadeForAssignModel', {
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
