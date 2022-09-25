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
    selector: 'app-element-vault',
    templateUrl: './element-vault.component.html',
    styleUrls: ['./element-vault.component.scss']
})
export class ElementVaultComponent implements OnInit, OnDestroy, AfterViewInit {
    displayedColumns: string[] = ['id', 'name', 'prefix', 'description', 'config', 'tags', 'actions'];
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

        this.api.getVaults()
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

    showJson(txt) {
        return JSON.stringify(txt);
    }

    /*
        Añade un elemento nuevo
     */
    addEdit(selected = null) {
        this.dialogHelper.addEdit(selected, 'vault')
            .then(() => { this.reloadData(); })
            .catch(() => {});
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
            .then(() => { this.reloadData(); })
            .catch(() => {});
    }
}
