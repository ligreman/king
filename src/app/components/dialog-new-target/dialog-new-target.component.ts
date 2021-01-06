import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomValidators } from '../../shared/custom-validators';

@Component({
    selector: 'app-dialog-new-target',
    templateUrl: './dialog-new-target.component.html',
    styleUrls: ['./dialog-new-target.component.scss']
})
export class DialogNewTargetComponent implements OnInit {
    formValid = false;
    currentTags = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        target: ['', [Validators.required, CustomValidators.isHost()]],
        weight: [10000, [CustomValidators.isNumber(), Validators.min(0), Validators.max(65536)]],
        tags: ['']
    });

    constructor(@Inject(MAT_DIALOG_DATA) public upstreamId: any, private fb: FormBuilder) { }

    ngOnInit(): void {
    }

    /*
      Submit del formulario
   */
    onSubmit() {
        return this.prepareDataForKong(this.form.value);
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

    prepareDataForKong(body) {
        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
        }

        return body;
    }

    get targetField() { return this.form.get('target'); }

    get weightField() { return this.form.get('weight'); }

}
