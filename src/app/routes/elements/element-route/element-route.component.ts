import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { find as _find } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from '../../../services/api.service';
import { DialogHelperService } from '../../../services/dialog-helper.service';
import { ToastService } from '../../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-element-route',
    templateUrl: './element-route.component.html',
    styleUrls: ['./element-route.component.scss']
})
export class ElementRouteComponent implements OnInit, OnDestroy, AfterViewInit {
    displayedColumns: string[] = ['id', 'name', 'service', 'protocols', 'methods', 'hosts', 'paths', 'headers', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data;
    services;
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
                    this.services = ss['data'];
                    this.getRoutes();
                },
                error: () => this.toast.error('error.node_connection'),
                complete: () => this.loading = false
            });
    }

    reloadData() {
        this.loading = true;
        this.filter = '';

        this.getRoutes();
    }

    getRoutes() {
        this.api.getRoutes()
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
        this.dialogHelper.addEdit(selected, 'route')
            .then(() => { this.reloadData(); })
            .catch(() => {});
    }

    /*
        Muestra la info del elemento seleccionado
     */
    showInfo(select) {
        this.dialogHelper.showInfoElement(select, 'route');
    }

    /*
        Borra el elemento seleccionado
     */
    delete(select) {
        this.dialogHelper.deleteElement(select, 'route')
            .then(() => { this.reloadData(); })
            .catch(() => {});
    }

    /*
        Busco el nombre entre la lista de servicios
     */
    getServiceName(id) {
        const service = _find(this.services, {'id': id});
        return service.name;
    }

    getJSON(txt) {
        if (txt === null) {
            return '';
        }

        let res = [];
        const d = Object.getOwnPropertyNames(txt);

        for (const i of d) {
            res.push(i.toUpperCase() + ': ' + txt[i]);
        }

        return res.join('\n');
    }
}
