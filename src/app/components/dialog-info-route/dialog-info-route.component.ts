import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { find as _find } from 'lodash';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-info-route',
    templateUrl: './dialog-info-route.component.html',
    styleUrls: ['./dialog-info-route.component.scss']
})
export class DialogInfoRouteComponent implements OnInit {
    route;
    services;
    loading = true;
    sniList = {};

    constructor(@Inject(MAT_DIALOG_DATA) public routeId: string, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        this.api.getServices()
            .subscribe(ss => {
                    this.services = ss['data'];

                    // Recojo los datos del api
                    this.api.getRoute(this.routeId)
                        .subscribe(route => {
                            this.route = route;
                        }, error => {
                            this.toast.error_general(error);
                        }, () => {
                            this.loading = false;
                        });

                    // La lista de SNIs
                    this.api.getSnis()
                        .subscribe(snis => {
                            for (let sni of snis['data']) {
                                this.sniList[sni.id] = sni.name;
                            }
                        }, error => {
                            this.toast.error_general(error);
                        });
                },
                error => {
                    this.toast.error('error.node_connection');
                }, () => {
                    this.loading = false;
                });
    }


    downloadJson() {
        const blob = new Blob([JSON.stringify(this.route, null, 2)], {type: 'text/json'});
        saveAs(blob, 'route_' + this.routeId + '.json');
    }

    /*
        Busco el nombre entre la lista de servicios
     */
    getServiceName(id) {
        const service = _find(this.services, {'id': id});
        return service.name;
    }

    drawHeaders(txt) {
        if (txt === null) {
            return '';
        }

        let res = [];
        const d = Object.getOwnPropertyNames(txt);

        for (const i of d) {
            res.push(i.toUpperCase() + ': ' + txt[i]);
        }

        return res;
    }

    drawIpPort(data) {
        let txt = '';

        if (data.ip) {
            txt = data.ip;
        }

        if (data.port) {
            txt += ':' + data.port;
        }

        return txt;
    }

    getSnis() {
        let txt = [];

        if (this.route.snis) {
            this.route.snis.forEach(sni => {
                txt.push(this.sniList[sni]);
            });
        }

        return txt.join(', ');
    }
}

