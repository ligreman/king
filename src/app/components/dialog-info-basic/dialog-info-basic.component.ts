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
import {FormBuilder} from "@angular/forms";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-basic',
    templateUrl: './dialog-info-basic.component.html',
    styleUrls: ['./dialog-info-basic.component.scss'],
    standalone: false
})
export class DialogInfoBasicComponent implements OnInit, OnDestroy {
    auths;
    loading = true;
    consumerId;
    consumerName;
    currentTags = [];
    allTags = [];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        user: [''],
        pass: [''],
        tags: ['']
    });

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private api: ApiService, private toast: ToastService, private fb: FormBuilder,
                private dialogHelper: DialogHelperService, private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
        this.getBasicAuths();

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
     * Obtengo los datos del consumidor
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
        if (this.form.controls.user.value !== '' && this.form.controls.user.value !== null) {
            body['username'] = this.form.controls.user.value;
        }
        if (this.form.controls.pass.value !== '' && this.form.controls.pass.value !== null) {
            body['password'] = this.form.controls.pass.value;
        }
        body['tags'] = this.currentTags;

        // Guardo el acl en el consumidor
        this.api.postConsumerBasicAuth(this.consumerId, body)
            .subscribe({
                next: (res) => {
                    this.toast.success('text.id_extra', 'success.new_basic', {msgExtra: res['id']});
                    this.getBasicAuths();
                    this.form.reset();
                    this.currentTags = [];
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

    isDisabled() {
        return this.form.controls.user.value === '' || this.form.controls.pass.value === ''
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
