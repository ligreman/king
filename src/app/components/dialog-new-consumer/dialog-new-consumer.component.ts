import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isEmpty as _isEmpty } from 'lodash';
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

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        username: ['', []],
        custom_id: ['', []],
        tags: ['']
    }, {validators: [FinalFormValidator()]});

    constructor(@Inject(MAT_DIALOG_DATA) public consumerId: any, private fb: FormBuilder, public dialogRef: MatDialogRef<DialogNewConsumerComponent>,
                private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        // Si viene  para editar
        if (this.consumerId !== null) {
            this.editMode = true;

            // Rescato la info  del api
            this.api.getConsumer(this.consumerId)
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
    }

    /*
      Submit del formulario
   */
    onSubmit() {
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

    get usernameField() { return this.form.get('username'); }

    get customField() { return this.form.get('custom_id'); }
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
