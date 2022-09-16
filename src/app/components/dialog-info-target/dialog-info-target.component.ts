import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from '../../services/api.service';
import { DialogHelperService } from '../../services/dialog-helper.service';
import { ToastService } from '../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-target',
    templateUrl: './dialog-info-target.component.html',
    styleUrls: ['./dialog-info-target.component.scss']
})
export class DialogInfoTargetComponent implements OnInit, OnDestroy {
    target;
    upstreamId;
    targetId;
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public data: string, private api: ApiService, private toast: ToastService,
                private translate: TranslateService, private dialogHelper: DialogHelperService) { }

    ngOnInit(): void {
        const aux = this.data.split('#');
        this.targetId = aux[0];
        this.upstreamId = aux[1];

        this.getData();
    }

    ngOnDestroy(): void {
    }

    getData() {
        // Recojo los datos del api de los target en el endpoint de health que me viene todo
        this.api.getUpstreamTargetsHealth(this.upstreamId)
            .subscribe({
                next: (up) => {
                    // Busco el target concreto
                    up['data'].forEach(tg => {
                        if (tg.id === this.targetId) {
                            this.target = tg;
                        }
                    });
                },
                error: (error) => this.toast.error_general(error),
                complete: () => this.loading = false
            });
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.target, null, 2)], {type: 'text/json'});
        saveAs(blob, 'target_' + this.targetId + '.json');
    }

    getWeigth() {
        return ((this.target['data']['weight'].available * 100) / this.target['data']['weight'].total);
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

    setTargetHealthy() {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('target.set_healthy_title'),
                name: this.target.target,
                id: this.target.id,
                content: this.translate.instant('target.set_healthy_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.putSetTargetHealthy(this.target.id, this.target.upstream.id)
                    .subscribe({
                        next: () => {
                            this.toast.success('success.healthy_target', '', {msgExtra: this.target.id});
                            // Recargo datos
                            this.getData();
                        },
                        error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                    });
            })
            .catch(() => {});
    }

    setTargetUnhealthy() {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('target.set_unhealthy_title'),
                name: this.target.target,
                id: this.target.id,
                content: this.translate.instant('target.set_unhealthy_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.putSetTargetUnhealthy(this.target.id, this.target.upstream.id)
                    .subscribe({
                        next: () => {
                            this.toast.success('success.unhealthy_target', '', {msgExtra: this.target.id});
                            // Recargo datos
                            this.getData();
                        },
                        error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                    });
            })
            .catch(() => {});
    }

    setAddressHealthy(addr, port) {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('address.set_healthy_title'),
                name: addr + ':' + port,
                id: this.target.id,
                content: this.translate.instant('target.set_healthy_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.putSetAddressHealthy(this.target.id, this.target.upstream.id, addr + ':' + port)
                    .subscribe({
                        next: () => {
                            this.toast.success('success.healthy_address', '', {msgExtra: addr + ':' + port});
                            // Recargo datos
                            this.getData();
                        },
                        error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                    });
            })
            .catch(() => {});
    }

    setAddressUnhealthy(addr, port) {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('address.set_unhealthy_title'),
                name: addr + ':' + port,
                id: this.target.id,
                content: this.translate.instant('target.set_unhealthy_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.putSetAddressUnhealthy(this.target.id, this.target.upstream.id, addr + ':' + port)
                    .subscribe({
                        next: () => {
                            this.toast.success('success.unhealthy_address', '', {msgExtra: addr + ':' + port});
                            // Recargo datos
                            this.getData();
                        },
                        error: error => this.toast.error_general(error, {disableTimeOut: true})
                    });
            })
            .catch(() => {});
    }
}
