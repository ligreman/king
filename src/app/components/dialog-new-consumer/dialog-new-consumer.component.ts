import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isEmpty as _isEmpty, sortedUniq as _sortedUniq } from 'lodash';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-new-consumer',
    templateUrl: './dialog-new-consumer.component.html',
    styleUrls: ['./dialog-new-consumer.component.scss']
})
export class DialogNewConsumerComponent implements OnInit {
    formValid = false;
    editMode = false;
    loading = true;
    currentTags = [];
    allTags = [];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        username: ['', []],
        custom_id: ['', []],
        tags: ['']
    }, {validators: [FinalFormValidator()]});

    constructor(@Inject(MAT_DIALOG_DATA) public consumerIdEdit: any, private fb: FormBuilder, public dialogRef: MatDialogRef<DialogNewConsumerComponent>,
                private api: ApiService, private toast: ToastService) { }

    get usernameField() { return this.form.get('username'); }

    get customField() { return this.form.get('custom_id'); }

    ngOnInit(): void {
        // Si viene  para editar
        if (this.consumerIdEdit !== null) {
            this.editMode = true;

            // Rescato la info  del api
            this.api.getConsumer(this.consumerIdEdit)
                .subscribe(consumer => {
                    // Relleno el formuarlio
                    this.form.setValue(this.prepareDataForForm(consumer));
                }, error => {
                    this.toast.error_general(error);
                }, () => {
                    this.loading = false;
                });
        } else {
            this.loading = false;
        }

        // Lista de tags
        this.api.getTags()
            .subscribe(res => {
                // Recojo las tags
                res['data'].forEach(data => {
                    this.allTags.push(data.tag);
                });
                this.allTags.sort();
                this.allTags = _sortedUniq(this.allTags);
            });
    }

    /*
      Submit del formulario
   */
    onSubmit() {
        const result = this.prepareDataForKong(this.form.value);
        if (!this.editMode) {
            // llamo al API
            this.api.postNewConsumer(result).subscribe(value => {
                this.toast.success('text.id_extra', 'success.new_consumer', {msgExtra: value['id']});
                this.dialogRef.close(true);
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
        }
        // Si venía es que es edición
        else {
            this.api.patchConsumer(this.consumerIdEdit, result).subscribe(value => {
                this.toast.success('text.id_extra', 'success.update_consumer', {msgExtra: value['id']});
                this.dialogRef.close(true);
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
        }
        this.dialogRef.close(this.prepareDataForKong(this.form.value));
    }

    /*
        Gestión de tags
     */
    addTag(event: MatChipInputEvent): void {
        const input = event.input;
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

    /*
        Preparo los datos para enviarlos a KONG
     */
    prepareDataForKong(body) {
        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
        }

        if (body.username === null || body.username === '') {
            delete body.username;
        }

        if (body.custom_id === null || body.custom_id === '') {
            delete body.custom_id;
        }

        return body;
    }

    /*
        Preparo los datos
     */
    prepareDataForForm(consumer) {
        delete consumer['id'];
        delete consumer['created_at'];
        delete consumer['updated_at'];

        // Cambios especiales para representarlos en el formulario
        this.currentTags = consumer['tags'] || [];
        consumer['tags'] = [];

        return consumer;
    }
}


/*
    Validación final del formulario
 */
function FinalFormValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors => {
        let valid = true;

        if (_isEmpty(fg.get('username').value) && _isEmpty(fg.get('custom_id').value)) {
            valid = false;
        }

        return valid ? null : {finalValidation: true};
    };
}
