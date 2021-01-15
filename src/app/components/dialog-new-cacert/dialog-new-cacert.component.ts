import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../../shared/custom-validators';

@Component({
    selector: 'app-dialog-new-cacert',
    templateUrl: './dialog-new-cacert.component.html',
    styleUrls: ['./dialog-new-cacert.component.scss']
})
export class DialogNewCacertComponent implements OnInit {
    formValid = false;
    editMode = false;
    loading = true;
    currentTags = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        cert: ['', [Validators.required, Validators.pattern(/^(-----BEGIN CERTIFICATE-----)(\r\n|\r|\n|.)*(-----END CERTIFICATE-----)(\r\n|\r|\n)?$/)]],
        cert_digest: ['', [CustomValidators.isSHA256(true)]],
        tags: ['']
    });

    constructor(@Inject(MAT_DIALOG_DATA) public cacertIdEdit: any, private fb: FormBuilder, public dialogRef: MatDialogRef<DialogNewCacertComponent>,
                private api: ApiService, private toast: ToastService) { }

    get certField() { return this.form.get('cert'); }

    get digestField() { return this.form.get('cert_digest'); }

    ngOnInit(): void {
        // Si viene  para editar
        if (this.cacertIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getCACertificate(this.cacertIdEdit)
                .subscribe(cert => {
                    // Relleno el formuarlio
                    this.form.setValue(this.prepareDataForForm(cert));
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
        const result = this.prepareDataForKong(this.form.value);
        if (!this.editMode) {
            // llamo al API
            this.api.postNewCACertificate(result).subscribe(value => {
                this.toast.success('text.id_extra', 'success.new_cacert', {msgExtra: value['id']});
                this.dialogRef.close(true);
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
        }
        // Si venía es que es edición
        else {
            this.api.patchCACertificate(this.cacertIdEdit, result).subscribe(value => {
                this.toast.success('text.id_extra', 'success.update_cacert', {msgExtra: value['id']});
                this.dialogRef.close(true);
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
        }
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

        if (body.cert_digest === null || body.cert_digest === '') {
            delete body.cert_digest;
        }

        return body;
    }

    /*
        Preparo los datos
     */
    prepareDataForForm(cert) {
        delete cert['id'];
        delete cert['created_at'];
        delete cert['updated_at'];

        // Cambios especiales para representarlos en el formulario
        this.currentTags = cert['tags'] || [];
        cert['tags'] = [];

        return cert;
    }
}
