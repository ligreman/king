import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sortedUniq as _sortedUniq } from 'lodash';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';


@Component({
    selector: 'app-dialog-new-cert',
    templateUrl: './dialog-new-cert.component.html',
    styleUrls: ['./dialog-new-cert.component.scss']
})
export class DialogNewCertComponent implements OnInit {
    formValid = false;
    editMode = false;
    loading = true;
    currentTags = [];
    allTags = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    form = this.fb.group({
        cert: ['', [Validators.required, Validators.pattern(/^(-----BEGIN CERTIFICATE-----)([\r\n]|.)*(-----END CERTIFICATE-----)([\r\n])?$/)]],
        key: ['', [Validators.required, Validators.pattern(/^(-----BEGIN RSA PRIVATE KEY-----)([\r\n]|.)*(-----END RSA PRIVATE KEY-----)([\r\n])?$/)]],
        tags: ['']
    });

    constructor(@Inject(MAT_DIALOG_DATA) public certIdEdit: any, private fb: FormBuilder, public dialogRef: MatDialogRef<DialogNewCertComponent>,
                private api: ApiService, private toast: ToastService) { }

    get certField() { return this.form.get('cert'); }

    get keyField() { return this.form.get('key'); }

    ngOnInit(): void {
        // Si viene  para editar
        if (this.certIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getCertificate(this.certIdEdit)
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
            this.api.postNewCertificate(result).subscribe(value => {
                this.toast.success('text.id_extra', 'success.new_cert', {msgExtra: value['id']});
                this.dialogRef.close(true);
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
        }
        // Si venía es que es edición
        else {
            this.api.patchCertificate(this.certIdEdit, result).subscribe(value => {
                this.toast.success('text.id_extra', 'success.update_cert', {msgExtra: value['id']});
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

    /*
        Preparo los datos para enviarlos a KONG
     */
    prepareDataForKong(body) {
        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
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
        delete cert['snis'];

        // Cambios especiales para representarlos en el formulario
        this.currentTags = cert['tags'] || [];
        cert['tags'] = [];

        return cert;
    }
}
