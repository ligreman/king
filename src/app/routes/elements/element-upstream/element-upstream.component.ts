import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { DialogHelperService } from '../../../services/dialog-helper.service';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-element-upstream',
    templateUrl: './element-upstream.component.html',
    styleUrls: ['./element-upstream.component.scss']
})
export class ElementUpstreamComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['id', 'name', 'algorithm', 'hash_on', 'hash_fallback', 'health', 'tags', 'actions'];
    dataSource: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    data;
    loading = false;
    filter = '';
    healths = {};

    constructor(private api: ApiService, private toast: ToastService, private route: Router, private dialogHelper: DialogHelperService) {
    }

    ngOnInit(): void {
        // Aquí para que no error de ExpressionChangedAfterItHasBeenCheckedError
        this.loading = true;
    }

    ngAfterViewInit() {
        this.reloadData();
    }

    reloadData() {
        this.loading = true;
        this.filter = '';

        this.getData().then((value) => {
                this.dataSource = new MatTableDataSource(value);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.loading = false;
            },
            () => {
                this.toast.error('error.node_connection');
                this.loading = false;
            });
    }

    /*
        Obtener los datos de forma asíncrona
     */
    async getData() {
        const upstreams = await firstValueFrom(this.api.getUpstreams());

        for (const [idx, up] of upstreams['data'].entries()) {
            try {
                const h = await firstValueFrom(this.api.getUpstreamHealth(up['id']));
                upstreams['data'][idx]['health'] = h['data']['health'];
            } catch (err) {
                this.toast.error('error.get_data');
            }

            const t = await firstValueFrom(this.api.getTargets(up['id']));
            upstreams['data'][idx]['targets'] = t['data'];
        }

        return upstreams['data'];
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
        this.dialogHelper.addEdit(selected, 'upstream')
            .then(() => { this.reloadData(); })
            .catch(() => {});
    }

    /*
        Muestra la info del elemento seleccionado
     */
    showInfo(select) {
        this.dialogHelper.showInfoElement(select, 'upstream');
    }

    /*
        Borra el elemento seleccionado
     */
    delete(select) {
        this.dialogHelper.deleteElement(select, 'upstream')
            .then(() => { this.reloadData(); })
            .catch(() => {});
    }

    /*
        Muestra la información del Target
     */
    showTarget(target) {
        target['data'] = {upstream: target['upstream']};
        this.dialogHelper.showInfoElement(target, 'target');
    }

    /*
        Borra el target
     */
    deleteTarget(target, event) {
        event.stopPropagation();

        this.dialogHelper.deleteElement(target, 'target')
            .then(() => { this.reloadData(); })
            .catch(() => {});
    }
}
