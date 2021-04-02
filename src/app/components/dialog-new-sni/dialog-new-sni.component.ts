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
    selector: 'app-dialog-new-sni',
    templateUrl: './dialog-new-sni.component.html',
    styleUrls: ['./dialog-new-sni.component.scss']
})
export class DialogNewSniComponent implements OnInit {
    formValid = false;
    editMode = false;
    currentTags = [];
    allTags = [];
    certificatesAvailable = [];
    loading = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', [Validators.required]],
        certificate: this.fb.group({
            id: ['', [Validators.required]]
        }),
        tags: ['']
    });

    constructor(@Inject(MAT_DIALOG_DATA) public sniIdEdit: any, private fb: FormBuilder, public dialogRef: MatDialogRef<DialogNewSniComponent>,
                private api: ApiService, private toast: ToastService) { }

    get nameField() { return this.form.get('name'); }

    get certificateField() { return this.form.get('certificate.id'); }

    ngOnInit(): void {
        this.api.getCertificates()
            .subscribe(certs => {
                for (let cert of certs['data']) {
                    this.certificatesAvailable.push(cert.id);
                }
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });

        // Si viene un servicio para editar
        if (this.sniIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getSni(this.sniIdEdit)
                .subscribe(route => {
                    // Relleno el formuarlio
                    this.form.setValue(this.prepareDataForForm(route));
                }, error => {
                    this.toast.error_general(error);
                });
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
            this.api.postNewSni(result).subscribe(value => {
                this.toast.success('text.id_extra', 'success.new_sni', {msgExtra: value['id']});
                this.dialogRef.close(true);
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
        }
        // Si venía es que es edición
        else {
            this.api.patchSni(this.sniIdEdit, result).subscribe(value => {
                this.toast.success('text.id_extra', 'success.update_sni', {msgExtra: value['id']});
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
    prepareDataForForm(sni) {
        delete sni['id'];
        delete sni['created_at'];
        delete sni['updated_at'];

        // Cambios especiales para representarlos en el formulario
        this.currentTags = sni['tags'] || [];
        sni['tags'] = [];

        return sni;
    }
}
