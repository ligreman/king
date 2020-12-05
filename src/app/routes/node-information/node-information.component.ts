import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { sortBy } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from '../../services/api.service';
import { GlobalsService } from '../../services/globals.service';
import { NodeService } from '../../services/node.service';
import { ToastService } from '../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-node-information',
    templateUrl: './node-information.component.html',
    styleUrls: ['./node-information.component.scss']
})
export class NodeInformationComponent implements OnInit, OnDestroy {
    node_info;
    node_status;
    data = {};

    a = {
        'configuration': {
            'cluster_control_plane': '127.0.0.1:8005',
            'anonymous_reports': true,

            'proxy_access_log': 'logs\/access.log',
            'proxy_error_log': 'logs\/error.log',
            'nginx_acc_logs': '\/usr\/local\/kong\/logs\/access.log',
            'nginx_err_logs': '\/usr\/local\/kong\/logs\/error.log',
            'admin_acc_logs': '\/usr\/local\/kong\/logs\/admin_access.log',
            'admin_access_log': 'logs\/admin_access.log',
            'admin_error_log': 'logs\/error.log',
            'nginx_conf': '\/usr\/local\/kong\/nginx.conf',
            'kong_env': '\/usr\/local\/kong\/.kong_env'
        }
    };


    /////////////////////

    chartData = [];
    chartSize: any[] = [500, 300];
    colorScheme = {domain: []};

    constructor(private api: ApiService, private toast: ToastService, private route: Router, private nodeWatcher: NodeService,
                private globals: GlobalsService, private translate: TranslateService) {
        this.colorScheme.domain = this.globals.GRAPH_SCHEME;
    }

    ngOnInit(): void {
        this.getData();

        // Escucho cambios de nodo
        this.nodeWatcher.nodeChanged$.subscribe(node => {
            this.getData();
        });
    }


    ngOnDestroy(): void {
    }

    /*
        Obtiene los datos del nodo
     */
    getData() {
        this.api.getNodeInformation()
            .subscribe(res => {
                this.node_info = res;

                // pido el status del nodo
                this.api.getNodeStatus()
                    .subscribe(value => {
                        this.node_status = value;

                        this.processData();
                    });
            }, error => {
                this.toast.error('error.node_connection');
                this.route.navigate(['/landing']);
            });
    }

    /*
        Proceso los datos de los endpoint de kong y status
     */
    processData() {
        this.data = {
            node_id: this.node_info['node_id'],
            version: this.node_info['version'],
            plugins: this.parsePlugins(this.node_info['plugins']),
            admin_listen: this.node_info['configuration']['admin_listen'],
            admin_ssl: this.node_info['configuration']['admin_ssl_enabled'],
            proxy_listen: this.node_info['configuration']['proxy_listen'],
            proxy_ssl: this.node_info['configuration']['proxy_ssl_enabled'],
            cluster_control_plane: this.node_info['configuration']['cluster_control_plane'],
            anonymous_reports: this.node_info['configuration']['anonymous_reports'],
            database: {
                type: this.node_info['configuration']['database'],
                status: this.node_status['database']['reachable']
            },
            server: {
                total: this.node_status['server']['total_requests'],
                accepted: this.node_status['server']['connections_accepted'],
                waiting: this.node_status['server']['connections_waiting'],
                handled: this.node_status['server']['connections_handled'],
                writing: this.node_status['server']['connections_writing'],
                reading: this.node_status['server']['connections_reading'],
                active: this.node_status['server']['connections_active']
            },
            files: {
                proxy_access_log: this.node_info['configuration']['proxy_access_log'],
                proxy_error_log: this.node_info['configuration']['proxy_error_log'],
                nginx_conf: this.node_info['configuration']['nginx_conf'],
                nginx_acc_logs: this.node_info['configuration']['nginx_acc_logs'],
                nginx_err_logs: this.node_info['configuration']['nginx_err_logs'],
                admin_acc_logs: this.node_info['configuration']['admin_acc_logs'],
                admin_access_log: this.node_info['configuration']['admin_access_log'],
                admin_error_log: this.node_info['configuration']['admin_error_log'],
                kong_env: this.node_info['configuration']['kong_env']
            }
        };

        // Datos del gráfico
        this.chartData = [
            {name: this.translate.instant('information.chart.connections_accepted'), value: this.node_status['server']['connections_accepted']},
            {name: this.translate.instant('information.chart.connections_active'), value: this.node_status['server']['connections_active']},
            {name: this.translate.instant('information.chart.connections_waiting'), value: this.node_status['server']['connections_waiting']},
            {name: this.translate.instant('information.chart.connections_writing'), value: this.node_status['server']['connections_writing']},
            {name: this.translate.instant('information.chart.connections_reading'), value: this.node_status['server']['connections_reading']},
            {name: this.translate.instant('information.chart.connections_handled'), value: this.node_status['server']['connections_handled']},
            {name: this.translate.instant('information.chart.total_requests'), value: this.node_status['server']['total_requests']}
        ];

        // Otra info
        if (this.data['database']['type'] === 'postgres') {
            this.data['database']['name'] = this.node_info['configuration']['pg_database'];
            this.data['database']['username'] = this.node_info['configuration']['pg_user'];
            this.data['database']['ssl'] = this.node_info['configuration']['pg_ssl'];
            this.data['database']['ssl_verify'] = this.node_info['configuration']['pg_ssl_verify'];
            this.data['database']['port'] = this.node_info['configuration']['pg_port'];
            this.data['database']['host'] = this.node_info['configuration']['pg_host'];
            this.data['database']['timeout'] = this.node_info['configuration']['pg_timeout'];
        } else if (this.data['database']['type'] === 'cassandra') {
            this.data['database']['name'] = this.node_info['configuration']['cassandra_keyspace'];
            this.data['database']['username'] = this.node_info['configuration']['cassandra_username'];
            this.data['database']['ssl'] = this.node_info['configuration']['cassandra_ssl'];
            this.data['database']['ssl_verify'] = this.node_info['configuration']['cassandra_ssl_verify'];
            this.data['database']['port'] = this.node_info['configuration']['cassandra_port'];
            this.data['database']['host'] = this.node_info['configuration']['cassandra_contact_points'].join(', ');
            this.data['database']['timeout'] = this.node_info['configuration']['cassandra_timeout'];
        }


        console.log(this.data);
        // TODO
    }

    /*
        Parsea la info de plugins
     */
    parsePlugins(list): any[] {
        let final = [];
        const elements = Object.keys(list['available_on_server']);
        for (let plugin of elements) {
            final.push({
                name: plugin,
                available: list['available_on_server'][plugin],
                used: list['enabled_in_cluster'].includes(plugin)
            });
        }
        return sortBy(final, ['name']);
    }

    /*
        Descarga el JSON
     */
    downloadJson(type: string) {
        let content, name;
        if (type === 'info') {
            content = this.node_info;
            name = 'node-info';
        } else {
            content = this.node_status;
            name = 'node-status';
        }

        const blob = new Blob([JSON.stringify(content, null, 2)], {type: 'text/json'});
        saveAs(blob, name + '.json');
    }
}
