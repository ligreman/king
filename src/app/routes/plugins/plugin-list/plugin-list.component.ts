import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {sortedUniq as _sortedUniq} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {forkJoin, Observable, startWith} from 'rxjs';
import {map} from 'rxjs/operators';
import {DialogConfirmComponent} from '../../../components/dialog-confirm/dialog-confirm.component';
import {ApiService} from '../../../services/api.service';
import {DialogHelperService} from '../../../services/dialog-helper.service';
import {ToastService} from '../../../services/toast.service';
import {FormControl} from "@angular/forms";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

@AutoUnsubscribe()
@Component({
    selector: 'app-plugin-list',
    templateUrl: './plugin-list.component.html',
    styleUrls: ['./plugin-list.component.scss'],
    standalone: false
})
export class PluginListComponent implements OnInit, OnDestroy, AfterViewInit {
    displayedColumns: string[] = ['enabled', 'name', 'route', 'service', 'consumer', 'protocols', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    services = {};
    routes = {};
    consumers = {};

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

    allTags = [];
    currentTags = [];
    filteredTags: Observable<string[]>;
    tagCtrl = new FormControl('');

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(private api: ApiService, private toast: ToastService, private dialogHelper: DialogHelperService, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.loading = true;
    }

    ngOnDestroy(): void {
    }

    ngAfterViewInit() {
        this.getOtherData()
            .subscribe({
                next: (value) => {
                    value['services'].forEach(serv => {
                        this.services[serv.id] = serv.name;
                    });
                    value['routes'].forEach(route => {
                        this.routes[route.id] = route.name;
                    });
                    value['consumers'].forEach(consumer => {
                        this.consumers[consumer.id] = consumer.username;
                    });
                },
                error: (err)=>this.toast.error('error.node_connection'),
                complete: () => this.loadData()
            });

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

    loadData(cleanFilter: boolean = false, loadAll = false) {
        this.loading = true;
        if (cleanFilter) {
            this.filter = '';
        }

        this.getPlugins(loadAll);
    }

    getPlugins(loadAll = false) {
        this.api.getPlugins(1000, this.nextData, this.search, this.searchAnd)
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
                    this.dataSource.sort = this.sort;
                },
                error: () => this.toast.error('error.node_connection'),
                complete: () => {
                    // load all till the end?
                    if (loadAll && this.nextData !== null) {
                        this.getPlugins(true);
                    } else {
                        this.loading = false;
                        this.applyFilter();
                    }
                }
            });
    }

    getOtherData() {
        return forkJoin([
            this.api.getAllServices(null, [], ['id', 'name']),
            this.api.getAllRoutes(null, [], ['id', 'name']),
            this.api.getAllConsumers(null, [], ['id', 'username'])
        ]).pipe(map<any, any>(([services, routes, consumers]) => {
            return {services: services['data'], routes: routes['data'], consumers: consumers['data']};
        }));
    }

    applyFilter() {
        const filterValue = this.filter;
        this.input = this.filter;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    /*
        Añade un elemento nuevo
     */
    addEditPlugin(selected = null) {
        this.dialogHelper.addEdit(selected, 'plugin')
            .then(() => {
                if (selected) {
                    // Edición
                    this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
                } else {
                    // Creación
                    this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
                }
            })
            .catch(() => {
            });
    }

    /*
        Muestra la info del elemento seleccionado
     */
    showInfo(select) {
        this.dialogHelper.showInfoElement(select, 'plugin');
    }

    /*
        Borra el elemento seleccionado
     */
    delete(select) {
        this.dialogHelper.deleteElement(select, 'plugin')
            .then(() => {
                this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
            })
            .catch(() => {
            });
    }

    /*
        Cambia el estado del plugin
     */
    changeEnabled(row) {
        let txt = 'disable';
        if (row.enabled) {
            txt = 'enable';
        }

        let opt = {
            data: {
                title: 'dialog.confirm.' + txt + '_plugin_title',
                content: 'dialog.confirm.' + txt + '_plugin',
                name: row.name,
                id: row.id,
                delete: false
            }
        };

        const dialogRef = this.dialog.open(DialogConfirmComponent, opt);
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'true') {
                this.api.enablePlugin(row.id, row.enabled)
                    .subscribe({
                        next: () => {
                            if (row.enabled) {
                                this.toast.success('success.enabled_plugin', '', {msgExtra: row.name});
                            } else {
                                this.toast.success('success.disabled_plugin', '', {msgExtra: row.name});
                            }
                            this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
                        },
                        error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                    });
            } else {
                row.enabled = !row.enabled;
            }
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

    scrollTo(element) {
        element.scrollIntoView();
    }
}
