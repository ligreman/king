import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-dialog-info-plugin',
    templateUrl: './dialog-info-plugin.component.html',
    styleUrls: ['./dialog-info-plugin.component.scss']
})
export class DialogInfoPluginComponent implements OnInit {
    plugin;
    route = {name: '', id: ''};
    service = {name: '', id: ''};
    consumer = {name: '', id: ''};
    loading = true;

    constructor(@Inject(MAT_DIALOG_DATA) public pluginId: string, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        // Recojo los datos del api
        this.api.getPlugin(this.pluginId)
            .subscribe(plugin => {
                this.plugin = plugin;

                // La lista de rutas
                if (plugin['route'] && plugin['route'].id) {
                    this.api.getRoute(plugin['route'].id)
                        .subscribe(route => {
                            this.route.id = route['id'];
                            this.route.name = route['name'];
                        }, error => {
                            this.toast.error_general(error);
                        });
                }
                // La lista de servs
                if (plugin['service'] && plugin['service'].id) {
                    this.api.getService(plugin['service'].id)
                        .subscribe(service => {
                            this.service.id = service['id'];
                            this.service.name = service['name'];
                        }, error => {
                            this.toast.error_general(error);
                        });
                }
                // La lista de consumers
                if (plugin['consumer'] && plugin['consumer'].id) {
                    this.api.getConsumer(plugin['consumer'].id)
                        .subscribe(consumer => {
                            this.consumer.id = consumer['id'];
                            this.consumer.name = (consumer['username'] || consumer['custom_id']);
                        }, error => {
                            this.toast.error_general(error);
                        });
                }
            }, error => {
                this.toast.error_general(error);
            }, () => {
                this.loading = false;
            });
    }

    isEmpty() {
        return JSON.stringify(this.plugin['config']) === '{}';
    }

    downloadJson() {
        const blob = new Blob([JSON.stringify(this.plugin, null, 2)], {type: 'text/json'});
        saveAs(blob, 'plugin_' + this.pluginId + '.json');
    }


    createDocLink(plugin: string): string {
        let url = 'https://docs.konghq.com/hub/kong-inc/' + plugin;

        if (plugin === 'proxy-cache-redis') {
            url = 'https://github.com/ligreman/kong-proxy-cache-redis-plugin/blob/master/README.md';
        }

        return url;
    }
}
