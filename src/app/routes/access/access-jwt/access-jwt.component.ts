import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from '../../../services/api.service';
import { DialogHelperService } from '../../../services/dialog-helper.service';
import { ToastService } from '../../../services/toast.service';

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

    data;
    loading = false;
    filter = '';
    consumers = {};
    timeNow = DateTime.now();

    constructor(private api: ApiService, private toast: ToastService, private route: Router, private dialogHelper: DialogHelperService,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.loading = true;
        this.getJwtTokens();
        this.getConsumers();
    }

    ngOnDestroy(): void {
    }

    /**
     * Recarga los datos de consumidores
     */
    reloadData(cleanFilter = false) {
        this.loading = true;
        if (cleanFilter) {
            this.filter = '';
        }

        this.getJwtTokens();
        this.getConsumers();
        this.getNow();
    }

    /**
     * Obtiene el tiempo actual en milisegundos
     */
    getNow() {
        this.timeNow = DateTime.now();
    }

    getConsumer(id) {
        return this.consumers[id];
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
    getJwtTokens() {
        this.api.getJwtTokens()
            .subscribe({
                next: (value) => {
                    this.dataSource = new MatTableDataSource(value['data']);
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
                    this.loading = false;
                    this.applyFilter();
                }
            });
    }

    /**
     * Obtiene la información del nodo
     */
    getConsumers() {
        this.api.getConsumers()
            .subscribe({
                next: (res) => {
                    // Recojo los consumidores
                    res['data'].forEach(consumer => {
                        this.consumers[consumer.id] = consumer.username;
                    });
                },
                error: () => this.toast.error('error.node_connection')
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
        this.dialogHelper.deleteElement({
            id: select.id,
            consumerId: select.consumer.id,
            name: this.showKey(select.key, false) + ' [' + this.translate.instant('text.username') + ' ' + this.consumers[select.consumer.id] + ']'
        }, 'jwt')
            .then(() => { this.reloadData(); })
            .catch(error => {});
    }

}

