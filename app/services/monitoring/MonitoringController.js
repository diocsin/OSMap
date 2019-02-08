Ext.define('Isidamaps.services.monitoring.MonitoringController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.monitoring',
    Monitoring: null,
    filterBrigadeArray: [],
    allStatusBrigade: [],
    allProfileBrigade: [],
    allStatusCall: [],
    allStation: [],
    stateStatusBrigades: null,
    stateStation: null,
    stateProfileBrigades: null,
    stateStatusCalls: null,
    myMask: null,
    urlOpenStreetServerTiles: null,
    urlOpenStreetServerRoute: null,
    listen: {
        global: {
            checkedProfileBrigade: 'checkedProfileBrigade',
            checkedStatusBrigade: 'checkedStatusBrigade',
            checkedCallStatus: 'checkedCallStatus',
            checkedStationBrigade: 'checkedStationBrigade',
            setStateStatusBrigades: 'setStateStatusBrigades',
            setStateStation: 'setStateStation',
            setStateProfileBrigades: 'setStateProfileBrigades',
            setStateStatusCalls: 'setStateStatusCalls',
            getButtonBrigadeForChangeButton: 'getButtonBrigadeForChangeButton',
            buttonSearch: 'buttonSearch',
            selectAll: 'selectAll',
            deselectAll: 'deselectAll'
        }
    },

    selectAll: function (checkbox) {
        const me = this;
        switch (checkbox.reference) {
            case 'allStation':
                me.filterBrigadeArray = Ext.Array.difference(me.filterBrigadeArray, Isidamaps.app.getController('AppController').stationArray);
                break;
            case 'allStatus':
                me.filterBrigadeArray = Ext.Array.difference(me.filterBrigadeArray, me.allStatusBrigade);
                break;
            case  'allProfile':
                me.filterBrigadeArray = Ext.Array.difference(me.filterBrigadeArray, me.allProfileBrigade);
                break;
            case 'allCalls':
                me.filterBrigadeArray = Ext.Array.difference(me.filterBrigadeArray, me.allStatusCall);
                break;
        }
        me.setFilterObjectManager();
    },

    deselectAll: function (checkbox) {
        const me = this;
        switch (checkbox.reference) {
            case 'allStation':
                me.filterBrigadeArray = Ext.Array.merge(me.filterBrigadeArray, Isidamaps.app.getController('AppController').stationArray);
                break;
            case 'allStatus':
                me.filterBrigadeArray = Ext.Array.merge(me.filterBrigadeArray, me.allStatusBrigade);
                break;
            case  'allProfile':
                me.filterBrigadeArray = Ext.Array.merge(me.filterBrigadeArray, me.allProfileBrigade);
                break;
            case 'allCalls':
                me.filterBrigadeArray = Ext.Array.merge(me.filterBrigadeArray, me.allStatusCall);
                break;
        }
        me.setFilterObjectManager();
    },

    setStateStatusBrigades: function (state) {
        const me = this;
        me.stateStatusBrigades = state;
    },

    setStateStation: function (state) {
        const me = this;
        me.stateStation = state;
    },

    setStateProfileBrigades: function (state) {
        const me = this;
        me.stateProfileBrigades = state;
    },

    setStateStatusCalls: function (state) {
        const me = this;
        me.stateStatusCalls = state;
    },

    getFilterBrigadeArray: function () {
        return this.filterBrigadeArray;
    },

    setFilterObjectManager: function () {
        const me = this,
            arrayForShowButton = [],
            arrayForHideButton = [];
        let commonArray;
        commonArray = Ext.Array.merge(me.Monitoring.brigadesMarkers, me.Monitoring.callMarkers);
        Ext.Array.each(commonArray, function (object) {
            if (me.Monitoring.getCustomOptions(object).objectType === 'BRIGADE' &&
                !Ext.Array.contains(me.filterBrigadeArray, me.Monitoring.getCustomOptions(object).station) &&
                !Ext.Array.contains(me.filterBrigadeArray, me.Monitoring.getCustomOptions(object).status) &&
                !Ext.Array.contains(me.filterBrigadeArray, me.Monitoring.getCustomOptions(object).profile)) {

                try {
                    me.Monitoring.vectorLayer.getSource().getSource().addFeature(object);
                    arrayForShowButton.push(object);
                }
                catch (e) {
                }


                return;
            }
            if (me.Monitoring.getCustomOptions(object).objectType === 'CALL' &&
                !Ext.Array.contains(me.filterBrigadeArray, me.Monitoring.getCustomOptions(object).station) &&
                !Ext.Array.contains(me.filterBrigadeArray, me.Monitoring.getCustomOptions(object).status)) {
                try {
                    me.Monitoring.vectorLayer.getSource().getSource().addFeature(object);
                }
                catch (e) {
                }

                return;
            }
            if (me.Monitoring.getCustomOptions(object).objectType === 'BRIGADE') {

                try {
                    me.Monitoring.vectorLayer.getSource().getSource().removeFeature(object);
                    arrayForHideButton.push(object);
                }
                catch (e) {

                }
                return;
            }
            if (me.Monitoring.getCustomOptions(object).objectType === 'CALL') {
                try {
                    me.Monitoring.vectorLayer.getSource().getSource().removeFeature(object);
                }
                catch (e) {

                }
            }

        });
        me.showButtonInPanel(arrayForShowButton);
        me.hideButtonInPanel(arrayForHideButton);
    },


    buttonSearch: function () {
        const me = this,
            searchText = Ext.getCmp('searchTextField').getValue();
        let searchTrue = null;
        Ext.Array.each(me.Monitoring.vectorLayer.getSource().getFeatures(), function (features) {
            Ext.Array.each(features.getProperties().features, function (feature) {
                if (feature.getProperties().customOptions.brigadeNum === searchText) {
                    me.Monitoring.map.getView().setCenter(features.getProperties().geometry.flatCoordinates);
                    me.Monitoring.map.getView().setZoom(18);
                    searchTrue = feature;
                    me.animationFeaturesWhenFind(features);
                    const t = setInterval(function run() {
                        me.animationFeaturesWhenFind(features);
                    }, 2000);

                    setTimeout(function () {
                        clearInterval(t);
                    }, 9000);
                    return false;
                }
            });
            if (searchTrue) {
                return false;
            }
        });
        if (!searchTrue) {
            Ext.getCmp('searchTextField').setActiveError('Не найдена бригада с данным номером');
        }
    },

    checkedCallStatus: function (checkbox) {
        const me = this,
            checkboxValue = checkbox.inputValue,
            checkboxChecked = checkbox.checked,
            callStatusFilterComp = me.lookupReference('callStatusFilter');
        if (checkboxChecked) {
            let j = 0;
            Ext.Array.remove(me.filterBrigadeArray, checkboxValue);
            me.setFilterObjectManager();
            callStatusFilterComp.items.each(function (checkbox) {
                if (checkbox.checked) {
                    j++
                }
            });
            if (callStatusFilterComp.items.length === j) {
                me.lookupReference('allCalls').setRawValue(true)
            }
            callStatusFilterComp.fireEvent('customerchange');
            return;
        }
        me.filterBrigadeArray.push(checkboxValue);
        let i = 0;
        callStatusFilterComp.items.each(function (checkbox) {
            if (checkbox.checked) {
                i++
            }
        });
        if (callStatusFilterComp.items.length === i + 1) {
            me.lookupReference('allCalls').setRawValue(false)
        }
        me.setFilterObjectManager();
        callStatusFilterComp.fireEvent('customerchange');
    },

    checkedStationBrigade: function (checkbox) {
        const me = this,
            checkboxValue = checkbox.inputValue,
            checkboxChecked = checkbox.checked,
            stationFilterComp = me.lookupReference('stationFilter');
        if (!checkboxChecked) {
            me.filterBrigadeArray.push(checkboxValue);

            let i = 0;
            stationFilterComp.items.each(function (checkbox) {
                if (checkbox.checked) {
                    i++
                }
            });
            if (stationFilterComp.items.length === i + 1) {
                me.lookupReference('allStation').setRawValue(false)
            }
            me.setFilterObjectManager();
            stationFilterComp.fireEvent('customerchange');
        }
        if (checkboxChecked) {
            let j = 0;
            Ext.Array.remove(me.filterBrigadeArray, checkboxValue);
            me.setFilterObjectManager();
            stationFilterComp.items.each(function (checkbox) {
                if (checkbox.checked) {
                    j++
                }
            });
            if (stationFilterComp.items.length === j) {
                me.lookupReference('allStation').setRawValue(true)
            }
            stationFilterComp.fireEvent('customerchange');
        }


    },

    checkedProfileBrigade: function (checkbox) {
        const me = this,
            checkboxValue = checkbox.inputValue,
            checkboxChecked = checkbox.checked,
            profileBrigadeFilterComp = me.lookupReference('profileBrigadeFilter');
        if (!checkboxChecked) {
            me.filterBrigadeArray.push(checkboxValue);
            let i = 0;
            profileBrigadeFilterComp.items.each(function (checkbox) {
                if (checkbox.checked) {
                    i++
                }
            });
            if (profileBrigadeFilterComp.items.length === i + 1) {
                me.lookupReference('allProfile').setRawValue(false)
            }
            me.setFilterObjectManager();
            profileBrigadeFilterComp.fireEvent('customerchange');
        }
        if (checkboxChecked) {
            let j = 0;
            Ext.Array.remove(me.filterBrigadeArray, checkboxValue);
            me.setFilterObjectManager();
            profileBrigadeFilterComp.items.each(function (checkbox) {
                if (checkbox.checked) {
                    j++
                }
            });
            if (profileBrigadeFilterComp.items.length === j) {
                me.lookupReference('allProfile').setRawValue(true)
            }
            profileBrigadeFilterComp.fireEvent('customerchange');
        }


    },

    checkedStatusBrigade: function (checkbox) {
        const me = this,
            checkboxValue = checkbox.inputValue,
            checkboxChecked = checkbox.checked,
            statusBrigadeFilterComp = me.lookupReference('statusBrigadeFilter');
        if (!checkboxChecked) {
            me.filterBrigadeArray.push(checkboxValue);
            let i = 0;
            statusBrigadeFilterComp.items.each(function (checkbox) {
                if (checkbox.checked) {
                    i++
                }
            });
            if (statusBrigadeFilterComp.items.length === i + 1) {
                me.lookupReference('allStatus').setRawValue(false)
            }
            me.setFilterObjectManager();
            statusBrigadeFilterComp.fireEvent('customerchange');
        }
        if (checkboxChecked) {
            let j = 0;
            Ext.Array.remove(me.filterBrigadeArray, checkboxValue);
            me.setFilterObjectManager();
            statusBrigadeFilterComp.items.each(function (checkbox) {
                if (checkbox.checked) {
                    j++
                }
            });
            if (statusBrigadeFilterComp.items.length === j) {
                me.lookupReference('allStatus').setRawValue(true)
            }
            statusBrigadeFilterComp.fireEvent('customerchange');
        }


    },

    mainBoxReady: function () {
        const me = this;
        Ext.defer(me.createMap, 100, me);
    },

    createMap: function () {
        const me = this;
        me.myMask = new Ext.LoadMask({
            msg: 'Подождите пожалуйста. Загрузка...',
            target: Ext.getCmp('monitoringPanel')
        });
        me.myMask.show();
        Isidamaps.app.getController('AppController').initial(f);

        function f() {
            me.urlOpenStreetServerTiles = Isidamaps.app.getController('AppController').urlOpenStreetServerTiles;
            me.Monitoring = Ext.create('Isidamaps.services.monitoring.MapService', {
                getFilterBrigadeArray: me.getFilterBrigadeArray.bind(me),
                urlOpenStreetServerTiles: me.urlOpenStreetServerTiles,
                addButtonsBrigadeOnPanel: me.addButtonsBrigadeOnPanel.bind(me),
                addStationFilter: me.addStationFilter.bind(me),
                getButtonBrigadeForChangeButton: me.getButtonBrigadeForChangeButton,
                setCheckbox: me.setCheckbox.bind(me),
                addNewButtonOnPanel: me.addNewButtonOnPanel.bind(me),
                destroyButtonOnPanel: me.destroyButtonOnPanel.bind(me),
            });
            me.Monitoring.listenerStore();
            me.Monitoring.optionsObjectManager();
            ASOV.setMapManager({
                setStation: me.Monitoring.setStation.bind(me)
            }, Ext.History.currentToken);
            me.Monitoring.setStation(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
            const ymapWrapper = me.lookupReference('ymapWrapper');
            ymapWrapper.on('resize', function () {
                me.Monitoring.resizeMap(me.Monitoring);
            });
        }
    },

    setCheckbox: function () {
        const me = this;
        try {
            me.lookupReference('stationFilter').setValue(me.stateStation.checked);

            me.lookupReference('profileBrigadeFilter').setValue(me.stateProfileBrigades.checked);

            me.lookupReference('statusBrigadeFilter').setValue(me.stateStatusBrigades.checked);

            me.lookupReference('callStatusFilter').setValue(me.stateStatusCalls.checked);


        }
        catch (e) {
            console.dir(e);
        }
        me.myMask.hide();
    }
    ,


    addStationFilter: function () {
        const me = this,
            checkboxStation = me.lookupReference('stationFilter'),
            buttonBrigade = me.lookupReference('BrigadePanel'),
            records = Isidamaps.app.getController('AppController').stationArray;

        Ext.Array.each(records, function (rec) {
            checkboxStation.add(Ext.create('Ext.form.field.Checkbox', {
                boxLabel: rec,
                inputValue: rec,
                checked: false,
                listeners: {
                    change: {
                        fn: function (checkbox, checked) {
                            Ext.fireEvent('checkedStationBrigade', checkbox, checked);
                        }
                    }
                }
            }));
            buttonBrigade.add(Ext.create('Ext.panel.Panel', {
                itemId: 'panel_' + rec,
                title: rec,
                width: 260,
                renderTo: Ext.getBody(),
                floatable: true,
                collapsible: true,
                scrollable: 'vertical',
                collapseToolText: 'Скрыть панель',
                expandToolText: 'Открыть панель',
                header: {
                    titlePosition: 1
                }
            }));
        });
        me.setFilterBrigadeAndCall();

    }
    ,
    setFilterBrigadeAndCall: function () {
        const me = this;
        me.lookupReference('profileBrigadeFilter').eachBox(function (item) {
            me.allProfileBrigade.push(item.inputValue);
        });
        me.lookupReference('statusBrigadeFilter').eachBox(function (item) {
            me.allStatusBrigade.push(item.inputValue);
        });
        me.lookupReference('callStatusFilter').eachBox(function (item) {
            me.allStatusCall.push(item.inputValue);
        });

        me.lookupReference('stationFilter').eachBox(function (item) {
            me.allStation.push(item.inputValue);
        });
        me.filterBrigadeArray = Ext.Array.merge(me.allProfileBrigade, me.allStatusBrigade, me.allStatusCall, me.allStation);
    }
    ,

    getButtonBrigadeForChangeButton: function (brigade, oldStatus) {
        const me = this,
            brigadePanel = me.buttonBrigade.getComponent('panel_' + me.Monitoring.getCustomOptions(brigade).station),
            brigadeHave = brigadePanel.getComponent('id' + brigade.getProperties().id);
        brigadeHave.removeCls('button_' + oldStatus);
        brigadeHave.addCls('button_' + me.Monitoring.getCustomOptions(brigade).status);
        if (Ext.Array.contains(me.filterBrigadeArray, me.Monitoring.getCustomOptions(brigade).status) && !brigadeHave.isHidden()) {
            brigadeHave.hide();
        }
        if (!Ext.Array.contains(me.filterBrigadeArray, me.Monitoring.getCustomOptions(brigade).station) &&
            !Ext.Array.contains(me.filterBrigadeArray, me.Monitoring.getCustomOptions(brigade).status) &&
            !Ext.Array.contains(me.filterBrigadeArray, me.Monitoring.getCustomOptions(brigade).profile) &&
            brigadeHave.isHidden()) {
            brigadeHave.show();
        }
        brigadePanel.updateLayout();
    }
    ,

    hideButtonInPanel: function (brigades) {
        const me = this;
        Ext.suspendLayouts();
        Ext.Array.each(brigades, function (brigade) {
            let brigadePanel = me.buttonBrigade.getComponent('panel_' + me.Monitoring.getCustomOptions(brigade).station);
            brigadePanel.getComponent('id' + brigade.getProperties().id).hide();
        });
        Ext.resumeLayouts(true);
    }
    ,

    showButtonInPanel: function (brigades) {
        const me = this;
        Ext.suspendLayouts();
        Ext.Array.each(brigades, function (brigade) {
            let brigadePanel = me.buttonBrigade.getComponent('panel_' + me.Monitoring.getCustomOptions(brigade).station);
            brigadePanel.getComponent('id' + brigade.getProperties().id).show();
        });
        Ext.resumeLayouts(true);
    }
    ,

    destroyButtonOnPanel: function (brigade) {
        const me = this;
        try {
            const brigadePanel = me.buttonBrigade.getComponent('panel_' + me.Monitoring.getCustomOptions(brigade).station);
            brigadePanel.getComponent('id' + brigade.getProperties().id).destroy();
        }
        catch (e) {
        }
    }
    ,

    addNewButtonOnPanel: function (brigade) {
        const me = this,
            brigadePanel = me.buttonBrigade.getComponent('panel_' + me.Monitoring.getCustomOptions(brigade).station),
            button = me.createButton(brigade);
        brigadePanel.add(button);
        me.setFilterObjectManager();
    }
    ,
    addButtonsBrigadeOnPanel: function () {
        const me = this,
            brigadeSort = [];
        me.buttonBrigade = me.lookupReference('BrigadePanel');
        Ext.Array.each(me.Monitoring.brigadesMarkers, function (brigade) {
            brigadeSort.push(brigade);
        });
        brigadeSort.sort(function (a, b) {
            return a.getProperties().customOptions.brigadeNum - b.getProperties().customOptions.brigadeNum
        });
        Ext.Array.each(brigadeSort, function (brigade) {
            const button = me.createButton(brigade),
                stationPanelBrigades = me.buttonBrigade.getComponent('panel_' + me.Monitoring.getCustomOptions(brigade).station);
            stationPanelBrigades.add(button);
        });
    },

    createButton: function (brigade) {
        const me = this;
        return Ext.create('Ext.Button', {
            itemId: 'id' + brigade.getProperties().id,
            text: me.Monitoring.getCustomOptions(brigade).brigadeNum + " " + "(" + me.Monitoring.getCustomOptions(brigade).profile + ")",
            maxWidth: 110,
            minWidth: 110,
            margin: 5,
            hidden: true,
            hideMode: 'offsets',
            cls: 'button_' + me.Monitoring.getCustomOptions(brigade).status,
            listeners: {
                click: function () {
                    me.clickButton(brigade);
                }
            }
        });
    },

    clickButton: function (brigade) {
        const me = this;
        me.Monitoring.vectorSource.forEachFeature(function (features) {
            const idE = brigade.getProperties().id,
                idF = features.getProperties().id;
            if (idF === idE) {
                //Ext.widget('brigadeInfo').getController().markerClick(features);
                me.Monitoring.map.getView().setCenter(features.getProperties().geometry.flatCoordinates);
                me.Monitoring.map.getView().setZoom(18);
                me.animationFeaturesWhenFind(features);
                const t = setInterval(function run() {
                    me.animationFeaturesWhenFind(features);
                }, 2000);

                setTimeout(function () {
                    clearInterval(t);
                }, 6000);
            }
        });
    }
    ,

    animationFeaturesWhenFind: function (features) {
        const me = this,
            listenerKey = me.Monitoring.map.on('postcompose', animate),
            start = new Date().getTime(),
            duration = 3000;
        me.Monitoring.map.render();

        function animate(evt) {
            const vectorContext = evt.vectorContext,
                frameState = evt.frameState,
                flashGeom = features.getGeometry().clone(),
                elapsed = frameState.time - start,
                elapsedRatio = elapsed / duration;
            // radius will be 5 at start and 30 at end.
            let radius = ol.easing.easeOut(elapsedRatio) * 25 + 5,
                opacity = ol.easing.easeOut(1 - elapsedRatio),
                style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: radius,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(255, 0, 0, ' + opacity + ')',
                            width: 0.25 + opacity
                        })
                    })
                });
            vectorContext.setStyle(style);
            vectorContext.drawGeometry(flashGeom);
            if (elapsed > duration) {
                new ol.Observable.unByKey(listenerKey);
                return;
            }
            // tell OpenLayers to continue postcompose animation
            me.Monitoring.map.render();
        }
    },

    layoutReady: function () {
        const me = this;
        me.fireTabEvent(me.lookup('navigationPanel'));
        me.fireTabEvent(me.lookup('BrigadePanel'));
    },

    tabChange: function (panel, newTab, oldTab) {
        oldTab.fireEvent('tabExit');
        this.fireTabEvent(newTab);
    },

    fireTabEvent: function (tab) {
        tab.fireEvent('tabEnter');
    }

});
