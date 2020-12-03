import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
        'plugins': {
            'enabled_in_cluster': [],
            'available_on_server': {
                'grpc-web': true,
                'correlation-id': true,
                'pre-function': true,
                'cors': true,
                'rate-limiting': true,
                'loggly': true,
                'hmac-auth': true,
                'zipkin': true,
                'request-size-limiting': true,
                'azure-functions': true,
                'request-transformer': true,
                'oauth2': true,
                'response-transformer': true,
                'ip-restriction': true,
                'statsd': true,
                'jwt': true,
                'proxy-cache': true,
                'basic-auth': true,
                'key-auth': true,
                'http-log': true,
                'session': true,
                'datadog': true,
                'tcp-log': true,
                'prometheus': true,
                'post-function': true,
                'ldap-auth': true,
                'acl': true,
                'grpc-gateway': true,
                'file-log': true,
                'syslog': true,
                'udp-log': true,
                'response-ratelimiting': true,
                'aws-lambda': true,
                'bot-detection': true,
                'acme': true,
                'request-termination': true
            }
        },
        'configuration': {
            'database': 'postgres',

            'cassandra_read_consistency': 'ONE',
            'cassandra_username': 'kong',
            'cassandra_keyspace': 'kong',
            'cassandra_port': 9042,
            'cassandra_ssl': false,
            'cassandra_write_consistency': 'ONE',
            'cassandra_contact_points': ['127.0.0.1'],
            'cassandra_timeout': 5000,
            'cassandra_repl_strategy': 'SimpleStrategy',
            'cassandra_repl_factor': 1,
            'cassandra_ssl_verify': false,

            'pg_database': 'kong',
            'pg_ro_ssl_verify': false,
            'pg_semaphore_timeout': 60000,
            'pg_ssl': false,
            'pg_port': 5432,
            'pg_user': 'kong',
            'pg_host': '127.0.0.1',
            'pg_max_concurrent_queries': 0,
            'pg_ssl_verify': false,
            'pg_timeout': 5000,
            'pg_ro_ssl': false,

            'proxy_access_log': 'logs\/access.log',
            'client_max_body_size': '0',
            'prefix': '\/usr\/local\/kong',
            'nginx_conf': '\/usr\/local\/kong\/nginx.conf',
            'stream_proxy_ssl_enabled': false,
            'nginx_acc_logs': '\/usr\/local\/kong\/logs\/access.log',
            'proxy_listen': ['192.168.1.49:8000 reuseport backlog=16384'],
            'db_update_propagation': 0,
            'nginx_err_logs': '\/usr\/local\/kong\/logs\/error.log',
            'status_ssl_enabled': false,
            'admin_acc_logs': '\/usr\/local\/kong\/logs\/admin_access.log',
            'admin_access_log': 'logs\/admin_access.log',
            'nginx_http_ssl_protocols': 'TLSv1.2 TLSv1.3',
            'upstream_keepalive_idle_timeout': 60,
            'db_cache_ttl': 0,
            'cluster_control_plane': '127.0.0.1:8005',
            'ssl_protocols': 'TLSv1.1 TLSv1.2 TLSv1.3',
            'kong_env': '\/usr\/local\/kong\/.kong_env',
            'log_level': 'notice',
            'ssl_session_timeout': '1d',
            'proxy_error_log': 'logs\/error.log',

            'upstream_keepalive_pool_size': 60,
            'admin_ssl_enabled': false,
            'trusted_ips': {},
            'loaded_plugins': {
                'grpc-web': true,
                'correlation-id': true,
                'pre-function': true,
                'cors': true,
                'rate-limiting': true,
                'loggly': true,
                'hmac-auth': true,
                'zipkin': true,
                'request-size-limiting': true,
                'azure-functions': true,
                'request-transformer': true,
                'oauth2': true,
                'prometheus': true,
                'syslog': true,
                'statsd': true,
                'jwt': true,
                'proxy-cache': true,
                'basic-auth': true,
                'key-auth': true,
                'http-log': true,
                'session': true,
                'datadog': true,
                'tcp-log': true,
                'acme': true,
                'post-function': true,
                'bot-detection': true,
                'acl': true,
                'grpc-gateway': true,
                'response-transformer': true,
                'ip-restriction': true,
                'udp-log': true,
                'response-ratelimiting': true,
                'aws-lambda': true,
                'file-log': true,
                'ldap-auth': true,
                'request-termination': true
            },
            'ssl_ciphers': 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384',

            'cluster_listen': ['0.0.0.0:8005'],
            'client_ssl': false,
            'upstream_keepalive_max_requests': 100,

            'mem_cache_size': '128m',
            'nginx_proxy_real_ip_header': 'X-Real-IP',
            'proxy_ssl_enabled': false,
            'cluster_mtls': 'shared',

            'admin_error_log': 'logs\/error.log',
            'db_update_frequency': 5,
            'real_ip_header': 'X-Real-IP',
            'nginx_proxy_real_ip_recursive': 'off',
            'nginx_stream_ssl_protocols': 'TLSv1.2 TLSv1.3',
            'anonymous_reports': true,
            'client_body_buffer_size': '8k'
        },
        'version': '2.2.0',
        'node_id': 'a47bd8fa-af17-46e5-a8fb-679e63718d25',
        'lua_version': 'LuaJIT 2.1.0-beta3',
        'timers': {'pending': 8, 'running': 0},
        'hostname': 'ubuntu'
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
        console.log(this.chartData);

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
}
