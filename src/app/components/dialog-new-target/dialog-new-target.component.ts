import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { sortedUniq as _sortedUniq } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../../shared/custom-validators';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-new-target',
    templateUrl: './dialog-new-target.component.html',
    styleUrls: ['./dialog-new-target.component.scss']
})
export class DialogNewTargetComponent implements OnInit, OnDestroy {
    formValid = false;
    currentTags = [];
    allTags = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        target: ['', [Validators.required, CustomValidators.isHost()]],
        weight: [10000, [CustomValidators.isNumber(), Validators.min(0), Validators.max(65536)]],
        port: [8080, [Validators.required, CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]],
        tags: ['']
    });

    constructor(@Inject(MAT_DIALOG_DATA) public upstreamId: any, private fb: FormBuilder, public dialogRef: MatDialogRef<DialogNewTargetComponent>,
                private api: ApiService, private toast: ToastService) { }

    get targetField() { return this.form.get('target'); }

    get portField() { return this.form.get('port'); }

    get weightField() { return this.form.get('weight'); }

    ngOnInit(): void {
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

        // llamo al API
        this.api.postNewTarget(result, this.upstreamId)
            .subscribe({
                next: (value) => {
                    this.toast.success('text.id_extra', 'success.new_target', {msgExtra: value['id']});
                    this.dialogRef.close(true);
                },
                error: (error) => this.toast.error_general(error, {disableTimeOut: true})
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

    /*
        Preparo los datos para enviarlos a KONG
     */
    prepareDataForKong(body) {
        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
        }

        // Concateno el puerto
        body.target = body.target + ':' + body.port;
        delete body.port;

        return body;
    }

}
