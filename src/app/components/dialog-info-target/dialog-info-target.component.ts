import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-info-target',
    templateUrl: './dialog-info-target.component.html',
    styleUrls: ['./dialog-info-target.component.scss']
})
export class DialogInfoTargetComponent implements OnInit {
    target;
    upstreamId;
    targetId;
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public data: string, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        const aux = this.data.split('#');
        this.targetId = aux[0];
        this.upstreamId = aux[1];

        // Recojo los datos del api
        this.api.getTargets(this.upstreamId)
            .subscribe(targets => {
                targets['data'].forEach(tg => {
                    if (tg.id === this.targetId) {
                        this.target = tg;
                    }
                });
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.target, null, 2)], {type: 'text/json'});
        saveAs(blob, 'service_' + this.targetId + '.json');
    }
}
