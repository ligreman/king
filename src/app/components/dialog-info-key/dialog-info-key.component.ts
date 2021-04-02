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
    consumerId;
    consumerName;

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
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

    /**
     * Muestra u oculta la api key
     * @param key Clave
     * @param hide Mostrar u ocultar
     */
    showKey(key, hide) {
        if (!hide) {
            key = key.substr(0, 5).padEnd(key.length, '*');
        }
        return key;
    }

    /**
     * Descarga en formato JSON los datos
     */
    downloadJson() {
        const blob = new Blob([JSON.stringify(this.keys, null, 2)], {type: 'text/json'});
        saveAs(blob, 'apikey.consumer_' + this.consumerName + '.json');
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
        this.dialogHelper.deleteElement({
            id: apikey.id,
            consumerId: this.consumerId,
            name: this.showKey(apikey.key, false) + ' [' + this.translate.instant('text.username') + ' ' + this.consumerName + ']'
        }, 'key')
            .then(() => { this.getApiKeys(); })
            .catch(error => {});
    }
}
