import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-plugin-form-fields',
    templateUrl: './plugin-form-fields.component.html',
    styleUrls: ['./plugin-form-fields.component.scss']
})
export class PluginFormFieldsComponent implements OnInit {
    @Input() fields;
    @Input() group;
    @Input() currentGroup;
    @Input() parentForm;
    @Input() plugin;
    count = {};

    constructor() { }

    ngOnInit(): void {
    }

    getGroup() {
        return this.parentForm.get(this.group);
    }

    getField(field) {
        return this.parentForm.get(this.group + '.' + field);
    }

    formatText(txt) {
        return txt.replace('/_/g', ' ');
    }

    arrayNum(n: number): any[] {
        return Array(n);
    }

    addCount(s: string) {
        if (!this.count[s]) {
            this.count[s] = 1;
        }
        this.count[s]++;
    }

    getCount(s: string) {
        if (!this.count[s]) {
            this.count[s] = 1;
        }
        return this.count[s];
    }
}
