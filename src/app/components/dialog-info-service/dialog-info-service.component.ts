import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-info-service',
    templateUrl: './dialog-info-service.component.html',
    styleUrls: ['./dialog-info-service.component.scss']
})
export class DialogInfoServiceComponent implements OnInit {
    service;
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public serviceId: string, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        // Recojo los datos del api
        this.api.getService(this.serviceId)
            .subscribe(service => {
                this.service = service;
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });
    }

    copyClip() {
        return JSON.stringify(this.service);
    }
}
