import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AutoUnsubscribe} from "ngx-auto-unsubscribe";
import {MatTableDataSource} from "@angular/material/table";
import {FormBuilder, Validators} from "@angular/forms";
import {saveAs} from 'file-saver';
import {sortedUniq as _sortedUniq} from 'lodash';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ApiService} from "../../services/api.service";
import {ToastService} from "../../services/toast.service";
import {DialogHelperService} from "../../services/dialog-helper.service";
import {TranslateService} from "@ngx-translate/core";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-oauth2',
    templateUrl: './dialog-info-oauth2.component.html',
    styleUrls: ['./dialog-info-oauth2.component.scss'],
    standalone: false
})
export class DialogInfoOauth2Component implements OnInit, OnDestroy {
    displayedColumns: string[] = ['name', 'client_id', 'client_secret', 'redirect_uris', 'hash_secret', 'actions'];
    dataSource: MatTableDataSource<any>;
    keys;
    loading = true;
    consumerId;
    consumerName;
    currentTags = [];
    allTags = [];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', [Validators.required]],
        client_id: [''],
        client_secret: [''],
        redirect_uris: ['', [Validators.required]],
        hash_secret: [false, [Validators.required]],
        tags: []
    });

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                private dialogHelper: DialogHelperService, private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
        this.getOAuth2Apps();

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
    getOAuth2Apps() {
        this.loading = true;

        // Recojo los datos del api
        this.api.getConsumerOAuthApp(this.consumerId)
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
        saveAs(blob, 'oauth2.consumer_' + this.consumerName + '.json');
    }

    /**
     * Añade un oauth al consumidor
     */
    onSubmit() {
        let body = this.form.value;
        if (body['client_id'] === '' || body['client_id'] === null) {
            delete body['client_id'];
        }
        if (body['client_secret'] === '' || body['client_secret'] === null) {
            delete body['client_secret'];
        }
        if (body['redirect_uris'] !== '' && body['redirect_uris'] !== null) {
            let newValue;
            if (body['redirect_uris'].includes('\n')) {
                newValue = body['redirect_uris'].split('\n');
            } else {
                newValue = body['redirect_uris'].split(',');
            }
            delete body['redirect_uris'];
            body['redirect_uris'] = newValue;
        }
        body['tags'] = this.currentTags;

        // Guardo el acl en el consumidor
        this.api.postConsumerOAuthApp(this.consumerId, body)
            .subscribe({
                next: (res) => {
                    this.toast.success('text.id_extra', 'success.new_oauth2', {msgExtra: res['id']});
                    this.getOAuth2Apps();
                    this.form.reset();
                    this.currentTags = [];
                },
                error: (error) => this.toast.error_general(error, {disableTimeOut: true})
            });
    }

    /**
     * Elimina un oauth2
     * @param oauth api key
     */
    deleteOauth2App(oauth) {
        this.dialogHelper.deleteElement({
            id: oauth.id,
            consumerId: this.consumerId,
            name: oauth.name + ' [' + this.translate.instant('text.consumer') + ' ' + this.consumerName + ']'
        }, 'oauth2')
            .then(() => {
                this.getOAuth2Apps();
            })
            .catch(error => {
            });
    }

    parseLines(redirect_uris: any) {
        let out = redirect_uris;
        if (redirect_uris) {
            out = redirect_uris.join('\n');
        }
        return out;
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

