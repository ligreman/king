import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { ApiService } from '../../services/api.service';
import { DialogHelperService } from '../../services/dialog-helper.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../../shared/custom-validators';

@Component({
    selector: 'app-dialog-info-jwt',
    templateUrl: './dialog-info-jwt.component.html',
    styleUrls: ['./dialog-info-jwt.component.scss']
})
export class DialogInfoJwtComponent implements OnInit {
    displayedColumns: string[] = ['key', 'algorithm', 'rsa_public_key', 'secret', 'actions'];
    dataSource: MatTableDataSource<any>;
    keys;
    loading = true;
    algorithm = 'HS256';
    validAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'ES256'];
    consumerId;
    consumerName;

    form = this.fb.group({
        key: [''],
        algorithm: ['HS256', [Validators.required, CustomValidators.isOneOf(this.validAlgorithms)]],
        rsa_public_key: [''],
        secret: ['']
    });

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) { }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
        this.getJwtTokens();
    }

    /**
     * Obtengo los acls
     */
    getJwtTokens() {
        this.loading = true;

        // Recojo los datos del api
        this.api.getConsumerJwtTokens(this.consumerId)
            .subscribe(tokens => {
                this.dataSource = new MatTableDataSource(tokens['data']);
                this.keys = tokens['data'];
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });
    }

    /**
     * Muestra u oculta el token
     * @param key Clave
     * @param hide Mostrar u ocultar
     */
    showKey(key, hide) {
        if (key === null) {
            return '';
        }

        if (!hide) {
            key = key.substring(0, 5).padEnd(key.length, '*');
        }
        return key;
    }

    /**
     * Descarga en formato JSON los datos
     */
    downloadJson() {
        const blob = new Blob([JSON.stringify(this.keys, null, 2)], {type: 'text/json'});
        saveAs(blob, 'jwt.consumer_' + this.consumerName + '.json');
    }

    /**
     * Añade un token al consumidor
     */
    onSubmit() {
        let body = this.form.value;
        if (body['key'] === '') {
            delete body['key'];
        }
        if (body['rsa_public_key'] === '') {
            delete body['rsa_public_key'];
        }
        if (body['secret'] === '') {
            delete body['secret'];
        }

        // Guardo el acl en el consumidor
        this.api.postConsumerJwtTokens(this.consumerId, body)
            .subscribe(res => {
                this.toast.success('text.id_extra', 'success.new_jwt', {msgExtra: res['id']});
                this.getJwtTokens();
                this.form.reset();
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
    }

    /**
     * Elimina un token
     * @param token api key
     */
    deleteJwtToken(token) {
        this.dialogHelper.deleteElement({
            id: token.id,
            consumerId: this.consumerId,
            name: this.showKey(token.key, false) + ' [' + this.translate.instant('text.username') + ' ' + this.consumerName + ']'
        }, 'jwt')
            .then(() => { this.getJwtTokens(); })
            .catch(error => {});
    }
}
