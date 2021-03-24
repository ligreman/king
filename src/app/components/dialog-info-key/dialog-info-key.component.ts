import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ApiService } from '../../services/api.service';
import { DialogHelperService } from '../../services/dialog-helper.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-info-key',
    templateUrl: './dialog-info-key.component.html',
    styleUrls: ['./dialog-info-key.component.scss']
})
export class DialogInfoKeyComponent implements OnInit {
    keys;
    loading = true;
    key = '';
    ttl = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public consumerId: string, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.getApiKeys();
    }

    /**
     * Obtengo los acls
     */
    getApiKeys() {
        this.loading = true;

        // Recojo los datos del api
        this.api.getConsumerApiKeys(this.consumerId)
            .subscribe(keys => {
                this.keys = keys['data'];
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.keys, null, 2)], {type: 'text/json'});
        saveAs(blob, 'apikey.consumer_' + this.consumerId + '.json');
    }

    /**
     * Añade un api key al consumidor
     */
    addApiKeyToConsumer() {
        let body = {};
        if (this.key !== '') {
            body['key'] = this.key;
        }
        if (this.ttl > 0) {
            body['ttl'] = this.ttl;
        }

        // Guardo el acl en el consumidor
        this.api.postConsumerApiKey(this.consumerId, body)
            .subscribe(res => {
                this.toast.success('text.id_extra', 'success.new_key', {msgExtra: res['id']});
                this.getApiKeys();
                this.key = '';
                this.ttl = 0;
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
    }

    /**
     * Elimina un api key
     * @param apikey api key
     */
    deleteApiKey(apikey) {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('apikey.delete_key'),
                name: this.consumerId,
                id: apikey.id,
                content: this.translate.instant('apikey.delete_key_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.deleteConsumerApiKey(this.consumerId, apikey.id)
                    .subscribe(res => {
                        this.toast.success('text.id_extra', 'success.delete_key', {msgExtra: apikey.id});
                        this.getApiKeys();
                    }, error => {
                        this.toast.error_general(error, {disableTimeOut: true});
                    });
            })
            .catch(error => {});
    }
}
