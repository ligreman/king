import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Utils } from '../../../shared/utils';

@Component({
    selector: 'app-plugin-form-fields',
    templateUrl: './plugin-form-fields.component.html',
    styleUrls: ['./plugin-form-fields.component.scss']
})
export class PluginFormFieldsComponent implements OnInit, OnChanges {
    @Input() fields;
    @Input() group;
    @Input() currentGroup;
    @Input() parentForm;
    @Input() plugin;
    count = {};
    arrayRecordsFields = {};
    arrayRecordsValuesList = {};
    arrayRecordsValuesString = {};

    constructor() { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Here we already have the value of this.fields
        if (changes.fields && this.fields) {
            // Initialize arrayRecordsValues with each field type array_records
            this.fields.forEach(field => {
                if (field.type === 'array_records') {
                    this.arrayRecordsFields[field.field] = {};

                    setTimeout(() => {
                        // Si viene un valor de inicio, relleno las variables
                        const id = this.getIdArray(field.field);
                        const value = this.getField(field.field).value;
                        let output = [];
                        value.forEach(fv => {
                            let aux = '';
                            try {
                                aux = JSON.stringify(fv);
                            } catch (e) {
                                aux = fv;
                                console.error(e);
                            }
                            output.push(aux);
                        });

                        this.arrayRecordsValuesString[field.field] = output.join('\n');
                        this.arrayRecordsValuesList[field.field] = output;
                    }, 0);
                }
            });
        }
    }

    getGroup() {
        return this.parentForm.get(this.group);
    }

    getIdArray(string) {
        return '' + Utils.calculateHash(string);
    }

    getField(field) {
        return this.parentForm.get(this.group + '.' + field);
    }

    isPassword(label) {
        return label.toLowerCase().includes('password');
    }

    formatText(txt) {
        return txt.replace(/_/g, ' ');
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

    addToArrayRecord(fieldName: string) {
        // Primero he de sincronizar las variables con el valor actual del textarea
        if (!this.arrayRecordsValuesString[fieldName]) {
            this.arrayRecordsValuesString[fieldName] = '';
        }
        this.arrayRecordsValuesList[fieldName] = this.arrayRecordsValuesString[fieldName].split('\n');

        // paso strings a arrays de strings
        this.fields.forEach(f => {
            if (f.child_fields) {
                f.child_fields.forEach(fch => {
                    // If child is an array
                    if (fch.type === 'array') {
                        let fchVal = this.arrayRecordsFields[f.field][fch.name];
                        // If value is not empty convert it to array of strings
                        if (fchVal !== undefined && fchVal !== null && fchVal !== '') {
                            fchVal = fchVal.replace(', ', ',');
                            fchVal = fchVal.replace(' ,', ',');
                            this.arrayRecordsFields[f.field][fch.name] = fchVal.split(',');
                        }
                    }
                });
            }
        });

        const ordered = Object.keys(this.arrayRecordsFields[fieldName]).sort().reduce(
            (obj, key) => {
                obj[key] = this.arrayRecordsFields[fieldName][key];
                return obj;
            }, {});

        this.arrayRecordsValuesList[fieldName].push(JSON.stringify(ordered));
        this.arrayRecordsValuesString[fieldName] = this.arrayRecordsValuesList[fieldName].join('\n');
        // Limpio
        this.arrayRecordsFields[fieldName] = {};
    }

    cleanArrayRecords(fieldName) {
        this.arrayRecordsValuesString[fieldName] = '';
        this.arrayRecordsValuesList[fieldName] = [];
    }

    createDocLink(plugin: string): string {
        let url = 'https://docs.konghq.com/hub/kong-inc/' + plugin;

        if (plugin === 'proxy-cache-redis') {
            url = 'https://github.com/ligreman/kong-proxy-cache-redis-plugin/blob/master/README.md';
        }

        if (plugin === 'proxy-cache-redis-cluster') {
            url = 'https://github.com/ligreman/kong-proxy-cache-redis-cluster-plugin/blob/main/README.md';
        }

        return url;
    }
}
