/*
 * This file is generated and updated by Sencha Cmd. You can edit this file as
 * needed for your application, but these edits will have to be merged by
 * Sencha Cmd when upgrading.
 */
Ext.ariaWarn = Ext.emptyFn;
ASOV = (function () {
    var opener = window.opener;
    return !!opener ? opener.ACPS.MapControl.forExport() : {
        setRoutes: Ext.emptyFn,
        setBrigade: Ext.emptyFn,
        setMapManager: Ext.emptyFn
    }
})();

function readPropertyFile() {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", 'resources/settings/property.json', true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status === 200) {
            startApp();
        }
    };
    rawFile.send(null);
}

readPropertyFile();

function startApp() {
    Ext.application({
        name: 'Isidamaps',
        extend: 'Isidamaps.Application',
        requires: [
            'Ext.layout.container.Border',
            'Ext.layout.container.Table',
            'Ext.form.CheckboxGroup',
            'Ext.container.Viewport',
            'Isidamaps.Viewport',
            'Ext.container.Container'

        ],
        // The name of the initial view to create. With the classic toolkit this class
        // will gain a "viewport" plugin if it does not extend Ext.Viewport. With the
        // modern toolkit, the main view will be added to the Viewport.
        //
        mainView: 'Isidamaps.Viewport'

        //-------------------------------------------------------------------------
        // Most customizations should be made to Isidamaps.Application. If you need to
        // customize this file, doing so below this section reduces the likelihood
        // of merge conflicts when upgrading to new versions of Sencha Cmd.
        //-------------------------------------------------------------------------
    });
}
