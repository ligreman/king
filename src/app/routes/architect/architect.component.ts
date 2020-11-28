import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { filter } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSet, Network } from 'vis-network/standalone';
import { DialogNewServiceComponent } from '../../components/dialog-new-service/dialog-new-service.component';
import { ApiService } from '../../services/api.service';
import { GlobalsService } from '../../services/globals.service';
import { ToastService } from '../../services/toast.service';

@AutoUnsubscribe()
@Component({
    selector: 'app-architect',
    templateUrl: './architect.component.html',
    styleUrls: ['./architect.component.scss']
})
export class ArchitectComponent implements OnInit, OnDestroy, AfterViewInit {
    loading = false;
    // Si tengo seleccionado un elemento del grafo
    selection: any = '';
    // First stabilization
    stabilized = false;
    // Grafo
    network;

    // Datos del grafo
    data = {
        nodes: new DataSet([]),
        edges: new DataSet([])
    };

    constructor(private api: ApiService, private route: Router, private toast: ToastService, private globals: GlobalsService, private dialog: MatDialog) {
        // Compruebo la conexión al nodo
        this.api.getNodeStatus()
            .subscribe(value => {
                    this.loading = true;
                },
                error => {
                    this.toast.error('error.node_connection');
                    this.route.navigate(['/landing']);
                });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {}

    ngAfterViewInit() {
        // create a network
        setTimeout(() => {
            this.loading = false;
            const container = document.getElementById('node-network');
            const reference = document.getElementById('net-reference');
            let options = {
                groups: this.globals.NETWORK_GROUPS,
                nodes: this.globals.NETWORK_NODES,
                edges: this.globals.NETWORK_EDGES,
                interaction: {
                    tooltipDelay: 300
                },
                physics: {
                    barnesHut: {
                        springLength: 115,
                        avoidOverlap: 0
                    }
                },
                height: '90%'
            };
            if (reference) {
                options.height = reference.offsetHeight + 'px';
                this.network = new Network(container, this.data, options);

                // Eventos sobre el grafo
                // this.network.on('selectNode', node => {
                //     console.log('Elegio');
                //     console.log(node);
                //     console.log(this.data.nodes.get(node.nodes[0]));
                //     this.selection = this.data.nodes.get(node.nodes[0]);
                // });
                this.network.on('click', info => {
                    if (info.nodes.length > 0) {
                        console.log(this.data.nodes.get(info.nodes[0]));
                        this.selection = this.data.nodes.get(info.nodes[0]);
                    } else {
                        this.selection = '';
                    }
                });

                this.network.on('stabilized', d => {
                    if (!this.stabilized) {
                        this.stabilized = true;
                        this.network.fit();
                    }
                });

                this.populateGraph();
            }
        }, 2000);

    }

    /*
        Llama al API y genera nodos y edges
     */
    populateGraph() {
        // Llamo al API por la información para pintar el grafo
        this.getGraphDataFromApi().subscribe(value => {
            // Ahora construyo los nodos y edges del grafo
            this.createGraphNodesAndEdges(value);
        });
    }

    /*
        Agrupo las llamadas al API para pedir los datos del grafo
     */
    getGraphDataFromApi() {
        // Recojo del api los datos
        return forkJoin([
            this.api.getServices(),
            this.api.getRoutes(),
            this.api.getUpstreams()
        ]).pipe(map(([services, routes, upstreams]) => {
            // forkJoin returns an array of values, here we map those values to an object
            return {services: services['data'], routes: routes['data'], upstreams: upstreams['data']};
        }));
    }

    /*
        Calculo los datos de nodos y edges del grafo
     */
    createGraphNodesAndEdges(data) {
        // Limpio el grafo
        this.data.nodes.clear();
        this.data.edges.clear();

        // Recorro los servicios creando los nodos de servicios
        for (let service of data.services) {
            // Nodos de servicio
            this.data.nodes.add({
                id: service.id,
                label: service.name,
                title: 'Servicio: ' + service.id,
                group: 'service'
            });

            // Si el host de este servicio se corresponde con el name de un Upstream, edge
            const serviceUpstream = filter(data.upstreams, {name: service.host});
            if (serviceUpstream.length > 0) {
            }
            // Si el host no se corresponde con Upstreams, creo un nodo Host y edge hacia él
            else {
                const pathLabel = service.path || '';
                this.data.nodes.add({
                    id: 'h#' + service.id,
                    label: service.protocol + '://' + service.host + ':' + service.port + pathLabel,
                    group: 'host'
                });
                this.data.edges.add({
                    from: service.id,
                    to: 'h#' + service.id
                });
            }
        }

        // Recorro las rutas creando los nodos de rutas
        for (let route of data.routes) {
            // Nodos de ruta
            this.data.nodes.add({
                id: route.id,
                label: route.name,
                title: route.id,
                group: 'route'
            });

            // Busco los servicios asociados a la ruta para crear los edges, si está enlazado a un servicio
            if (route['service']['id']) {
                const routeServices = filter(data.services, {id: route.service.id});
                for (let ss of routeServices) {
                    // Edges de la ruta al servicio
                    this.data.edges.add({
                        // id:
                        from: route.id,
                        to: ss.id
                    });
                }
            }
        }

        this.stabilized = false;
        // Ajusto el tamaño del grafo después de recoger todos los datos
        /*setTimeout(() => {
            this.network.fit();
        }, 1000);*/
    }

    fitNetwork() {
        this.network.fit({animation: {duration: 1000}});
    }

    /*
        Añade un servicio nuevo
     */
    addService() {
        const dialogRef = this.dialog.open(DialogNewServiceComponent, {
            disableClose: true,
            minWidth: '80vw',
            minHeight: '50vh'
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result !== null && result !== 'null') {
                // llamo al API
                this.api.postNewService(result).subscribe(value => {
                    this.toast.success('text.id_extra', 'success.new_service', {msgExtra: value['id']});
                    this.populateGraph();
                }, error => {
                    this.toast.error_general(error, {disableTimeOut: true});
                });
            }
        });
    }

    /*
        Añade una ruta nueva
     */
    addRoute() {
        const body = {
            // Required
            'protocols': ['http', 'https'],
            // Semi-optional
            'methods': ['GET', 'POST'],
            'hosts': ['example.com', 'foo.test'],
            'paths': ['/foo', '/bar'],
            'headers': {'x-another-header': ['bla'], 'x-my-header': ['foo', 'bar']},
            // Optional
            'name': 'my-route2',
            'regex_priority': 0,
            'strip_path': true,
            'path_handling': 'v0',
            'preserve_host': false,
            'tags': ['user-level', 'low-priority'],
            'service': {'name': 'my-service3'}
            // 'service': {'id': 'af8330d3-dbdc-48bd-b1be-55b98608834b'}
        };
        this.api.postNewRoute(body)
            .subscribe(value => {
                this.toast.success('text.id_extra', 'success.new_route', {msgExtra: value['id']});
            }, error => {
                this.toast.error_general(error);
            });
    }

    /*
        Añade un upstream nuevo
     */
    addUpstream() {
        const body = {
            // Required - This is a hostname, which must be equal to the host of a Service.
            'name': 'example.com',
            // Optional or semi
            'algorithm': 'round-robin',
            'hash_on': 'none',
            'hash_fallback': 'none',
            'hash_on_cookie_path': '/',
            'slots': 10000,
            'healthchecks': {
                'active': {
                    'https_verify_certificate': true,
                    'unhealthy': {
                        'http_statuses': [429, 404, 500, 501, 502, 503, 504, 505],
                        'tcp_failures': 0,
                        'timeouts': 0,
                        'http_failures': 0,
                        'interval': 0
                    },
                    'http_path': '/',
                    'timeout': 1,
                    'healthy': {
                        'http_statuses': [200, 302],
                        'interval': 0,
                        'successes': 0
                    },
                    'https_sni': 'example.com',
                    'concurrency': 10,
                    'type': 'http'
                },
                'passive': {
                    'unhealthy': {
                        'http_failures': 0,
                        'http_statuses': [429, 500, 503],
                        'tcp_failures': 0,
                        'timeouts': 0
                    },
                    'type': 'http',
                    'healthy': {
                        'successes': 0,
                        'http_statuses': [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308]
                    }
                },
                'threshold': 0
            },
            'tags': ['user-level', 'low-priority'],
            'host_header': 'example.com',
            'client_certificate': {'id': 'ea29aaa3-3b2d-488c-b90c-56df8e0dd8c6'}
        };
        this.api.postNewUpstream(body)
            .subscribe(value => {
                this.toast.success('text.id_extra', 'success.new_upstream', {msgExtra: value['id']});
            }, error => {
                this.toast.error_general(error);
            });
    }

    /*
        Añade un consumidor nuevo
     */
    addConsumer() {
        const body = {
            // Semi-optional, OR
            'username': 'my-username',
            'custom_id': 'my-custom-id',
            // Optional
            'tags': ['user-level', 'low-priority']
        };
        this.api.postNewConsumer(body)
            .subscribe(value => {
                this.toast.success('text.id_extra', 'success.new_consumer', {msgExtra: value['id']});
            }, error => {
                this.toast.error_general(error);
            });
    }

    /*
        Elimina un servicio dado su id
     */
    deleteService(id: string) {
        this.api.deleteService(id).subscribe(value => {}, error => {
            this.toast.error_general(error);
        });
    }
}
