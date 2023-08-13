import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {saveAs} from 'file-saver';
import {sortedUniq as _sortedUniq} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {DialogHelperService} from '../../services/dialog-helper.service';
import {ToastService} from '../../services/toast.service';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {FormBuilder} from "@angular/forms";

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-key',
    templateUrl: './dialog-info-key.component.html',
    styleUrls: ['./dialog-info-key.component.scss']
})
export class DialogInfoKeyComponent implements OnInit, OnDestroy {
    keys;
    loading = true;
    consumerId;
    consumerName;
    currentTags = [];
    allTags = [];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        key: [''],
        ttl: [0],
        tags: []
    });

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private api: ApiService, private toast: ToastService,private fb: FormBuilder,
                private dialogHelper: DialogHelperService, private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
        this.getApiKeys();

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
    getApiKeys() {
        this.loading = true;

        // Recojo los datos del api
        this.api.getConsumerApiKeys(this.consumerId)
            .subscribe({
                next: (keys) => {
                    this.keys = keys['data'];
                },
                error: (error) => this.toast.error_general(error),
                complete: () =>
                    this.loading = false
            });
    }

    /**
     * Muestra u oculta la api key
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
        saveAs(blob, 'apikey.consumer_' + this.consumerName + '.json');
    }

    /**
     * Añade un api key al consumidor
     */
    addApiKeyToConsumer() {
        let body = {};
        if (this.form.controls.key.value !== '' && this.form.controls.key.value !== null) {
            body['key'] = this.form.controls.key.value;
        }
        if (this.form.controls.ttl.value > 0 && this.form.controls.ttl.value!==null) {
            body['ttl'] = this.form.controls.ttl.value;
        }
        body['tags'] = this.currentTags;

        // Guardo el acl en el consumidor
        this.api.postConsumerApiKey(this.consumerId, body)
            .subscribe({
                next: (res) => {
                    this.toast.success('text.id_extra', 'success.new_key', {msgExtra: res['id']});
                    this.getApiKeys();
                    this.form.reset();
                    this.currentTags = [];
                },
                error: (error) =>
                    this.toast.error_general(error, {disableTimeOut: true})
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
            name: this.showKey(apikey.key, false) + ' [' + this.translate.instant('text.consumer') + ' ' + this.consumerName + ']'
        }, 'key')
            .then(() => {
                this.getApiKeys();
            })
            .catch(() => {
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
