import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {sortedUniq as _sortedUniq} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../../services/api.service';
import {DialogHelperService} from '../../../services/dialog-helper.service';
import {ToastService} from '../../../services/toast.service';
import {Observable, startWith} from "rxjs";
import {FormControl} from "@angular/forms";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {map} from "rxjs/operators";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

@AutoUnsubscribe()
@Component({
    selector: 'app-access-jwt',
    templateUrl: './access-jwt.component.html',
    styleUrls: ['./access-jwt.component.scss']
})
export class AccessJwtComponent implements OnInit, OnDestroy {

    displayedColumns: string[] = ['id', 'key', 'algorithm', 'rsa_public_key', 'secret', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    // current table data
    data = [];
    // api offset of the next data
    nextData = null;
    loading = false;
    // tag search input
    search = [];
    searchAnd = true;
    // currently searching this
    currentSearch = '';
    // current content of the table filter input
    input = '';
    // table filter input
    filter = '';
    consumers = {};

    allTags = [];
    currentTags = [];
    filteredTags: Observable<string[]>;
    tagCtrl = new FormControl('');

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(private api: ApiService, private toast: ToastService, private route: Router, private dialogHelper: DialogHelperService,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.loading = true;
        this.getJwtTokens();
        this.getConsumers();

        // Lista de tags
        this.api.getTags()
            .subscribe((res) => {
                // Recojo las tags
                res['data'].forEach(data => {
                    this.allTags.push(data.tag);
                });
                this.allTags.sort();
                this.allTags = _sortedUniq(this.allTags);

                this.filteredTags = this.tagCtrl.valueChanges.pipe(
                    startWith(null),
                    map((tag: string | null) => (tag ? this._filter(tag) : this._filter(''))),
                );
            });
    }

    ngOnDestroy(): void {
    }

    /**
     * Starts a new clean the table data
     */
    newSearch() {
        // Table data and offset
        this.nextData = null;
        this.data = [];

        // Search string and tag filter
        this.search = this.currentTags;
        this.currentSearch = this.searchAnd ? this.search.join(' AND ') : this.search.join(' OR ');
        this.loadData(true);
    }

    /**
     * Recarga los datos de consumidores
     */
    loadData(cleanFilter = false, loadAll = false) {
        this.loading = true;
        if (cleanFilter) {
            this.filter = '';
        }

        this.getJwtTokens(loadAll);
    }

    /**
     * Muestra u oculta la api key
     * @param key Clave
     * @param show Mostrar u ocultar
     */
    showKey(key, show) {
        if (key === null) {
            return '';
        }

        if (!show) {
            key = key.substring(0, 5).padEnd(key.length, '*');
        }
        return key;
    }

    /**
     * Obtiene las API key
     */
    getJwtTokens(loadAll = false) {
        this.api.getJwtTokens(1000, this.nextData, this.search, this.searchAnd)
            .subscribe({
                next: (value) => {
                    this.data = this.data.concat(value['data']);

                    // is there more data?
                    if (value['offset'] !== null && value['offset'] !== undefined) {
                        this.nextData = value['offset'];
                    } else {
                        this.nextData = null;
                    }

                    this.dataSource = new MatTableDataSource(this.data);
                    this.dataSource.paginator = this.paginator;
                    // Accessor para poder ordenar por la columna consumer, cuyo campo para ordenar está anidado
                    // por defecto no ordena en campos anidados
                    this.dataSource.sortingDataAccessor = (item, property) => {
                        switch (property) {
                            case 'consumer':
                                return item.consumer.id;
                            default:
                                return item[property];
                        }
                    };
                    this.dataSource.sort = this.sort;
                },
                error: () => this.toast.error('error.node_connection'),
                complete: () => {
                    // load all till the end?
                    if (loadAll && this.nextData !== null) {
                        this.getJwtTokens(true);
                    } else {
                        this.loading = false;
                        this.applyFilter();
                    }
                }
            });
    }

    /**
     * Obtiene la información del nodo
     */
    getConsumers(offset = null) {
        this.api.getConsumers(1000, offset)
            .subscribe({
                next: (res) => {
                    // Recojo los consumidores
                    res['data'].forEach(consumer => {
                        this.consumers[consumer.id] = consumer.username;
                    });

                    if (res['offset'] && res['offset'] !== null) {
                        this.getConsumers(res['offset']);
                    }
                },
                error: () => this.toast.error('error.node_connection')
            });
    }

    /**
     * Aplica los filtros en los datos de la tabla
     */
    applyFilter() {
        const filterValue = this.filter;
        this.input = this.filter;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    /**
     * Borra el elemento seleccionado
     * @param select Elemento a borrar
     */
    delete(select) {
        this.dialogHelper.deleteElement({
            id: select.id,
            consumerId: select.consumer.id,
            name: this.showKey(select.key, false) + ' [' + this.translate.instant('text.consumer') + ' ' + this.consumers[select.consumer.id] + ']'
        }, 'jwt')
            .then(() => {
                this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
            })
            .catch(error => {
            });
    }

    /**
     * Change the tag search mode from AND to OR
     */
    changeSearchAnd() {
        this.searchAnd = !this.searchAnd;
    }

    /**
     * Get the current paginator size
     */
    getPaginatorLength() {
        return this.paginator !== undefined ? this.paginator.pageSize : 0;
    }

    /**
     * Add a tag to the selector
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
            this.tagCtrl.setValue(null);
        }
    }

    /**
     * Removes a tag from the selector
     */
    removeTag(tag: string): void {
        const index = this.currentTags.indexOf(tag);
        if (index >= 0) {
            this.currentTags.splice(index, 1);
            this.tagCtrl.setValue(null);
        }
    }

    /**
     * When a tag is selected from the dropdown
     */
    selectedTag($event: MatAutocompleteSelectedEvent) {
        this.currentTags.push($event.option.viewValue);
        this.tagCtrl.setValue(null);
    }

    /**
     * Filter the tags dropdown
     */
    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allTags.filter(tag => {
            return tag === '' || (tag.toLowerCase().includes(filterValue) && !this.currentTags.includes(tag.toLowerCase()));
        });
    }
}

