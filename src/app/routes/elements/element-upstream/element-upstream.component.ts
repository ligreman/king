import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {firstValueFrom, Observable, startWith} from 'rxjs';
import {sortedUniq as _sortedUniq} from 'lodash';
import {ApiService} from '../../../services/api.service';
import {DialogHelperService} from '../../../services/dialog-helper.service';
import {ToastService} from '../../../services/toast.service';
import {AutoUnsubscribe} from "ngx-auto-unsubscribe";
import {FormControl} from "@angular/forms";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {map} from "rxjs/operators";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";

@AutoUnsubscribe()
@Component({
    selector: 'app-element-upstream',
    templateUrl: './element-upstream.component.html',
    styleUrls: ['./element-upstream.component.scss']
})
export class ElementUpstreamComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['name', 'algorithm', 'hash_on', 'hash_fallback', 'health', 'tags', 'actions'];
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

    allTags = [];
    currentTags = [];
    filteredTags: Observable<string[]>;
    tagCtrl = new FormControl('');

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    healths = {};

    constructor(private api: ApiService, private toast: ToastService, private dialogHelper: DialogHelperService) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.loading = true;
    }

    ngOnDestroy(): void {
    }

    ngAfterViewInit() {
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

    loadData(cleanFilter = false, loadAll = false) {
        this.loading = true;
        if (cleanFilter) {
            this.filter = '';
        }

        this.getUpstreams(loadAll);
    }

    getUpstreams(loadAll = false) {
        this.api.getUpstreams(1000, this.nextData, this.search, this.searchAnd)
            .subscribe({
                next: async (value) => {
                    // is there more data?
                    if (value['offset'] !== null && value['offset'] !== undefined) {
                        this.nextData = value['offset'];
                    } else {
                        this.nextData = null;
                    }

                    let otherData = await this.getHealthData(value);
                    this.data = this.data.concat(otherData['data']);

                    this.dataSource = new MatTableDataSource(this.data);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;

                    value=null;
                    otherData=null;

                    if (loadAll && this.nextData !== null) {
                        this.getUpstreams(true);
                    } else {
                        this.loading = false;
                        this.applyFilter();
                    }
                },
                error: () => {
                    this.toast.error('error.node_connection')
                    this.loading = false;
                }
            });
    }

    /*
        Completa los datos de upstreams
     */
    async getHealthData(upstreams) {
        for (const [idx, up] of upstreams['data'].entries()) {
            let h;
            try {
                h = await firstValueFrom(this.api.getUpstreamHealth(up['id']));
                upstreams['data'][idx]['health'] = h['data']['health'];
            } catch (err) {
                this.toast.error('error.get_data');
            } finally {
                if (!h['data'] || !h['data'].health) {
                    upstreams['data'][idx]['health'] = 'UNKNOWN';
                }
            }

            const t = await this.api.getAllTargets(up['id']);
            upstreams['data'][idx]['targets'] = t['data'];
        }

        return upstreams;
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
        Añade un servicio nuevo
     */
    addEdit(selected = null) {
        this.dialogHelper.addEdit(selected, 'upstream')
            .then(() => {
                if (selected) {
                    // Edición
                    this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
                } else {
                    // Creación
                    this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
                }
            })
            .catch(() => {});
    }

    /*
        Muestra la info del elemento seleccionado
     */
    showInfo(select) {
        this.dialogHelper.showInfoElement(select, 'upstream');
    }

    /*
        Borra el elemento seleccionado
     */
    delete(select) {
        this.dialogHelper.deleteElement(select, 'upstream')
            .then(() => {
                this.toast.info('element.need_to_reload', '', {timeOut: 8000, extendedTimeOut: 15000});
                            })
            .catch(() => {});
    }

    /*
        Muestra la información del Target
     */
    showTarget(target) {
        target['data'] = {upstream: target['upstream']};
        this.dialogHelper.showInfoElement(target, 'target');
    }

    /*
        Borra el target
     */
    deleteTarget(target, event) {
        event.stopPropagation();

        this.dialogHelper.deleteElement(target, 'target')
            .then(() => { this.loadData(); })
            .catch(() => {});
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
