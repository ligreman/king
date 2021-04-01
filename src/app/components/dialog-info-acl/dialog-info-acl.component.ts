import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ApiService } from '../../services/api.service';
import { DialogHelperService } from '../../services/dialog-helper.service';
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
    consumerId;
    consumerName;

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
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
        saveAs(blob, 'acl.consumer_' + this.consumerName + '.json');
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
     * @param acl Acl
     */
    deleteAcl(acl) {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('acl.delete_acl'),
                name: this.consumerName,
                id: acl.id,
                delete: true,
                content: this.translate.instant('acl.delete_acl_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.deleteConsumerAcl(this.consumerId, acl.id)
                    .subscribe(res => {
                        this.toast.success('text.id_extra', 'success.delete_acl', {msgExtra: acl.group});
                        this.getAcls();
                    }, error => {
                        this.toast.error_general(error, {disableTimeOut: true});
                    });
            })
            .catch(error => {});
    }
}
