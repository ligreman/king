import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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

    ngOnInit(): void {
        this.api.getCertificates()
            .subscribe(certs => {
                for (let cert of certs['data']) {
                    this.certificatesAvailable.push(cert.id);
                }
                this.loading = false;
            }, error => {
                this.toast.error_general(error);
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

    get nameField() { return this.form.get('name'); }

    get certificateField() { return this.form.get('certificate.id'); }
}
