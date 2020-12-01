import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { ApiService } from '../../services/api.service';
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

    /////////////////////

    multi = [
        {
            'name': 'Germany',
            'series': [
                {
                    'name': '1990',
                    'value': 62000000
                },
                {
                    'name': '2010',
                    'value': 73000000
                },
                {
                    'name': '2011',
                    'value': 89400000
                }
            ]
        },

        {
            'name': 'USA',
            'series': [
                {
                    'name': '1990',
                    'value': 250000000
                },
                {
                    'name': '2010',
                    'value': 309000000
                },
                {
                    'name': '2011',
                    'value': 311000000
                }
            ]
        },

        {
            'name': 'France',
            'series': [
                {
                    'name': '1990',
                    'value': 58000000
                },
                {
                    'name': '2010',
                    'value': 50000020
                },
                {
                    'name': '2011',
                    'value': 58000000
                }
            ]
        },
        {
            'name': 'UK',
            'series': [
                {
                    'name': '1990',
                    'value': 57000000
                },
                {
                    'name': '2010',
                    'value': 62000000
                }
            ]
        }
    ];
    view: any[] = [700, 300];

    // options
    legend: boolean = true;
    showLabels: boolean = true;
    animations: boolean = true;
    xAxis: boolean = true;
    yAxis: boolean = true;
    showYAxisLabel: boolean = true;
    showXAxisLabel: boolean = true;
    xAxisLabel: string = 'Year';
    yAxisLabel: string = 'Population';
    timeline: boolean = true;

    colorScheme = {
        domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
    };


    onSelect(data): void {
        console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    }

    onActivate(data): void {
        console.log('Activate', JSON.parse(JSON.stringify(data)));
    }

    onDeactivate(data): void {
        console.log('Deactivate', JSON.parse(JSON.stringify(data)));
    }

    constructor(private api: ApiService, private toast: ToastService, private route: Router, private nodeWatcher: NodeService) {
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
            database: this.node_info['configuration']['database'],
            database_status: this.node_status['database']['reachable'],
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
        return final;
    }
}
