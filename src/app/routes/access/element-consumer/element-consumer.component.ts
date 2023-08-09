import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../../services/api.service';
import {sortedUniq as _sortedUniq} from 'lodash';
import {DialogHelperService} from '../../../services/dialog-helper.service';
import {ToastService} from '../../../services/toast.service';
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {Observable, startWith} from "rxjs";
import {FormControl} from "@angular/forms";
import {map} from "rxjs/operators";

@AutoUnsubscribe()
@Component({
    selector: 'app-element-consumer',
    templateUrl: './element-consumer.component.html',
    styleUrls: ['./element-consumer.component.scss']
})
export class ElementConsumerComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['id', 'username', 'custom_id', 'tags', 'credentials', 'actions'];
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
    enabledPlugins = [];

    allTags = [];
    currentTags = [];
    filteredTags: Observable<string[]>;
    tagCtrl = new FormControl('');

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(private api: ApiService, private toast: ToastService, private dialogHelper: DialogHelperService) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.loading = true;
        this.getConsumers();
        this.getNodeInformation();

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
                    map((tag: string | null) => (tag ? this._filter(tag) : this.allTags.slice())),
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

        this.getConsumers(loadAll);
    }

    /**
     * Obtiene los consumidores
     */
    getConsumers(loadAll = false) {
        this.api.getConsumers(1000, this.nextData, this.search, this.searchAnd)
            .subscribe({
                next: (value) => {
                    this.data = this.data.concat(value['data']);

                    // is there more data?
                    if (value['offset'] !== null && value['offset'] !== undefined) {
                        this.nextData = value['offset'];
                    } else {
                        this.nextData = null;
                    }

                    // update the table with the new data loaded
                    this.dataSource = new MatTableDataSource(this.data);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                },
                error: () => this.toast.error('error.node_connection'),
                complete: () => {
                    // load all till the end?
                    if (loadAll && this.nextData !== null) {
                        this.getConsumers(true);
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
    getNodeInformation() {
        this.api.getNodeInformation()
            .subscribe({
                next: (res) => {
                    // Recojo los plugins activos para habilitar las secciones
                    this.enabledPlugins = res['plugins']['enabled_in_cluster'];
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
     * Añade un elemento nuevo
     * @param selected Elemento a editar, o null si es nuevo
     */
    addEditConsumer(selected = null) {
        this.dialogHelper.addEdit(selected, 'consumer')
            .then(() => {
                this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
            })
            .catch(error => {
            });
    }

    /**
     * Borra el elemento seleccionado
     * @param select Elemento a borrar
     */
    delete(select) {
        this.dialogHelper.deleteElement(select, 'consumer')
            .then(() => {
                this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
            })
            .catch(error => {
            });
    }

    /**
     * Muestra la info ACL del elemento seleccionado
     * @param select Elemento a ver su info
     */
    infoAcls(select) {
        this.dialogHelper.showInfoElement(select, 'acl');
    }

    /**
     * Muestra la info de Basic Auth del elemento seleccionado
     * @param select Elemento a ver su info
     */
    infoBasicAuth(select) {
        this.dialogHelper.showInfoElement(select, 'basic');
    }

    /**
     * Muestra la info API keys del elemento seleccionado
     * @param select Elemento a ver su info
     */
    infoApiKeys(select) {
        this.dialogHelper.showInfoElement(select, 'key');
    }

    /**
     * Muestra la info JWT Tokens del elemento seleccionado
     * @param select Elemento a ver su info
     */
    infoJwtTokens(select) {
        this.dialogHelper.showInfoElement(select, 'jwt');
    }

    /**
     * Muestra la info de OAuth 2.0 Applications
     * @param select Elemento a ver su info
     */
    infoOAuthApps(select) {
        this.dialogHelper.showInfoElement(select, 'oauth2');
    }


    /**
     * Comprueba que un plugin esté activo
     * @param plugin Nombre del plugin
     */
    isPluginActive(plugin) {
        return this.enabledPlugins.includes(plugin);
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
        return this.allTags.filter(tag => tag.toLowerCase().includes(filterValue));
    }
}
