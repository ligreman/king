import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {saveAs} from 'file-saver';
import {find as _find} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {DialogHelperService} from '../../services/dialog-helper.service';
import {GlobalsService} from '../../services/globals.service';
import {ToastService} from '../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-route',
    templateUrl: './dialog-info-route.component.html',
    styleUrls: ['./dialog-info-route.component.scss']
})
export class DialogInfoRouteComponent implements OnInit, OnDestroy {
    route;
    services;
    loading = true;
    sniList = {};
    expressions = true;

    constructor(@Inject(MAT_DIALOG_DATA) public routeId: string, private api: ApiService, private globals: GlobalsService, private toast: ToastService, private dialogHelper: DialogHelperService) {
    }

    ngOnInit(): void {
        this.dialogHelper.getRouterMode().then(() => {
            // Si no estoy en modo expressions cambio la tabla
            if (this.globals.ROUTER_MODE !== 'expressions') {
                this.expressions = false;
            }
            this.loadData();
        }).catch(() => this.toast.error('error.route_mode'));
    }

    ngOnDestroy(): void {
    }

    loadData() {
        this.api.getAllServices(null, [], ['id', 'name'])
            .then((ss) => {
                this.services = ss['data'];

                // Recojo los datos del api
                this.api.getRoute(this.routeId)
                    .subscribe({
                        next: (route) => {
                            this.route = route;
                        },
                        error: (error) => this.toast.error_general(error),
                        complete: () => this.loading = false
                    });

                // La lista de SNIs
                this.api.getAllSnis(null, [], ['id', 'name'])
                    .then((snis) => {
                        for (let sni of snis['data']) {
                            this.sniList[sni.id] = sni.name;
                        }
                    })
                    .catch(error => {
                        this.toast.error_general(error)
                    })
                    .finally(()=>{this.loading = false;});
            })
            .catch(error => {
                this.toast.error_general(error);
                this.loading = false
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
        if (txt === null || txt === undefined) {
            return [''];
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

