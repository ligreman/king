import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {
    MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog';
import * as Joi from 'joi';
import {size as _size, sortedUniq as _sortedUniq} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {ToastService} from '../../services/toast.service';
import {CustomValidators} from '../../shared/custom-validators';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-new-vault',
    templateUrl: './dialog-new-vault.component.html',
    styleUrls: ['./dialog-new-vault.component.scss'],
    standalone: false
})
export class DialogNewVaultComponent implements OnInit, OnDestroy {
    // Uso la variable para el estado del formulario
    formValid = false;
    currentTags = [];
    currentConfigs = {};
    allTags = [];
    editMode = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', [Validators.required, CustomValidators.isAlphaNum()]],
        prefix: ['', [Validators.required, CustomValidators.isAlphaNum()]],
        description: ['', [Validators.required]],
        config: [{}, []],
        tags: ['']
    }, {});

    constructor(@Inject(MAT_DIALOG_DATA) public vaultIdEdit: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                public dialogRef: MatDialogRef<DialogNewVaultComponent>) { }

    /*
        Getters de campos del formulario
     */
    get nameField() { return this.form.get('name'); }

    get prefixField() { return this.form.get('prefix'); }

    get descriptionField() { return this.form.get('description'); }

    get configField() { return this.form.get('config'); }

    ngOnInit(): void {
        // Si viene un servicio para editar
        if (this.vaultIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getVault(this.vaultIdEdit)
                .subscribe({
                    next: (vault) => {
                        // Cambios especiales para representarlos en el formulario
                        this.form.setValue(this.prepareDataForForm(vault));
                    },
                    error: (error) => this.toast.error_general(error)
                });
        }

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

    /*
        Submit del formulario
     */
    onSubmit() {
        const result = this.prepareDataForKong(this.form.value);

        // Si no venía selected, es que es nuevo servicio
        if (!this.editMode) {
            // llamo al API
            this.api.postNewVault(result)
                .subscribe({
                    next: value => {
                        this.toast.success('text.id_extra', 'success.new_vault', {msgExtra: value['id']});
                        this.dialogRef.close(true);
                    },
                    error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                });
        }
        // Si venía es que es edición
        else {
            this.api.patchVault(this.vaultIdEdit, result)
                .subscribe({
                    next: value => {
                        this.toast.success('text.id_extra', 'success.update_vault', {msgExtra: value['id']});
                        this.dialogRef.close(true);
                    },
                    error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                });
        }
    }

    /*
        Gestión de configs
     */
    addConfig(keyInput, valInput): void {
        const {error, value} = Joi.object({
            key: Joi.string().invalid('Host').required(),
            value: Joi.string().allow('')
        }).validate({key: keyInput.value, value: valInput.value});

        // Add
        if (error === undefined) {
            this.currentConfigs[keyInput.value] = valInput.value === '' ? null : valInput.value;
            // @ts-ignore
            this.form.get('config').setValue('true');

            keyInput.value = '';
            valInput.value = '';
        }
    }

    removeConfig(key): void {
        delete this.currentConfigs[key];
        if (_size(this.currentConfigs) === 0) {
            // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
            this.form.get('config').setValue(null);
        }
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

    /**
     * Formatear los datos para rellenar el formulario
     */
    prepareDataForForm(vault) {
        delete vault['id'];
        delete vault['created_at'];
        delete vault['updated_at'];

        this.currentConfigs = vault['config'] || {};
        vault['config'] = {};
        this.currentTags = vault['tags'] || [];
        vault['tags'] = [];

        return vault;
    }

    prepareDataForKong(body) {
        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
        }

        if (this.currentConfigs && Object.getOwnPropertyNames(this.currentConfigs).length > 0) {
            body.config = this.currentConfigs;
        } else {
            body.config = {};
        }

        return body;
    }
}

