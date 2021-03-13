import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-info-acl',
    templateUrl: './dialog-info-acl.component.html',
    styleUrls: ['./dialog-info-acl.component.scss']
})
export class DialogInfoAclComponent implements OnInit {
    acls;
    loading = true;
    group = '';

    constructor(@Inject(MAT_DIALOG_DATA) public consumerId: string, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        this.getAcls();
    }

    /**
     * Obtengo los acls
     */
    getAcls() {
        this.loading = true;

        // Recojo los datos del api
        this.api.getConsumerAcls(this.consumerId)
            .subscribe(acls => {
                this.acls = acls['data'];
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.acls, null, 2)], {type: 'text/json'});
        saveAs(blob, 'service_' + this.consumerId + '.json');
    }

    /**
     * Añade un acl al consumidor
     */
    addAclToConsumer() {
        // Guardo el acl en el consumidor
        this.api.postConsumerAcl(this.consumerId, {group: this.group})
            .subscribe(res => {
                this.toast.success('text.id_extra', 'success.new_acl', {msgExtra: this.group});
                this.getAcls();
                this.group = '';
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
    }

    /**
     * Elimina un acl
     * @param aclId ID del Acl
     */
    deleteAcl(aclId) {
        this.api.deleteConsumerAcl(this.consumerId, aclId)
            .subscribe(res => {
                this.toast.success('text.id_extra', 'success.delete_acl', {msgExtra: this.group});
                this.getAcls();
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
    }
}
