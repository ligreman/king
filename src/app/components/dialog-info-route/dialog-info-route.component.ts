import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-info-route',
    templateUrl: './dialog-info-route.component.html',
    styleUrls: ['./dialog-info-route.component.scss']
})
export class DialogInfoRouteComponent implements OnInit {
    route;
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public routeId: string, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        // Recojo los datos del api
        this.api.getRoute(this.routeId)
            .subscribe(route => {
                this.route = route;
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.route, null, 2)], {type: 'text/json'});
        saveAs(blob, 'route_' + this.routeId + '.json');
    }
}
