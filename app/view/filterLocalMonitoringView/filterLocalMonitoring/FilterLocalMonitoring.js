Ext.define('Isidamaps.view.filterLocalMonitoringView.filterLocalMonitoring.FilterLocalMonitoring', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.filterLocalMonitoringView-filterLocalMonitoring',
    border: false,
    items: [{
        xtype: 'form',
        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 70
        },
        border: false,
        items: [{
            xtype: 'checkbox',
            boxLabel: 'Все',
            reference: 'allStation',
            checked: false,
            inputValue: 'ALL',
            margin: '5px 10px 0px 10px',
            listeners: {
                change: function (checkbox, checked) {
                    const stationGroup = Ext.getCmp('stationGroupId');
                    if (checked === true) {
                        stationGroup.items.each(function (item) {
                            item.setRawValue(true);
                        });
                        stationGroup.fireEvent('customerchange');
                        Ext.fireEvent('selectAll', checkbox);
                        return;
                    }
                    Ext.getCmp('stationGroupId').items.each(function (item) {
                        item.setRawValue(false);
                    });
                    stationGroup.fireEvent('customerchange');
                    Ext.fireEvent('deselectAll', checkbox);

                }
            }
        }, {
            xtype: 'checkboxgroup',
            id: 'stationGroupId',
            reference: 'stationFilter',
            columns: 4,
            getState: function () {
                return {"checked": this.getValue()};
            },
            applyState: function (state) {
                Ext.fireEvent('setStateStation', state);
            },
            stateEvents: [
                'customerchange'
            ],
            stateId: 'checkBoxStation',
            stateful: true,
            vertical: true,
            margin: '0px 5px 5px 5px'
        }]
    }, {
        xtype: 'panel',
        title: 'Состояние',
        items: [{
            xtype: 'checkbox',
            boxLabel: 'Все',
            reference: 'allStatus',
            checked: false,
            inputValue: 'ALL',
            margin: '5px 10px 0px 10px',
            listeners: {
                change: function (checkbox, checked) {
                    const statusGroup = Ext.getCmp('statusGroupId');
                    if (checked === true) {
                        statusGroup.items.each(function (item) {
                            item.setRawValue(true);
                        });
                        statusGroup.fireEvent('customerchange');
                        Ext.fireEvent('selectAll', checkbox);
                        return;
                    }
                    statusGroup.items.each(function (item) {
                        item.setRawValue(false);
                    });
                    statusGroup.fireEvent('customerchange');
                    Ext.fireEvent('deselectAll', checkbox);
                }
            }
        }, {
            xtype: 'checkboxgroup',
            id: 'statusGroupId',
            reference: 'statusBrigadeFilter',
            columns: 1,
            getState: function () {
                return {"checked": this.getValue()};
            },
            applyState: function (state) {
                Ext.fireEvent('setStateStatusBrigades', state);
            },
            stateEvents: [
                'customerchange'
            ],
            stateId: 'checkBoxStatusBrigades',
            stateful: true,
            vertical: true,
            margin: '0px 5px 5px 5px',

            items: [{
                boxLabel: 'Свободна',
                checked: false,
                inputValue: 'FREE',
                listeners: {
                    change: {
                        fn: function (checkbox, checked) {
                            Ext.fireEvent('checkedStatusBrigade', checkbox, checked);
                        }
                    }
                }
            },
                {
                    boxLabel: 'Принял вызов',
                    checked: false,
                    inputValue: 'PASSED_BRIGADE',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedStatusBrigade', checkbox, checked);
                            }
                        }
                    }
                },
                {
                    boxLabel: 'На вызове',
                    checked: false,
                    inputValue: 'AT_CALL',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedStatusBrigade', checkbox, checked);
                            }
                        }
                    }
                },
                {
                    boxLabel: 'Транспортировка в стационар',
                    checked: false,
                    inputValue: 'GO_HOSPITAL',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedStatusBrigade', checkbox, checked);
                            }
                        }
                    }
                },
                {
                    boxLabel: 'Дежурство на мероприятии',
                    checked: false,
                    inputValue: 'ON_EVENT',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedStatusBrigade', checkbox, checked);
                            }
                        }
                    }
                },
                {
                    boxLabel: 'Вне графика',
                    checked: false,
                    inputValue: 'WITHOUT_SHIFT',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedStatusBrigade', checkbox, checked);
                            }
                        }
                    }
                },
                {
                    boxLabel: 'Ремонт',
                    checked: false,
                    inputValue: 'CRASH_CAR',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedStatusBrigade', checkbox, checked);
                            }
                        }
                    }
                },
                {
                    boxLabel: 'Обед',
                    checked: false,
                    inputValue: 'RELAXON',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedStatusBrigade', checkbox, checked);
                            }
                        }
                    }
                },
                {
                    boxLabel: 'Проблемы',
                    checked: false,
                    inputValue: 'HIJACKING',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedStatusBrigade', checkbox, checked);
                            }
                        }
                    }
                }
            ]
        }]
    },
        {
            xtype: 'panel',
            title: 'Профиль',
            items: [{
                xtype: 'checkbox',
                boxLabel: 'Все',
                reference: 'allProfile',
                checked: false,
                inputValue: 'ALL',
                margin: '5px 10px 0px 10px',
                listeners: {
                    change: function (checkbox, checked) {
                        const profileGroup = Ext.getCmp('profileGroupId');
                        if (checked === true) {
                            profileGroup.items.each(function (item) {
                                item.setRawValue(true);
                            });
                            profileGroup.fireEvent('customerchange');
                            Ext.fireEvent('selectAll', checkbox);
                            return;
                        }
                        profileGroup.items.each(function (item) {
                            item.setRawValue(false);
                        });
                        profileGroup.fireEvent('customerchange');
                        Ext.fireEvent('deselectAll', checkbox);
                    }
                }
            }, {
                xtype: 'checkboxgroup',
                id: 'profileGroupId',
                reference: 'profileBrigadeFilter',
                columns: 3,
                getState: function () {
                    return {"checked": this.getValue()};
                },
                applyState: function (state) {
                    Ext.fireEvent('setStateProfileBrigades', state);
                },
                stateEvents: [
                    'customerchange'
                ],
                stateId: 'checkBoxProfileBrigades',
                stateful: true,
                vertical: true,
                margin: '0px 5px 5px 5px',
                items: [{
                    boxLabel: 'БИТ',
                    checked: false,
                    inputValue: 'БИТ',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                            }
                        }
                    }
                },
                    {
                        boxLabel: 'Неот',
                        checked: false,
                        inputValue: 'Неот',
                        width: 100,
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'Пед',
                        checked: false,
                        inputValue: 'Пед',
                        width: 100,
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'Псих',
                        checked: false,
                        inputValue: 'Псих',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'Реан',
                        checked: false,
                        inputValue: 'Реан',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'Фелд',
                        checked: false,
                        inputValue: 'Фелд',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    }
                ]
            }]
        },
        {
            xtype: 'panel',
            title: 'Вызовы',
            items: [{
                xtype: 'checkbox',
                boxLabel: 'Все',
                reference: 'allCalls',
                checked: false,
                inputValue: 'ALL',
                margin: '5px 10px 0px 10px',
                listeners: {
                    change: function (checkbox, checked) {
                        const callGroup = Ext.getCmp('callGroupId');
                        if (checked === true) {
                            callGroup.items.each(function (item) {
                                item.setRawValue(true);
                            });
                            callGroup.fireEvent('customerchange');
                            Ext.fireEvent('selectAll', checkbox);
                            return;
                        }
                        callGroup.items.each(function (item) {
                            item.setRawValue(false);
                        });
                        callGroup.fireEvent('customerchange');
                        Ext.fireEvent('deselectAll', checkbox);
                    }
                }
            }, {
                xtype: 'checkboxgroup',
                id: 'callGroupId',
                reference: 'callStatusFilter',
                columns: 2,
                getState: function () {
                    return {"checked": this.getValue()};
                },
                applyState: function (state) {
                    Ext.fireEvent('setStateStatusCalls', state);
                },
                stateEvents: [
                    'customerchange'
                ],
                stateId: 'checkBoxStatusCalls',
                stateful: true,
                vertical: true,
                margin: '0px 5px 5px 5px',
                items: [{
                    boxLabel: 'Новые',
                    checked: false,
                    inputValue: 'NEW',
                    width: 100,
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedCallStatus', checkbox, checked);
                            }
                        }
                    }
                },
                    {
                        boxLabel: 'Исполнение',
                        checked: false,
                        inputValue: 'ASSIGNED',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedCallStatus', checkbox, checked);
                                }
                            }
                        }
                    }

                ]
            }]
        },
        {
            xtype: 'panel',
            title: 'Поиск по номеру бригады',
            layout: 'hbox',
            items: [
                {
                    xtype: 'textfield',
                    id: 'searchTextField',
                    label: 'Query',
                    name: 'query',
                    margin: '5px 10px 5px 10px',
                    enableKeyEvents: true,
                    listeners: {
                        keypress: function (textfield, eventObject) {
                            if (eventObject.getCharCode() === Ext.EventObject.ENTER) {
                                Ext.fireEvent('buttonSearch');
                            }
                        }
                    }
                },
                {
                    xtype: 'button',
                    text: 'Поиск',
                    margin: '5px 10px 5px 10px',
                    listeners: {
                        click: {
                            fn: function () {
                                Ext.fireEvent('buttonSearch');

                            }
                        }
                    }
                }
            ]
        }
    ]
});
