import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ApiService } from '../../services/api.service';
import { DialogHelperService } from '../../services/dialog-helper.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-info-upstream',
    templateUrl: './dialog-info-upstream.component.html',
    styleUrls: ['./dialog-info-upstream.component.scss']
})
export class DialogInfoUpstreamComponent implements OnInit {
    upstream;
    upstreamHealth;
    targets;
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public upstreamId: string, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.reloadData();
    }

    reloadData() {
        this.loading = true;
        this.getData().then(value => {
                this.loading = false;
            },
            error => {
                this.toast.error_general(error);
                this.loading = false;
            });
    }

    async getData() {
        // Datos del upstream
        this.upstream = await this.api.getUpstream(this.upstreamId).toPromise();
        // Salud del upstream
        const h = await this.api.getUpstreamHealth(this.upstreamId).toPromise();
        this.upstreamHealth = h['data']['health'];
        // Salud de los targets y su info
        const t = await this.api.getUpstreamTargetsHealth(this.upstreamId).toPromise();
        this.targets = t['data'];
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.upstream, null, 2)], {type: 'text/json'});
        saveAs(blob, 'service_' + this.upstreamId + '.json');
    }

    showTargetInfo(target) {
        target['data'] = {upstream: target['upstream']};
        this.dialogHelper.showInfoElement(target, 'target');
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
                this.api.postSetTargetHealthy(selected.id, selected.upstream.id)
                    .subscribe(value => {
                        this.toast.success('success.healthy_target', '', {msgExtra: selected.id});
                    }, error => {
                        this.toast.error_general(error, {disableTimeOut: true});
                    });
            })
            .catch(error => {});
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
                this.api.postSetTargetUnhealthy(selected.id, selected.upstream.id)
                    .subscribe(value => {
                        this.toast.success('success.unhealthy_target', '', {msgExtra: selected.id});
                    }, error => {
                        this.toast.error_general(error, {disableTimeOut: true});
                    });
            })
            .catch(error => {});
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
