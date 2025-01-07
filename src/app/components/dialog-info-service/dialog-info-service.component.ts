import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-info-service',
    templateUrl: './dialog-info-service.component.html',
    styleUrls: ['./dialog-info-service.component.scss'],
    standalone: false
})
export class DialogInfoServiceComponent implements OnInit, OnDestroy {
    service;
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public serviceId: string, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        // Recojo los datos del api
        this.api.getService(this.serviceId)
            .subscribe({
                next: (service) => {
                    this.service = service;
                },
                error: (error) => this.toast.error_general(error)
                , complete: () => this.loading = false
            });
    }

    ngOnDestroy(): void {
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.service, null, 2)], {type: 'text/json'});
        saveAs(blob, 'service_' + this.serviceId + '.json');
    }
}
