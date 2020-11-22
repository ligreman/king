import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSet, Network } from 'vis-network/standalone';
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
    selection;
    // Tipo de elemento seleccionado: servicio, ruta, upstream, ...
    scope;
    // Grafo
    network;
    // Datos del grafo
    data = {
        nodes: new DataSet([]),
        edges: new DataSet([])
    };

    constructor(private api: ApiService, private route: Router, private toast: ToastService, private globals: GlobalsService) {
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

    ngOnInit(): void {}

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
                    tooltipDelay: 1000
                },
                height: '90%'
            };
            if (reference) {
                options.height = reference.offsetHeight + 'px';
                this.network = new Network(container, this.data, options);

                // Eventos sobre el grafo
                this.network.on('selectNode', node => {
                    console.log('Elegio');
                    console.log(node);
                    console.log(this.data.nodes.get(node.nodes[0]));
                });

                // Llamo al API por la información para pintar el grafo
                this.getGraphData().subscribe(value => {
                    // Ahora construyo los nodos y edges del grafo
                    this.populateGraphNodes(value);
                });
            }
        }, 2000);

    }

    /*
        Agrupo las llamadas al API para pedir los datos del grafo
     */
    getGraphData() {
        // Recojo del api los datos
        return forkJoin([
            this.api.getServices(),
            this.api.getRoutes()
        ]).pipe(map(([services, routes]) => {
            // forkJoin returns an array of values, here we map those values to an object
            return {services: services['data'], routes: routes['data']};
        }));
    }

    /*
        Calculo los datos de nodos y edges del grafo
     */
    populateGraphNodes(data) {
        // Recorro los servicios creando los nodos de servicios
        for (let service of data.services) {
            this.data.nodes.add({
                id: service.id,
                shape: 'box',
                label: service.name,
                title: service.id,
                group: 'service'
            });
        }

        // Recorro las rutas creando los nodos de rutas
        for (let route of data.routes) {
            this.data.nodes.add({
                id: route.id,
                shape: 'box',
                label: route.name,
                title: route.id,
                group: 'route'
            });
        }

        // Ajusto el tamaño del grafo después de recoger todos los datos
        this.network.fit();
    }

    /*
        Añade un servicio nuevo
     */
    addService() {
        const body = {

            // Required
            'protocol': 'http',
            'host': 'example.com',
            'port': 80,
            // Optional
            'name': 'my-service2',
            'retries': 5,
            'path': '/some_api',
            'connect_timeout': 60000,
            'write_timeout': 60000,
            'read_timeout': 60000,
            'tags': ['user-level', 'low-priority']
            // 'client_certificate': {'id': '4e3ad2e4-0bc4-4638-8e34-c84a417ba39b'},
            // 'tls_verify': true,
            // 'tls_verify_depth': null,
            // 'ca_certificates': ['4e3ad2e4-0bc4-4638-8e34-c84a417ba39b', '51e77dc2-8f3e-4afa-9d0e-0e3bbbcfd515'],
            // 'url': 'https://10.20.30.40:5355/api/v1/'
        };
        this.api.postNewService(body)
            .subscribe(value => {
                this.toast.success('text.id_extra', 'success.new_service', {msgExtra: value['id']});
            }, error => {
                this.toast.error_general(error);
            });
    }

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
            'name': 'my-route',
            'regex_priority': 0,
            'strip_path': true,
            'path_handling': 'v0',
            'preserve_host': false,
            'tags': ['user-level', 'low-priority'],
            'service': {'name': 'my-service'}
            // 'service': {'id': 'af8330d3-dbdc-48bd-b1be-55b98608834b'}
        };
        this.api.postNewRoute(body)
            .subscribe(value => {
                this.toast.success('text.id_extra', 'success.new_route', {msgExtra: value['id']});
            }, error => {
                this.toast.error_general(error);
            });
    }

    addUpstream() {
    }

    addConsumer() {
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
