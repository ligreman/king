import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {TranslateService} from '@ngx-translate/core';
import {saveAs} from 'file-saver';
import {sortedUniq as _sortedUniq} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {DialogHelperService} from '../../services/dialog-helper.service';
import {ToastService} from '../../services/toast.service';
import {CustomValidators} from '../../shared/custom-validators';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-jwt',
    templateUrl: './dialog-info-jwt.component.html',
    styleUrls: ['./dialog-info-jwt.component.scss'],
    standalone: false
})
export class DialogInfoJwtComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['key', 'algorithm', 'rsa_public_key', 'secret', 'actions'];
    dataSource: MatTableDataSource<any>;
    keys;
    loading = true;
    algorithm = 'HS256';
    validAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'ES256'];
    consumerId;
    consumerName;
    currentTags = [];
    allTags = [];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        key: [''],
        algorithm: ['HS256', [Validators.required, CustomValidators.isOneOf(this.validAlgorithms)]],
        rsa_public_key: [''],
        secret: [''],
        tags: []
    });

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
        this.getJwtTokens();

        // Lista de tags
        this.api.getTags()
            .subscribe((res) => {
                // Recojo las tags
                res['data'].forEach(data => {
                    this.allTags.push(data.tag);
                });
                this.allTags.sort();
                this.allTags = _sortedUniq(this.allTags);
            });
    }

    ngOnDestroy(): void {
    }

    /**
     * Obtengo los acls
     */
    getJwtTokens() {
        this.loading = true;

        // Recojo los datos del api
        this.api.getConsumerJwtTokens(this.consumerId)
            .subscribe({
                next: (tokens) => {
                    this.dataSource = new MatTableDataSource(tokens['data']);
                    this.keys = tokens['data'];
                },
                error: (error) => this.toast.error_general(error),
                complete: () => this.loading = false
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
        if (body['key'] === '' || body['key'] === null) {
            delete body['key'];
        }
        if (body['rsa_public_key'] === '' || body['rsa_public_key'] === null) {
            delete body['rsa_public_key'];
        }
        if (body['secret'] === '' || body['secret'] === null) {
            delete body['secret'];
        }
        body['tags'] = this.currentTags;

        // Guardo el acl en el consumidor
        this.api.postConsumerJwtTokens(this.consumerId, body)
            .subscribe({
                next: (res) => {
                    this.toast.success('text.id_extra', 'success.new_jwt', {msgExtra: res['id']});
                    this.getJwtTokens();
                    this.form.reset();
                    this.currentTags = [];
                },
                error: (error) => this.toast.error_general(error, {disableTimeOut: true})
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
            name: this.showKey(token.key, false) + ' [' + this.translate.instant('text.consumer') + ' ' + this.consumerName + ']'
        }, 'jwt')
            .then(() => {
                this.getJwtTokens();
            })
            .catch(error => {
            });
    }

    /*
        Gestión de tags
     */
    addTag(event: MatChipInputEvent): void {
        const input = event.chipInput.inputElement;
        const value = event.value.trim();

        // Add our tag
        if ((value || '') && /^[\w.\-_~]+$/.test(value)) {
            this.currentTags.push(value);

            // Reset the input value
            if (input) {
                input.value = '';
            }
        }
    }

    removeTag(tag): void {
        const index = this.currentTags.indexOf(tag);
        if (index >= 0) {
            this.currentTags.splice(index, 1);
        }
    }

    selectedTag($event: MatAutocompleteSelectedEvent) {
        this.currentTags.push($event.option.viewValue);
    }
}
