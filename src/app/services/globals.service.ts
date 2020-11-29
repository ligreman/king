import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GlobalsService {
    private _NODE_API_URL = '';

    // NETWORK GRAPH
    private _NETWORK_NODES = {
        font: {
            color: '#CCCCCC',
            size: 12, // px
            face: 'Roboto',
            background: 'none',
            strokeWidth: 1, // px
            strokeColor: '#343434',
            align: 'center',
            multi: true,
            bold: {
                color: '#CCCCCC',
                size: 16, // px
                face: 'Roboto',
                mod: 'bold'
            },
            ital: {
                color: '#CCCCCC',
                size: 12, // px
                face: 'Roboto',
                mod: 'italic'
            },
            boldital: {
                color: '#CCCCCC',
                size: 12, // px
                face: 'Roboto',
                mod: 'bold italic'
            },
            mono: {
                color: '#CCCCCC',
                size: 15, // px
                face: 'courier new',
                mod: ''
            }
        },
        shapeProperties: {
            borderDashes: false,
            borderRadius: 2
        }
    };

    private _NETWORK_EDGES = {
        arrows: {
            to: {
                enabled: true,
                // imageHeight: undefined,
                // imageWidth: undefined,
                scaleFactor: 1,
                // src: undefined,
                type: 'arrow'
            },
            from: {
                enabled: false,
                // imageHeight: undefined,
                // imageWidth: undefined,
                scaleFactor: 1,
                // src: undefined,
                type: 'arrow'
            }
        },
        chosen: true,
        smooth: true,
        endPointOffset: {
            to: -10
        },
        color: {
            inherit: 'from'
        },
        dashes: false,
        font: {
            color: '#343434',
            size: 14, // px
            face: 'Roboto',
            background: 'none',
            strokeWidth: 2, // px
            strokeColor: '#ffffff',
            align: 'horizontal',
            multi: false,
            bold: {
                color: '#343434',
                size: 14, // px
                face: 'Roboto',
                mod: 'bold'
            },
            ital: {
                color: '#343434',
                size: 14, // px
                face: 'Roboto',
                mod: 'italic'
            },
            boldital: {
                color: '#343434',
                size: 14, // px
                face: 'Roboto',
                mod: 'bold italic'
            },
            mono: {
                color: '#343434',
                size: 15, // px
                face: 'courier new',
                mod: ''
            }
        },
        labelHighlightBold: true,
        selectionWidth: 1,
        width: 1
    };

    private _NETWORK_GROUPS = {
        service: {
            shape: 'icon',
            icon: {
                face: 'Material Icons',
                code: 'memory',
                color: '#81C784',
                size: 50
            },
            borderWidth: 2,
            borderWidthSelected: 3,
            font: {size: 16},
            chosen: true,
            color: {
                border: '#388E3C',
                background: '#81C784',
                highlight: {
                    border: '#388E3C',
                    background: '#A5D6A7'
                },
                hover: {
                    border: '#388E3C',
                    background: '#A5D6A7'
                }
            }
        },
        route: {
            shape: 'icon',
            icon: {
                face: 'Material Icons',
                code: 'timeline',
                color: '#4FC3F7',
                size: 50
            },
            borderWidth: 2,
            borderWidthSelected: 3,
            font: {size: 16},
            chosen: true,
            color: {
                border: '#0288D1',
                background: '#4FC3F7',
                highlight: {
                    border: '#0288D1',
                    background: '#81D4FA'
                },
                hover: {
                    border: '#0288D1',
                    background: '#81D4FA'
                }
            }
        },
        upstream: {
            shape: 'icon',
            icon: {
                face: 'Material Icons',
                code: 'mediation',
                color: '#FFB74D',
                size: 50
            },
            borderWidth: 2,
            borderWidthSelected: 3,
            font: {size: 16},
            chosen: true,
            color: {
                border: '#F57C00',
                background: '#FFB74D',
                highlight: {
                    border: '#F57C00',
                    background: '#FFCC80'
                },
                hover: {
                    border: '#F57C00',
                    background: '#FFCC80'
                }
            }
        },
        plugin: {
            shape: 'icon',
            icon: {
                face: 'Material Icons',
                code: 'settings_input_component',
                color: '#FFF176',
                size: 30
            },
            borderWidth: 2,
            borderWidthSelected: 3,
            chosen: true,
            color: {
                border: '#FBC02D',
                background: '#FFF176',
                highlight: {
                    border: '#FBC02D',
                    background: '#FFF59D'
                },
                hover: {
                    border: '#FBC02D',
                    background: '#FFF59D'
                }
            }
        },
        consumer: {
            shape: 'icon',
            icon: {
                face: 'Material Icons',
                code: 'shopping_cart',
                color: '#E0E0E0',
                size: 30
            },
            borderWidth: 2,
            borderWidthSelected: 3,
            chosen: true,
            color: {
                border: '#616161',
                background: '#E0E0E0',
                highlight: {
                    border: '#616161',
                    background: '#EEEEEE'
                },
                hover: {
                    border: '#616161',
                    background: '#EEEEEE'
                }
            }
        },
        target: {
            shape: 'icon',
            icon: {
                face: 'Material Icons',
                code: 'gps_fixed',
                color: '#E57373',
                size: 30
            },
            borderWidth: 1,
            borderWidthSelected: 2,
            chosen: true,
            color: {
                border: '#D32F2F',
                background: '#EF9A9A',
                highlight: {
                    border: '#D32F2F',
                    background: '#FFCDD2'
                },
                hover: {
                    border: '#D32F2F',
                    background: '#FFCDD2'
                }
            }
        },
        host: {
            shape: 'icon',
            icon: {
                face: 'Material Icons',
                code: 'language',
                color: '#E57373',
                size: 30
            },
            borderWidth: 1,
            borderWidthSelected: 2,
            chosen: true,
            color: {
                border: '#D32F2F',
                background: '#EF9A9A',
                highlight: {
                    border: '#D32F2F',
                    background: '#FFCDD2'
                },
                hover: {
                    border: '#D32F2F',
                    background: '#FFCDD2'
                }
            }
        },
        cert: {
            shape: 'circle',
            borderWidth: 1,
            borderWidthSelected: 2,
            chosen: true,
            color: {
                border: '#7B1FA2',
                background: '#CE93D8',
                highlight: {
                    border: '#7B1FA2',
                    background: '#E1BEE7'
                },
                hover: {
                    border: '#7B1FA2',
                    background: '#E1BEE7'
                }
            }
        },
        cacert: {
            shape: 'circle',
            borderWidth: 1,
            borderWidthSelected: 2,
            chosen: true,
            color: {
                border: '#7B1FA2',
                background: '#CE93D8',
                highlight: {
                    border: '#7B1FA2',
                    background: '#E1BEE7'
                },
                hover: {
                    border: '#7B1FA2',
                    background: '#E1BEE7'
                }
            }
        },
        sni: {
            shape: 'circle',
            borderWidth: 1,
            borderWidthSelected: 2,
            chosen: true,
            color: {
                border: '#7B1FA2',
                background: '#CE93D8',
                highlight: {
                    border: '#7B1FA2',
                    background: '#E1BEE7'
                },
                hover: {
                    border: '#7B1FA2',
                    background: '#E1BEE7'
                }
            }
        }
    };

    constructor() {
    }

    get NODE_API_URL(): string {
        return this._NODE_API_URL;
    }

    set NODE_API_URL(value: string) {
        this._NODE_API_URL = value;
    }

    get NETWORK_GROUPS(): {} {
        return this._NETWORK_GROUPS;
    }

    get NETWORK_NODES(): {} {
        return this._NETWORK_NODES;
    }

    get NETWORK_EDGES(): {} {
        return this._NETWORK_EDGES;
    }
}