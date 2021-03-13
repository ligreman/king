import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { DialogHelperService } from '../../../services/dialog-helper.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-access-acls',
    templateUrl: './access-acls.component.html',
    styleUrls: ['./access-acls.component.scss']
})
export class AccessAclsComponent implements OnInit {
    displayedColumns: string[] = ['id', 'group', 'consumer', 'created_at', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data;
    loading = false;
    filter = '';
    consumers = {};

    constructor(private api: ApiService, private toast: ToastService, private route: Router, private dialogHelper: DialogHelperService) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.loading = true;
        this.getAcls();
        this.getConsumers();
    }

    /**
     * Recarga los datos de consumidores
     */
    reloadData() {
        this.loading = true;
        this.filter = '';

        this.getAcls();
        this.getConsumers();
    }

    /**
     * Obtiene los acl
     */
    getAcls() {
        this.api.getAcls()
            .subscribe(value => {
                    this.dataSource = new MatTableDataSource(value['data']);
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                },
                error => {
                    this.toast.error('error.node_connection');
                }, () => {
                    this.loading = false;
                });
    }

    /**
     * Obtiene la información del nodo
     */
    getConsumers() {
        this.api.getConsumers()
            .subscribe(res => {
                // Recojo los consumidores
                res['data'].forEach(consumer => {
                    this.consumers[consumer.id] = consumer.username;
                });
            }, error => {
                this.toast.error('error.node_connection');
            });
    }

    /**
     * Aplica los filtros en los datos de la tabla
     */
    applyFilter() {
        const filterValue = this.filter;
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
        this.dialogHelper.deleteElement({id: select.id, consumer: select.consumer.id, name: select.group + ' -> ' + this.consumers[select.consumer.id]}, 'acl')
            .then(() => { this.reloadData(); })
            .catch(error => {});
    }

}
