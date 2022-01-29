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
    selector: 'app-element-service',
    templateUrl: './element-service.component.html',
    styleUrls: ['./element-service.component.scss']
})
export class ElementServiceComponent implements OnInit, OnDestroy, AfterViewInit {
    displayedColumns: string[] = ['id', 'name', 'protocol', 'host', 'port', 'path', 'ssl', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data;
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
        this.reloadData();
    }

    reloadData() {
        this.loading = true;
        this.filter = '';

        this.api.getServices()
            .subscribe({
                next: (value) => {
                    this.dataSource = new MatTableDataSource(value['data']);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                },
                error: () => this.toast.error('error.node_connection'),
                complete: () => this.loading = false
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
        Añade un servicio nuevo
     */
    addEdit(selected = null) {
        this.dialogHelper.addEdit(selected, 'service')
            .then(() => { this.reloadData(); })
            .catch(() => {});
    }

    /*
        Muestra la info del elemento seleccionado
     */
    showInfo(select) {
        this.dialogHelper.showInfoElement(select, 'service');
    }

    /*
        Borra el elemento seleccionado
     */
    delete(select) {
        this.dialogHelper.deleteElement(select, 'service')
            .then(() => { this.reloadData(); })
            .catch(() => {});
    }
}
