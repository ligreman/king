import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {saveAs} from 'file-saver';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {DialogHelperService} from '../../services/dialog-helper.service';
import {ToastService} from '../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-basic',
    templateUrl: './dialog-info-basic.component.html',
    styleUrls: ['./dialog-info-basic.component.scss']
})
export class DialogInfoBasicComponent implements OnInit, OnDestroy {
    auths;
    loading = true;
    user = '';
    pass = '';
    consumerId;
    consumerName;

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
        this.getBasicAuths();
    }

    ngOnDestroy(): void {
    }

    /**
     * Obtengo los acls
     */
    getBasicAuths() {
        this.loading = true;

        // Recojo los datos del api
        this.api.getConsumerBasicAuths(this.consumerId)
            .subscribe({
                next: (auths) => {
                    this.auths = auths['data'];
                },
                error: (error) => this.toast.error_general(error),
                complete: () =>
                    this.loading = false
            });
    }

    /**
     * Descarga en formato JSON los datos
     */
    downloadJson() {
        const blob = new Blob([JSON.stringify(this.auths, null, 2)], {type: 'text/json'});
        saveAs(blob, 'basicauth.consumer_' + this.consumerName + '.json');
    }

    /**
     * Añade un api key al consumidor
     */
    addBasicAuthToConsumer() {
        let body = {};
        if (this.user !== '') {
            body['username'] = this.user;
        }
        if (this.pass !== '') {
            body['password'] = this.pass;
        }

        // Guardo el acl en el consumidor
        this.api.postConsumerBasicAuth(this.consumerId, body)
            .subscribe({
                next: (res) => {
                    this.toast.success('text.id_extra', 'success.new_basic', {msgExtra: res['id']});
                    this.getBasicAuths();
                    this.user = '';
                    this.pass = '';
                },
                error: (error) =>
                    this.toast.error_general(error, {disableTimeOut: true})
            });
    }

    /**
     * Elimina un api key
     * @param auth api key
     */
    deleteBasicAuth(auth) {
        this.dialogHelper.deleteElement({
            id: auth.id,
            consumerId: this.consumerId,
            name: auth.username + ' [' + this.translate.instant('text.consumer') + ' ' + this.consumerName + ']'
        }, 'basic')
            .then(() => {
                this.getBasicAuths();
            })
            .catch(() => {
            });
    }
}
