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
            checked: true,
            inputValue: 'ALL',
            margin: '5px 10px 0px 10px',
            listeners: {
                change: function (checkbox, checked) {
                    if (checked === true) {
                        Ext.getCmp('stationGroupId').items.each(function (item) {
                            item.setValue(true);
                        })
                    }
                    if (checked === false) {
                        var i = true;
                        Ext.getCmp('stationGroupId').items.each(function (item) {
                            if (item.checked === false) {
                                i = false;
                            }
                        });
                        if (i === true) {
                            Ext.getCmp('stationGroupId').items.each(function (item) {
                                item.setValue(false);
                            })
                        }
                    }
                }
            }
        }, {
            xtype: 'checkboxgroup',
            id: 'stationGroupId',
            reference: 'stationFilter',
            columns: 3,
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
            checked: true,
            inputValue: 'ALL',
            margin: '5px 10px 0px 10px',
            listeners: {
                change: function (checkbox, checked) {
                    if (checked === true) {
                        Ext.getCmp('statusGroupId').items.each(function (item) {
                            item.setValue(true);
                        })
                    }
                    if (checked === false) {
                        var i = true;
                        Ext.getCmp('statusGroupId').items.each(function (item) {
                            if (item.checked === false) {
                                i = false;
                            }
                        });
                        if (i === true) {
                            Ext.getCmp('statusGroupId').items.each(function (item) {
                                item.setValue(false);
                            })
                        }
                    }
                }
            }
        }, {
            xtype: 'checkboxgroup',
            id: 'statusGroupId',
            reference: 'statusBrigadeFilter',
            columns: 1,
            vertical: true,
            margin: '0px 5px 5px 5px',

            items: [{
                boxLabel: 'Свободна',
                checked: true,
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
                    checked: true,
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
                    checked: true,
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
                    checked: true,
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
                    checked: true,
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
                    checked: true,
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
                    checked: true,
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
                    checked: true,
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
                    boxLabel: 'Нападение на бригаду',
                    checked: true,
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
                checked: true,
                inputValue: 'ALL',
                margin: '5px 10px 0px 10px',
                listeners: {
                    change: function (checkbox, checked) {
                        if (checked === true) {
                            Ext.getCmp('profileGroupId').items.each(function (item) {
                                item.setValue(true);
                            })
                        }
                        if (checked === false) {
                            var i = true;
                            Ext.getCmp('profileGroupId').items.each(function (item) {
                                if (item.checked === false) {
                                    i = false;
                                }
                            });
                            if (i === true) {
                                Ext.getCmp('profileGroupId').items.each(function (item) {
                                    item.setValue(false);
                                })
                            }
                        }
                    }
                }
            }, {
                xtype: 'checkboxgroup',
                id: 'profileGroupId',
                reference: 'profileBrigadeFilter',
                columns: 1,
                vertical: true,
                margin: '0px 5px 5px 5px',
                items: [{
                    boxLabel: 'ВБ',
                    checked: true,
                    inputValue: 'ВБ',
                    listeners: {
                        change: {
                            fn: function (checkbox, checked) {
                                Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                            }
                        }
                    }
                },
                    {
                        boxLabel: 'ФБ',
                        checked: true,
                        inputValue: 'ФБ',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'РХБ',
                        checked: true,
                        inputValue: 'РХБ',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'ПсихБ',
                        checked: true,
                        inputValue: 'ПсихБ',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'СКБ',
                        checked: true,
                        inputValue: 'СКБ',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'ПРБ',
                        checked: true,
                        inputValue: 'ПРБ',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'ПБ',
                        checked: true,
                        inputValue: 'ПБ',
                        listeners: {
                            change: {
                                fn: function (checkbox, checked) {
                                    Ext.fireEvent('checkedProfileBrigade', checkbox, checked);
                                }
                            }
                        }
                    },
                    {
                        boxLabel: 'Б/перс',
                        checked: true,
                        inputValue: 'Б/перс',
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
                checked: true,
                inputValue: 'ALL',
                margin: '5px 10px 0px 10px',
                listeners: {
                    change: function (checkbox, checked) {
                        if (checked === true) {
                            Ext.getCmp('callGroupId').items.each(function (item) {
                                item.setValue(true);
                            })
                        }
                        if (checked === false) {
                            var i = true;
                            Ext.getCmp('callGroupId').items.each(function (item) {
                                if (item.checked === false) {
                                    i = false;
                                }
                            });
                            if (i === true) {
                                Ext.getCmp('callGroupId').items.each(function (item) {
                                    item.setValue(false);
                                })
                            }
                        }
                    }
                }
            }, {
                xtype: 'checkboxgroup',
                id: 'callGroupId',
                reference: 'callStatusFilter',
                columns: 1,
                vertical: true,
                margin: '0px 5px 5px 5px',
                items: [{
                    boxLabel: 'Новые',
                    checked: true,
                    inputValue: 'NEW',
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
                        checked: true,
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
        }
    ]
});
