import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { DialogHelperService } from '../../../services/dialog-helper.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-element-route',
    templateUrl: './element-route.component.html',
    styleUrls: ['./element-route.component.scss']
})
export class ElementRouteComponent implements OnInit, AfterViewInit {
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

    ngAfterViewInit() {
        /*console.log('pepepeee');
        forkJoin([{
            services: this.api.getServices(),
            routes: this.api.getRoutes()
        }]).subscribe(value => {
                this.dataSource = new MatTableDataSource(value['routes']['data']);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            },
            error => {
                this.toast.error('error.node_connection');
                this.route.navigate(['/landing']);
            }, () => {
                this.loading = false;
            });*/

        this.api.getServices()
            .subscribe(ss => {
                    this.services = ss['data'];
                    console.log(ss);

                    this.api.getRoutes()
                        .subscribe(value => {
                                console.log(value.data);
                                this.dataSource = new MatTableDataSource(value['data']);
                                this.dataSource.paginator = this.paginator;
                                this.dataSource.sort = this.sort;
                            },
                            error => {
                                this.toast.error('error.node_connection');
                            }, () => {
                                this.loading = false;
                            });
                },
                error => {
                    this.toast.error('error.node_connection');
                }, () => {
                    this.loading = false;
                });
    }

    reloadData() {
        this.loading = true;
        this.filter = '';

        this.api.getRoutes()
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

    getService(id) {
        
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
        this.dialogHelper.addEditRoute(selected)
            .then(() => { this.reloadData(); })
            .catch(error => {});
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
            .catch(error => {});
    }
}
