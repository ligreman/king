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
    selector: 'app-dialog-info-acl',
    templateUrl: './dialog-info-acl.component.html',
    styleUrls: ['./dialog-info-acl.component.scss']
})
export class DialogInfoAclComponent implements OnInit, OnDestroy {
    acls;
    total_acls: string[] = [];
    filteredAcls: string[] = [];
    loading = true;
    group = '';
    consumerId;
    consumerName;

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
        this.getAcls();
    }

    ngOnDestroy(): void {
    }

    valueChanged() {
        setTimeout(() => {
            let group = this.group;

            // Limpio primero para que se entere de que está cambiando el valor
            this.filteredAcls = [];
            if (group !== '') {
                this.filteredAcls = this._filterAcls(group);
            } else {
                this.filteredAcls = this.total_acls;
            }
        }, 0);
    }

    /**
     * Obtengo los acls
     */
    getAcls() {
        this.loading = true;

        // Recojo los datos del api
        this.api.getConsumerAcls(this.consumerId)
            .subscribe({
                next: (acls) => {
                    this.acls = acls['data'];
                    let yatengo = [];
                    this.acls.forEach(one => {yatengo.push(one.group);});

                    // Recojo también todos los acls existentes para rellenar el autocomplete
                    this.api.getAcls()
                        .subscribe({
                            next: (acls) => {
                                acls['data'].forEach(acl => {
                                    // Si es un acl que no tiene ya el consumidor, lo añado al autocomplete
                                    if (!yatengo.includes(acl.group)) {
                                        this.total_acls.push(acl.group);
                                        this.filteredAcls.push(acl.group);
                                    }
                                });

                                // Elimino duplicados
                                this.total_acls = [...new Set(this.total_acls)];
                                this.filteredAcls = [...new Set(this.filteredAcls)];
                                // Ordeno
                                this.total_acls.sort();
                                this.filteredAcls.sort();
                            },
                            error: (error) => this.toast.error_general(error),
                            complete: () => this.loading = false
                        });
                },
                error: (error) => this.toast.error_general(error),
                complete: () => this.loading = false
            });
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.acls, null, 2)], {type: 'text/json'});
        saveAs(blob, 'acl.consumer_' + this.consumerName + '.json');
    }

    /**
     * Añade un acl al consumidor
     */
    addAclToConsumer() {
        // Guardo el acl en el consumidor
        this.api.postConsumerAcl(this.consumerId, {group: this.group})
            .subscribe({
                next: () => {
                    this.toast.success('text.id_extra', 'success.new_acl', {msgExtra: this.group});
                    this.getAcls();
                    this.group = '';
                },
                error: (error) => this.toast.error_general(error, {disableTimeOut: true})
            });
    }

    /**
     * Elimina un acl
     * @param acl Acl
     */
    deleteAcl(acl) {
        this.dialogHelper.deleteElement({
            id: acl.id,
            consumerId: this.consumerId,
            name: acl.group + ' [' + this.translate.instant('text.username') + ' ' + this.consumerName + ']'
        }, 'acl')
            .then(() => { this.getAcls(); })
            .catch(error => {});
    }

    private _filterAcls(value) {
        const filterValue = value.toLowerCase();

        return this.total_acls.filter(option => option.toLowerCase().includes(filterValue));
    }
}
