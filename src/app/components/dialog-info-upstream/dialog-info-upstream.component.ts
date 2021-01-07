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
    }


    downloadJson() {
        const blob = new Blob([JSON.stringify(this.upstream, null, 2)], {type: 'text/json'});
        saveAs(blob, 'service_' + this.upstreamId + '.json');
    }
}

//
// a = {

//     'healthchecks': {
//         'threshold': 0,
//         'active': {
//             'unhealthy': {
//                 'http_statuses': [429, 404, 500, 501, 502, 503, 504, 505],
//                 'tcp_failures': 0,
//                 'timeouts': 0,
//                 'http_failures': 0,
//                 'interval': 0
//             },
//             'healthy': {'successes': 0, 'interval': 0, 'http_statuses': [200, 302]},
//         },
//         'passive': {
//             'unhealthy': {'http_failures': 0, 'http_statuses': [429, 500, 503], 'tcp_failures': 0, 'timeouts': 0},
//             'healthy': {'http_statuses': [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308], 'successes': 0},
//         }
//     },
//
// };
