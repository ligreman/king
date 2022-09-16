import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { DialogHelperService } from '../../services/dialog-helper.service';
import { ToastService } from '../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-upstream',
    templateUrl: './dialog-info-upstream.component.html',
    styleUrls: ['./dialog-info-upstream.component.scss']
})
export class DialogInfoUpstreamComponent implements OnInit, OnDestroy {
    upstream;
    upstreamHealth;
    upstreamBar = {ok: 0, off: 0, color: 'primary'};
    targets;
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public upstreamId: string, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.reloadData();
    }

    ngOnDestroy(): void {
    }

    reloadData() {
        this.loading = true;
        this.getData().then(() => {
                this.loading = false;
            },
            error => {
                this.toast.error_general(error);
                this.loading = false;
            });
    }

    async getData() {
        // Datos del upstream
        this.upstream = await firstValueFrom(this.api.getUpstream(this.upstreamId));
        // Salud del upstream
        this.upstreamHealth = await firstValueFrom(this.api.getUpstreamHealth(this.upstreamId));
        // Salud de los targets y su info
        const t = await firstValueFrom(this.api.getUpstreamTargetsHealth(this.upstreamId));
        this.targets = t['data'];

        // Calculo el porcentaje de health del upstream según sus targets
        let total = 0, ok = 0, off = 0;
        this.targets.forEach(tg => {
            total += tg.weight;
            if (tg.health === 'HEALTHY') {
                ok += tg.weight;
                // Lo sumo al off también para la barra
                off += tg.weight;
            } else if (tg.health === 'HEALTHCHECKS_OFF') {
                off += tg.weight;
            }
        });

        // Calculo los porcentajes
        this.upstreamBar.ok = (ok * 100) / total;
        this.upstreamBar.off = (off * 100) / total;

        // colores
        this.upstreamBar.color = this.getColor(this.upstreamHealth['data']['health']);
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.upstream, null, 2)], {type: 'text/json'});
        saveAs(blob, 'upstream_' + this.upstreamId + '.json');
    }

    showTargetInfo(target) {
        target['data'] = {upstream: target['upstream']};
        this.dialogHelper.showInfoElement(target, 'target');
    }

    /*
        Calculates color
     */
    getColor(health) {
        let color = 'primary';

        switch (health) {
            case 'DNS_ERROR':
            case 'UNHEALTHY':
                color = 'warn';
                break;
            case 'HEALTHY':
                color = 'accent';
        }

        return color;
    }

    /*
        Pone el target en estado sano
     */
    setTargetHealthy(selected) {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('target.set_healthy_title'),
                name: selected.target,
                id: selected.id,
                content: this.translate.instant('target.set_healthy_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.putSetTargetHealthy(selected.id, selected.upstream.id)
                    .subscribe({
                        next: () => {
                            this.toast.success('success.healthy_target', '', {msgExtra: selected.id});
                            this.reloadData();
                        },
                        error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                    });
            })
            .catch(() => {});
    }

    /*
        Pone el target en estado erróneo
     */
    setTargetUnhealthy(selected) {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('target.set_unhealthy_title'),
                name: selected.target,
                id: selected.id,
                content: this.translate.instant('target.set_unhealthy_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.putSetTargetUnhealthy(selected.id, selected.upstream.id)
                    .subscribe({
                        next: () => {
                            this.toast.success('success.unhealthy_target', '', {msgExtra: selected.id});
                            this.reloadData();
                        },
                        error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                    });
            })
            .catch(() => {});
    }

    /*
        Borra el elemento seleccionado
     */
    deleteTarget(select) {
        this.dialogHelper.deleteElement(select, 'target').then(() => {
            // Recargo la info del upstream
            this.reloadData();
        });
    }

    /*
        Añade un target al upstream
     */
    addTarget() {
        this.dialogHelper.addEdit(this.upstream, 'target').then(() => {
            // Recargo la info del upstream
            this.reloadData();
        });
    }
}
