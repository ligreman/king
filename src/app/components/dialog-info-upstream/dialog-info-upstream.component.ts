import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-info-upstream',
    templateUrl: './dialog-info-upstream.component.html',
    styleUrls: ['./dialog-info-upstream.component.scss']
})
export class DialogInfoUpstreamComponent implements OnInit {
    upstream;
    upstreamHealth;
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public upstreamId: string, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        // Recojo los datos del api
        this.api.getUpstream(this.upstreamId)
            .subscribe(service => {
                this.upstream = service;
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });

        // Estado salud del upstream
        this.api.getUpstreamHealth(this.upstreamId)
            .subscribe(h => {
                this.upstreamHealth = h;
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.upstream, null, 2)], {type: 'text/json'});
        saveAs(blob, 'service_' + this.upstreamId + '.json');
    }
}
