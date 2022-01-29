import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
    selector: 'app-element-consumer',
    templateUrl: './element-consumer.component.html',
    styleUrls: ['./element-consumer.component.scss']
})
export class ElementConsumerComponent implements OnInit, OnDestroy {
    displayedColumns: string[] = ['id', 'username', 'custom_id', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data;
    loading = false;
    filter = '';
    enabledPlugins = [];

    constructor(private api: ApiService, private toast: ToastService, private route: Router, private dialogHelper: DialogHelperService) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.loading = true;
        this.getConsumers();
        this.getNodeInformation();
    }

    ngOnDestroy(): void {
    }

    /**
     * Recarga los datos de consumidores
     */
    reloadData() {
        this.loading = true;
        this.filter = '';

        this.getConsumers();
        this.getNodeInformation();
    }

    /**
     * Obtiene los consumidores
     */
    getConsumers() {
        this.api.getConsumers()
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
            .then(() => { this.reloadData(); })
            .catch(error => {});
    }

    /**
     * Borra el elemento seleccionado
     * @param select Elemento a borrar
     */
    delete(select) {
        this.dialogHelper.deleteElement(select, 'consumer')
            .then(() => { this.reloadData(); })
            .catch(error => {});
    }

    /**
     * Muestra la info ACL del elemento seleccionado
     * @param select Elemento a ver su info
     */
    infoAcls(select) {
        this.dialogHelper.showInfoElement(select, 'acl');
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
     * Comprueba que un plugin esté activo
     * @param plugin Nombre del plugin
     */
    isPluginActive(plugin) {
        return this.enabledPlugins.includes(plugin);
    }
}
