import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GlobalsService {
    private _NODE_API_URL = '';

    // NETWORK GRAPH
    private _NETWORK_NODES = {
        font: {
            color: '#343434',
            size: 14, // px
            face: 'arial',
            background: 'none',
            strokeWidth: 0, // px
            strokeColor: '#ffffff',
            align: 'center',
            multi: true,
            bold: {
                color: '#343434',
                size: 14, // px
                face: 'arial',
                mod: 'bold'
            },
            ital: {
                color: '#343434',
                size: 14, // px
                face: 'arial',
                mod: 'italic'
            },
            boldital: {
                color: '#343434',
                size: 14, // px
                face: 'arial',
                mod: 'bold italic'
            },
            mono: {
                color: '#343434',
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
                enabled: false,
                imageHeight: undefined,
                imageWidth: undefined,
                scaleFactor: 1,
                src: undefined,
                type: 'arrow'
            },
            middle: {
                enabled: false,
                imageHeight: 32,
                imageWidth: 32,
                scaleFactor: 1,
                src: 'https://visjs.org/images/visjs_logo.png',
                type: 'image'
            },
            from: {
                enabled: false,
                imageHeight: undefined,
                imageWidth: undefined,
                scaleFactor: 1,
                src: undefined,
                type: 'arrow'
            }
        },
        chosen: true,
        color: {
            inherit: 'from'
        },
        dashes: false,
        font: {
            color: '#343434',
            size: 14, // px
            face: 'arial',
            background: 'none',
            strokeWidth: 2, // px
            strokeColor: '#ffffff',
            align: 'horizontal',
            multi: false,
            bold: {
                color: '#343434',
                size: 14, // px
                face: 'arial',
                mod: 'bold'
            },
            ital: {
                color: '#343434',
                size: 14, // px
                face: 'arial',
                mod: 'italic'
            },
            boldital: {
                color: '#343434',
                size: 14, // px
                face: 'arial',
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
            shape: 'box',
            borderWidth: 2,
            borderWidthSelected: 3,
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
            shape: 'box',
            borderWidth: 2,
            borderWidthSelected: 3,
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
            shape: 'box',
            borderWidth: 2,
            borderWidthSelected: 3,
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
            shape: 'box',
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
            shape: 'box',
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
            shape: 'circle',
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
            shape: 'circle',
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
