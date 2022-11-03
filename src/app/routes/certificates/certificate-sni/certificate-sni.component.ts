import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from '../../../services/api.service';
import { DialogHelperService } from '../../../services/dialog-helper.service';
import { ToastService } from '../../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-certificate-sni',
    templateUrl: './certificate-sni.component.html',
    styleUrls: ['./certificate-sni.component.scss']
})
export class CertificateSniComponent implements OnInit, OnDestroy, AfterViewInit {
    displayedColumns: string[] = ['id', 'name', 'certificate', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data;
    snis;
    loading = false;
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
        this.api.getServices()
            .subscribe({
                next: (ss) => {
                    this.snis = ss['data'];
                    this.getSnis();
                },
                error: () => this.toast.error('error.node_connection'),
                complete: () => this.loading = false
            });
    }

    reloadData(cleanFilter = false) {
        this.loading = true;
        if (cleanFilter) {
            this.filter = '';
        }

        this.getSnis();
    }

    getSnis() {
        this.api.getSnis()
            .subscribe({
                next: (value) => {
                    this.dataSource = new MatTableDataSource(value['data']);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                },
                error: () => this.toast.error('error.node_connection'),
                complete: () => {
                    this.loading = false;
                    this.applyFilter();
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

    /*
        Añade un elemento nuevo
     */
    addEditSni(selected = null) {
        this.dialogHelper.addEdit(selected, 'sni')
            .then(() => {
                if (selected) {
                    // Edición
                    this.reloadData();
                } else {
                    // Creación
                    this.reloadData(true);
                }
            })
            .catch(() => {});
    }

    /*
        Borra el elemento seleccionado
     */
    delete(select) {
        this.dialogHelper.deleteElement(select, 'sni')
            .then(() => { this.reloadData(); })
            .catch(() => {});
    }
}
