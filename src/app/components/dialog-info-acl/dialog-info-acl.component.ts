import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {saveAs} from 'file-saver';
import {sortedUniq as _sortedUniq} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {DialogHelperService} from '../../services/dialog-helper.service';
import {ToastService} from '../../services/toast.service';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {FormBuilder} from "@angular/forms";

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-acl',
    templateUrl: './dialog-info-acl.component.html',
    styleUrls: ['./dialog-info-acl.component.scss'],
    standalone: false
})
export class DialogInfoAclComponent implements OnInit, OnDestroy, AfterViewInit {
    acls;
    total_acls: string[] = [];
    filteredAcls: string[] = [];
    loading = true;
    consumerId;
    consumerName;
    currentTags = [];
    allTags = [];

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        group: [''],
        tags: ['']
    });

    constructor(@Inject(MAT_DIALOG_DATA) public consumer: string, private api: ApiService, private toast: ToastService, private fb: FormBuilder,
                private dialogHelper: DialogHelperService, private translate: TranslateService) {
    }

    ngOnInit(): void {
        this.consumerId = this.consumer['id'];
        this.consumerName = this.consumer['username'];
        this.loadData();

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

    ngAfterViewInit(): void {
        this.form.get("group").valueChanges.subscribe(group => {
            // Limpio primero para que se entere de que está cambiando el valor
            this.filteredAcls = [];
            if (group !== '' && group !== null) {
                this.filteredAcls = this._filterAcls(group);
            } else {
                this.filteredAcls = this.total_acls;
            }
        });
    }

    /**
     * Recargo
     */
    loadData() {
        this.loading = true;

        // Recojo los datos del api
        this.api.getConsumerAcls(this.consumerId)
            .subscribe({
                next: (acls) => {
                    this.acls = acls['data'];
                    let yatengo = [];
                    this.acls.forEach(one => {
                        yatengo.push(one.group);
                    });

                    // Recojo también todos los acls existentes para rellenar el autocomplete
                    this.getAcls(null, yatengo);
                },
                error: (error) => this.toast.error_general(error),
                complete: () => this.loading = false
            });
    }


    /**
     * Obtiene los acl
     */
    getAcls(offset = null, yatengo) {
        this.api.getAcls(1000, offset)
            .subscribe({
                next: (res) => {
                    // Recojo los consumidores
                    res['data'].forEach(acl => {
                        // Si es un acl que no tiene ya el consumidor, lo añado al autocomplete
                        if (!yatengo.includes(acl.group)) {
                            this.total_acls.push(acl.group);
                            this.filteredAcls.push(acl.group);
                        }
                    });

                    // Elimino duplicados
                    this.total_acls = [...new Set(this.total_acls)];
                    this.filteredAcls = [...new Set(this.filteredAcls)];
                    // Ordeno
                    this.total_acls.sort();
                    this.filteredAcls.sort();

                    if (res['offset'] && res['offset'] !== null) {
                        this.getAcls(res['offset'], yatengo);
                    } else {
                        this.loading = false
                    }
                },
                error: () => this.toast.error('error.node_connection')
            });
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.acls, null, 2)], {type: 'text/json'});
        saveAs(blob, 'acl.consumer_' + this.consumerName + '.json');
    }

    /**
     * Añade un acl al consumidor
     */
    addAclToConsumer() {
        // Guardo el acl en el consumidor
        this.api.postConsumerAcl(this.consumerId, {group: this.form.controls.group.value, tags: this.currentTags})
            .subscribe({
                next: () => {
                    this.toast.success('text.id_extra', 'success.new_acl', {msgExtra: this.form.controls.group.value});
                    this.loadData();
                    this.form.reset();
                },
                error: (error) => this.toast.error_general(error, {disableTimeOut: true})
            });
    }

    /**
     * Elimina un acl
     * @param acl Acl
     */
    deleteAcl(acl) {
        this.dialogHelper.deleteElement({
            id: acl.id,
            consumerId: this.consumerId,
            name: acl.group + ' [' + this.translate.instant('text.consumer') + ' ' + this.consumerName + ']'
        }, 'acl')
            .then(() => {
                this.loadData();
            })
            .catch(error => {
            });
    }

    private _filterAcls(value) {
        const filterValue = value.toLowerCase();

        return this.total_acls.filter(option => option.toLowerCase().includes(filterValue));
    }

    isDisabled() {
        return this.form.controls.group.value === ''
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
}
