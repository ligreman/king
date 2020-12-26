import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter as _filter } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSet, Network } from 'vis-network/standalone';
import { ApiService } from '../../services/api.service';
import { DialogHelperService } from '../../services/dialog-helper.service';
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
    // Posibles tipos de nodos que tienen acciones propias
    groups = ['service', 'route', 'upstream', 'consumer'];

    // Datos del grafo
    data = {
        nodes: new DataSet([]),
        edges: new DataSet([])
    };

    constructor(private api: ApiService, private route: Router, private toast: ToastService, private globals: GlobalsService,
                private translate: TranslateService, private dialogHelper: DialogHelperService) {
    }

    ngOnInit(): void {
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

    ngOnDestroy(): void {}

    ngAfterViewInit() {
        // create a network. El setTimeout es para dejar tiempo a que cargue bien el DOM
        setTimeout(() => {
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
                    },
                    minVelocity: 1.2
                },
                height: '90%'
            };
            if (reference) {
                options.height = reference.offsetHeight + 'px';
                this.network = new Network(container, this.data, options);

                this.network.on('click', info => {
                    if (info.nodes.length > 0) {
                        this.selection = this.data.nodes.get(info.nodes[0]);
                    } else {
                        this.selection = '';
                    }
                });

                this.network.on('doubleClick', info => {
                    if (info.nodes.length > 0) {
                        this.selection = this.data.nodes.get(info.nodes[0]);

                        if (this.groups.includes(this.selection.group)) {
                            this.showInfo(this.selection);
                        }
                    } else {
                        this.selection = '';
                    }
                });

                this.network.on('stabilized', d => {
                    if (!this.stabilized) {
                        this.stabilized = true;
                        this.network.fit();
                        this.network.focus('center');
                    }
                });

                this.populateGraph();
            }
        }, 1500);
    }

    /*
        Llama al API y genera nodos y edges
     */
    populateGraph() {
        this.loading = true;
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

        // Genero el nodo central del grafo
        this.data.nodes.add({
            id: 'center',
            title: this.translate.instant('text.kong_node') + '<br>' + this.globals.NODE_API_URL,
            group: 'kong'
        });

        // Recorro los servicios creando los nodos de servicios
        for (let service of data.services) {
            // Nodos de servicio
            this.data.nodes.add({
                id: service.id,
                label: service.name,
                title: this.translate.instant('service.label') + ': ' + service.id,
                group: 'service',
                data: service
            });

            // Si el host de este servicio se corresponde con el name de un Upstream, edge
            const serviceUpstream = _filter(data.upstreams, {name: service.host});
            if (serviceUpstream.length > 0) {
                serviceUpstream.forEach(up => {
                    this.data.nodes.add({
                        id: up.id,
                        label: up.name,
                        group: 'upstream',
                        title: 'Upstream'
                    });
                    this.data.edges.add({
                        from: service.id,
                        to: up.id,
                        width: 2
                    });
                });
            }
            // Si el host no se corresponde con Upstreams, creo un nodo Host y edge hacia él
            else {
                const pathLabel = service.path || '';
                this.data.nodes.add({
                    id: 'h#' + service.id,
                    label: service.protocol + '://' + service.host + ':' + service.port + pathLabel,
                    group: 'host',
                    title: 'Host'
                });
                this.data.edges.add({
                    from: service.id,
                    to: 'h#' + service.id,
                    width: 2
                });
            }
        }

        // Recorro las rutas creando los nodos de rutas
        for (let route of data.routes) {
            let extras = [''];

            if (route.methods) {
                extras.push(this.translate.instant('route.dialog.methods') + ': ' + route.methods.join(', '));
            }
            if (route.hosts) {
                extras.push(this.translate.instant('route.dialog.hosts') + ': ' + route.hosts.join(', '));
            }
            if (route.paths) {
                extras.push(this.translate.instant('route.dialog.paths') + ': ' + route.paths.join(', '));
            }
            if (route.headers) {
                extras.push(this.translate.instant('route.dialog.headers') + ': ' + JSON.stringify(route.headers));
            }


            // Nodos de ruta
            this.data.nodes.add({
                id: route.id,
                label: route.name + '\n[' + route.protocols.join(', ') + ']',
                title: this.translate.instant('route.label') + ': ' + route.id + extras.join('<br>'),
                group: 'route',
                data: route
            });

            // Busco los servicios asociados a la ruta para crear los edges, si está enlazado a un servicio
            if (route['service']['id']) {
                const routeServices = _filter(data.services, {id: route.service.id});
                for (let ss of routeServices) {
                    // Edges de la ruta al servicio
                    this.data.edges.add({
                        from: route.id,
                        to: ss.id,
                        width: 3
                    });
                }
            }

            // Edge del nodo central a la ruta
            this.data.edges.add({
                from: 'center',
                to: route.id,
                arrows: {to: {enabled: false}}
            });

            // TODO completar con consumidores, plugins...
        }

        this.stabilized = false;
        this.loading = false;
    }

    fitNetwork() {
        this.network.fit({animation: {duration: 1000}});
        this.network.focus('center');
    }

    /*
        Alta edición general
     */
    addEdit(selected = null, group) {
        switch (group) {
            case 'service':
                this.addEditService(selected);
                break;
            case 'route':
                this.addEditRoute(selected);
                break;
            case 'upstream':
                this.addEditUpstream(selected);
                break;
            case 'consumer':
                this.addEditConsumer(selected);
                break;
            case 'plugin':
                this.addEditPlugin(selected);
                break;
        }
    }

    /*
        Añade un servicio nuevo
     */
    addEditService(selected = null) {
        this.dialogHelper.addEditService(selected)
            .then(() => { this.populateGraph(); })
            .catch(error => {});
    }

    /*
        Añade una ruta nueva
     */
    addEditRoute(selected = null) {
        this.dialogHelper.addEditRoute(selected)
            .then(() => { this.populateGraph(); })
            .catch(error => {});
    }

    /*
        Añade un upstream nuevo
     */
    addEditUpstream(selected = null) {
        this.dialogHelper.addEditUpstream(selected)
            .then(() => { this.populateGraph(); })
            .catch(error => {});
    }

    /*
        Añade un consumidor nuevo
     */
    addEditConsumer(selected = null) {
        this.dialogHelper.addEditConsumer(selected)
            .then(() => { this.populateGraph(); })
            .catch(error => {});
    }

    /*
        Añade un Plugin
     */
    addEditPlugin(selected = null) {
        this.dialogHelper.addEditConsumer(selected)
            .then(() => { this.populateGraph(); })
            .catch(error => {});
    }

    /*
        Muestra la info del elemento seleccionado
     */
    showInfo(select) {
        this.dialogHelper.showInfoElement(select, select.group);
    }

    /*
        Borra el elemento seleccionado
     */
    delete(select) {
        this.dialogHelper.deleteElement(select.data, select.group)
            .then(() => { this.populateGraph(); })
            .catch(error => {});
    }
}
