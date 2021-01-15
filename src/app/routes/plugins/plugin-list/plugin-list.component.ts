import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DialogConfirmComponent } from '../../../components/dialog-confirm/dialog-confirm.component';
import { DialogInfoPluginConfigComponent } from '../../../components/dialog-info-plugin-config/dialog-info-plugin-config.component';
import { ApiService } from '../../../services/api.service';
import { DialogHelperService } from '../../../services/dialog-helper.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-plugin-list',
    templateUrl: './plugin-list.component.html',
    styleUrls: ['./plugin-list.component.scss']
})
export class PluginListComponent implements OnInit {
    displayedColumns: string[] = ['enabled', 'id', 'name', 'route', 'service', 'consumer', 'protocols', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data;
    services = {};
    routes = {};
    consumers = {};
    loading = false;
    filter = '';

    constructor(private api: ApiService, private toast: ToastService, private route: Router, private dialogHelper: DialogHelperService, private dialog: MatDialog) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.reloadData(true);
    }

    reloadData(all: boolean) {
        this.loading = true;
        this.filter = '';

        this.getData(all).subscribe(value => {
            this.dataSource = new MatTableDataSource(value.plugins);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;

            // Si he cogido todos los datos, los proceso
            if (all) {
                value['services'].forEach(serv => {
                    this.services[serv.id] = serv.name;
                });
                value['routes'].forEach(route => {
                    this.routes[route.id] = route.name;
                });
                value['consumers'].forEach(consumer => {
                    this.consumers[consumer.id] = consumer.username;
                });
            }
        }, error => {
            this.toast.error('error.node_connection');
        }, () => {
            this.loading = false;
        });
    }

    getData(all: boolean) {
        let sources = [this.api.getPlugins()];

        if (all) {
            sources.push(this.api.getServices());
            sources.push(this.api.getRoutes());
            sources.push(this.api.getConsumers());

            return forkJoin(sources).pipe(map(([plugins, services, routes, consumers]) => {
                // forkJoin returns an array of values, here we map those values to an object
                return {plugins: plugins['data'], services: services['data'], routes: routes['data'], consumers: consumers['data']};
            }));
        } else {
            return forkJoin(sources).pipe(map(([plugins]) => {
                // forkJoin returns an array of values, here we map those values to an object
                return {plugins: plugins['data']};
            }));
        }
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
    addEditPlugin(selected = null) {
        this.dialogHelper.addEdit(selected, 'plugin')
            .then(() => { this.reloadData(false); })
            .catch(error => {});
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
            .then(() => { this.reloadData(false); })
            .catch(error => {});
    }

    infoPluginConfig(row) {
        this.dialog.open(DialogInfoPluginConfigComponent, {
            height: '600px',
            width: '900px',
            data: row
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
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'true') {
                this.api.enablePlugin(row.id, row.enabled)
                    .subscribe(value => {
                        if (row.enabled) {
                            this.toast.success('success.enabled_plugin', '', {msgExtra: row.name});
                        } else {
                            this.toast.success('success.disabled_plugin', '', {msgExtra: row.name});
                        }
                        this.reloadData(false);
                    }, error => {
                        this.toast.error_general(error, {disableTimeOut: true});
                    });
            } else {
                row.enabled = !row.enabled;
            }
        });
    }
}
