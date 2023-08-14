import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../../services/api.service';
import {DialogHelperService} from '../../../services/dialog-helper.service';
import {ToastService} from '../../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-element-vault',
    templateUrl: './element-vault.component.html',
    styleUrls: ['./element-vault.component.scss']
})
export class ElementVaultComponent implements OnInit, OnDestroy, AfterViewInit {
    displayedColumns: string[] = ['id', 'name', 'prefix', 'description', 'config', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    // current table data
    data = [];
    // api offset of the next data
    nextData = null;
    loading = false;
    // table filter input
    filter = '';

    constructor(private api: ApiService, private toast: ToastService, private route: Router, private dialogHelper: DialogHelperService) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.loading = true;
    }

    ngOnDestroy(): void {
    }

    ngAfterViewInit() {
        this.loadData();
    }

    loadData(cleanFilter = false, loadAll = false, restartSearch = false) {
        this.loading = true;
        if (cleanFilter) {
            this.filter = '';
        }
        if (restartSearch) {
            this.data = [];
        }

        this.api.getVaults(1000, this.nextData)
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
                        this.loadData(false, true, false);
                    } else {
                        this.loading = false;
                        this.applyFilter();
                    }
                }
            });
    }

    applyFilter() {
        const filterValue = this.filter;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    showJson(txt) {
        return JSON.stringify(txt);
    }

    /*
        Añade un elemento nuevo
     */
    addEdit(selected = null) {
        this.dialogHelper.addEdit(selected, 'vault')
            .then(() => {
                if (selected) {
                    // Edición
                    this.loadData(false, true, true);
                } else {
                    // Creación
                    this.loadData(true, true, true);
                }
            })
            .catch(() => {
            });
    }

    /*
        Muestra la info del elemento seleccionado
     */
    showInfo(select) {
        this.dialogHelper.showInfoElement(select, 'vault');
    }

    /*
        Borra el elemento seleccionado
     */
    delete(select) {
        this.dialogHelper.deleteElement(select, 'vault')
            .then(() => {
                this.loadData(false, true, true);
            })
            .catch(() => {
            });
    }

    /**
     * Get the current paginator size
     */
    getPaginatorLength() {
        return this.paginator !== undefined ? this.paginator.pageSize : 0;
    }
}
