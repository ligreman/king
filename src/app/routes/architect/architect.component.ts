import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
    cloneDeep as _cloneDeep,
    filter as _filter,
    floor as _floor,
    isEmpty as _isEmpty,
    remove as _remove,
    sortBy as _sortBy,
    sortedUniq as _sortedUniq,
    uniq as _uniq
} from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { firstValueFrom, forkJoin } from 'rxjs';
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
    loading = true;
    // Si tengo seleccionado un elemento del grafo
    selection: any = '';
    // First stabilization
    firstStabilized = false;
    // Is stabilized
    stabilized = false;
    // Show the toolbar
    showTools = false;
    expressions = true;
    // Grafo
    network;
    // Datos del API para pintar el grafo
    dataApi;
    // Las tags existentes en Kong
    allTags = [];
    // Plugins activos
    enabledPlugins = [];
    // Filtros del grafo
    netFilter = {tag: '', element: 'all', mode: true};
    // Posibles tipos de nodos que tienen acciones propias
    groupsInfo = ['service', 'route', 'upstream', 'target', 'plugin'];
    othersInfo = ['acl', 'key', 'jwt'];
    groupsEdit = ['service', 'route', 'upstream', 'consumer', 'plugin'];
    groupsDelete = ['service', 'route', 'upstream', 'consumer', 'target', 'plugin'];
    groupsAddPlugin = [];
    groupsAddTarget = ['upstream'];
    groupsHealth = ['target'];
    groupsAll = ['service', 'route', 'upstream', 'consumer', 'target', 'plugin'];

    // Datos del grafo
    data = {
        nodes: new DataSet([]),
        edges: new DataSet([])
    };

    constructor(private api: ApiService, private route: Router, private toast: ToastService, private globals: GlobalsService,
                private translate: TranslateService, private dialogHelper: DialogHelperService) {
    }

    ngOnInit(): void {
        this.dialogHelper.getRouterMode().then(() => {
            // Si no estoy en modo expressions cambio la tabla
            if (this.globals.ROUTER_MODE !== 'expressions') {
                this.expressions = false;
            }
            // Compruebo la conexión al nodo
            this.api.getNodeStatus()
                .subscribe({
                    next: () => {
                        this.dialogHelper.getRouterMode().then(() => {
                            this.loading = true;

                            this.getNodeInformation();
                            this.getTags();
                        }).catch(() => this.toast.error('error.route_mode'));
                    },
                    error: () => {
                        this.toast.error('error.node_connection');
                        this.route.navigate(['/landing']).then();
                    }
                });
        }).catch(() => this.toast.error('error.route_mode'));
    }

    ngOnDestroy(): void {}

    ngAfterViewInit() {
        // Create a network. El setTimeout es para dejar tiempo a que cargue bien el DOM
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
                    minVelocity: 1.2,
                    wind: {x: 2, y: 0},
                    barnesHut: {
                        theta: 0.8,
                        springLength: 150,
                        springConstant: 0.15,
                        avoidOverlap: 0.5
                    }
                },
                height: '80%'
            };
            if (reference) {
                options.height = (reference.offsetHeight - 55 - 2) + 'px';
                this.network = new Network(container, this.data, options);

                this.network.on('click', info => {
                    if (info.nodes.length > 0) {
                        this.selection = this.data.nodes.get(info.nodes[0]);
                    } else {
                        this.selection = '';
                    }

                    if (this.selection === null) {
                        this.selection = '';
                    }
                });

                this.network.on('doubleClick', info => {
                    if (info.nodes.length > 0) {
                        this.selection = this.data.nodes.get(info.nodes[0]);

                        // Info node
                        if (this.selection !== null && this.groupsInfo.includes(this.selection.group)) {
                            this.showInfo(this.selection);
                        }

                        // Open cluster
                        if (this.network.isCluster(info.nodes[0])) {
                            this.network.openCluster(info.nodes[0]);
                        }
                    } else {
                        this.selection = '';
                    }

                    if (this.selection === null) {
                        this.selection = '';
                    }
                });

                this.network.on('stabilized', () => {
                    if (!this.stabilized) {
                        this.stabilized = true;

                        if (!this.firstStabilized) {
                            this.network.fit();
                            this.firstStabilized = true;
                        }
                        // this.network.focus('center');
                    }
                });

                this.populateGraph();
                this.showTools = true;
            }
        }, 1500);
    }

    /**
     Llama al API y genera nodos y edges
     */
    populateGraph() {
        this.loading = true;
        this.selection = '';

        // Recojo las tags por si hay nuevas
        this.getTags();

        // Llamo al API por la información para pintar el grafo
        this.getGraphDataFromApi().subscribe((value) => {
            this.dataApi = value;
            this.filterGraphByTag();
        });
    }

    /**
     Agrupo las llamadas al API para pedir los datos del grafo
     */
    getGraphDataFromApi() {
        // Recojo del api los datos
        return forkJoin([
            this.api.getServices(),
            this.api.getRoutes(),
            this.api.getUpstreams(),
            this.api.getConsumers(),
            this.api.getPlugins()
        ]).pipe(map(([services, routes, upstreams, consumers, plugins]) => {
            // forkJoin returns an array of values, here we map those values to an object
            return {services: services['data'], routes: routes['data'], upstreams: upstreams['data'], consumers: consumers['data'], plugins: plugins['data']};
        }));
    }

    /**
     * Obtiene la información del nodo
     */
    getNodeInformation() {
        this.api.getNodeInformation()
            .subscribe({
                next: (res) => {
                    // Recojo los plugins activos para habilitar las secciones
                    this.enabledPlugins = res['plugins']['enabled_in_cluster'];
                },
                error: () => this.toast.error('error.node_connection')
            });
    }

    /**
     * Obtiene todas las tags que existen en Kong
     */
    getTags() {
        this.api.getTags()
            .subscribe((res) => {
                // Recojo las tags
                res['data'].forEach(data => {
                    this.allTags.push(data.tag);
                });
                this.allTags.sort();
                this.allTags = _sortedUniq(this.allTags);
            });
    }

    /**
     * Comprueba que un plugin esté activo
     * @param plugin Nombre del plugin
     */
    isPluginActive(plugin) {
        return this.enabledPlugins.includes(plugin);
    }


    /**
     Filtra el grafo por la etiqueta elegida
     */
    filterGraphByTag() {
        const tags = this.netFilter.tag;
        let newData;

        if (tags === '') {
            newData = _cloneDeep(this.dataApi);
        } else {
            let theTags = tags.split(',');
            theTags = _uniq(theTags);
            theTags = theTags.map(value => value.trim());
            newData = {services: [], routes: [], upstreams: [], plugins: [], consumers: []};

            // AND
            if (this.netFilter.mode) {
                newData.services = newData.services.concat(_filter(this.dataApi.services, {tags: theTags}));
                newData.routes = newData.routes.concat(_filter(this.dataApi.routes, {tags: theTags}));
                newData.upstreams = newData.upstreams.concat(_filter(this.dataApi.upstreams, {tags: theTags}));
                newData.consumers = newData.consumers.concat(_filter(this.dataApi.consumers, {tags: theTags}));
                newData.plugins = newData.plugins.concat(_filter(this.dataApi.plugins, {tags: theTags}));
            }
            // OR
            else {
                theTags.forEach(tag => {
                    newData.services = newData.services.concat(_filter(this.dataApi.services, {tags: [tag]}));
                    newData.routes = newData.routes.concat(_filter(this.dataApi.routes, {tags: [tag]}));
                    newData.upstreams = newData.upstreams.concat(_filter(this.dataApi.upstreams, {tags: [tag]}));
                    newData.consumers = newData.consumers.concat(_filter(this.dataApi.consumers, {tags: [tag]}));
                    newData.plugins = newData.plugins.concat(_filter(this.dataApi.plugins, {tags: [tag]}));
                });

                // Elimino duplicados
                newData.services = _uniq(newData.services);
                newData.routes = _uniq(newData.routes);
                newData.upstreams = _uniq(newData.upstreams);
                newData.consumers = _uniq(newData.consumers);
                newData.plugins = _uniq(newData.plugins);
            }
        }

        // Filtro de elementos a mostrar
        if (this.netFilter.element === 'mainonly') {
            // Elimino consumers y plugins
            newData.consumers = [];
            newData.plugins = [];
        }

        // Ahora construyo los nodos y edges del grafo
        this.createGraphNodesAndEdges(newData).then(() => {
            // Marco el grafo como estabilidazo y termino de cargarlo
            this.stabilized = false;
            this.loading = false;
        });
    }

    /**
     Calculo los datos de nodos y edges del grafo
     */
    async createGraphNodesAndEdges(data) {
        // Limpio el grafo
        this.data.nodes.clear();
        this.data.edges.clear();

        // Variable para guardar los upstream con padre
        let upstreamsWithParent = [];

        // Genero el nodo central del grafo
        const element = generateElement([this.translate.instant('text.kong_node'), this.globals.NODE_API_URL]);
        this.data.nodes.add({
            id: 'center',
            x: 0,
            y: 0,
            title: element,
            label: this.globals.NODE_API_URL,
            group: 'kong'
        });

        // Recorro los servicios creando los nodos de servicios
        for (let service of data.services) {
            const scolor = service.enabled ? '#CCCCCC' : '#E53935';
            // Nodos de Servicio
            this.data.nodes.add({
                id: service.id,
                label: service.name + '\n' + service.protocol + '://' + service.host + ':' + service.port + service.path,
                title: this.translate.instant('service.label') + ': ' + service.id,
                group: 'service',
                data: service,
                font: {color: scolor}
            });

            // Si el host de este servicio se corresponde con el name de un Upstream, edge
            const serviceUpstream = _filter(data.upstreams, {name: service.host});
            if (serviceUpstream.length > 0) {
                for (const up of serviceUpstream) {
                    upstreamsWithParent.push(up.id);

                    // Si no he generado previamente el nodo de upstream ya
                    if (this.data.nodes.get(up.id) === null) {
                        // Health del upstream
                        let hu;
                        try {
                            hu = await firstValueFrom(this.api.getUpstreamHealth(up.id));
                        } catch (err) {
                            this.toast.error('error.get_data');
                        } finally {
                            if (!hu['data'] || !hu['data'].health) {
                                hu = {data: {health: 'UNKNOWN'}};
                            }
                        }
                        const hc = this.getHealthData(hu['data'].health);

                        // nodo del upstream
                        const element = generateElement(['Upstream: ' + up.id, this.translate.instant('upstream.dialog.algorithm') + ': ' + up.algorithm, hc['label']]);
                        this.data.nodes.add({
                            id: up.id,
                            label: up.name,
                            title: element,
                            group: 'upstream',
                            data: up,
                            font: {color: hc['color']}
                        });
                    }

                    // Edge desde el servicio al upstream
                    this.data.edges.add({
                        from: service.id,
                        to: up.id,
                        width: 2
                    });

                    // Busco los targets del upstream
                    const targets = await firstValueFrom(this.api.getTargets(up.id));

                    // Por cada target creo un nodo
                    for (const target of targets['data']) {
                        // Health del upstream
                        const ht = await firstValueFrom(this.api.getUpstreamTargetsHealth(up.id));
                        let htc = {};
                        // Busco el target concreto
                        ht['data'].forEach(tg => {
                            if (tg.id === target.id) {
                                htc = this.getHealthData(tg.health);
                            }
                        });

                        const element = generateElement(['Target: ' + target.id, this.translate.instant('target.dialog.weight') + ': ' + target.weight, htc['label']]);
                        this.data.nodes.add({
                            id: target.id,
                            label: target.target,
                            title: element,
                            group: 'target',
                            data: target,
                            font: {color: htc['color']}
                        });

                        // Edge del upstream al target
                        this.data.edges.add({
                            from: up.id,
                            to: target.id,
                            width: 2
                        });
                    }
                }
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

        // Ordeno las rutas por nombre de ruta
        const allRoutes = _sortBy(data.routes, ['name']);
        const par = (allRoutes.length % 2) === 0;
        const half = _floor(allRoutes.length / 2);
        // Contador de rutas
        let dist = half * -150, routeCounter = 1;

        // Recorro las rutas creando los nodos de rutas
        for (let route of allRoutes) {
            let extras = [this.translate.instant('route.label') + ': ' + route.id];
            // Label
            let lbl = '';

            // Dependiendo del modo de router, el label y los extras será uno u otro
            if (this.globals.ROUTER_MODE === 'expressions') {
                if (!_isEmpty(route.expression)) {
                    extras.push(this.translate.instant('route.dialog.expression') + ': ' + route.expression);
                    lbl = route.expression;
                }
            } else {
                if (!_isEmpty(route.methods)) {
                    extras.push(this.translate.instant('route.dialog.methods') + ': ' + route.methods.join(', '));
                }
                if (!_isEmpty(route.hosts)) {
                    extras.push(this.translate.instant('route.dialog.hosts') + ': ' + route.hosts.join(', '));
                }
                if (!_isEmpty(route.paths)) {
                    extras.push(this.translate.instant('route.dialog.paths') + ': ' + route.paths.join(', '));
                    lbl = route.paths.join(', ');
                }
                if (!_isEmpty(route.headers)) {
                    extras.push(this.translate.instant('route.dialog.headers') + ': ' + JSON.stringify(route.headers));
                }
            }

            // Nodos de ruta
            const element = generateElement(extras);
            this.data.nodes.add({
                id: route.id,
                label: route.name + '\n' + lbl + '\n[' + route.protocols.join(', ') + ']',
                title: element,
                group: 'route',
                x: 300,
                y: dist,
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

            // Genero un nodo de inicio para esta ruta
            this.data.nodes.add({
                id: 'route-start-' + routeCounter,
                group: 'routeStart',
                x: 150,
                y: dist
            });
            // Edge de la ruta al nodo inicial propio de su ruta
            this.data.edges.add({
                from: 'route-start-' + routeCounter,
                to: route.id,
                length: 1,
                arrows: {to: {enabled: false}}
            });
            // Edge del nodo central de Kong al inical de esta ruta
            this.data.edges.add({
                from: 'center',
                to: 'route-start-' + routeCounter,
                smooth: false,
                width: 2,
                arrows: {to: {enabled: false}}
            });
            routeCounter++;

            // Añado distancia al nodo
            dist += 150;
            // Si el número de rutas es par, no pongo ninguna en el punto 0 del eje y
            if (dist === 0 && par) {
                dist += 150;
            }
        }

        // Preparo la información de los nodos de consumidor aunque no los creo aún
        let consumerList = {}, consumerNodesCreated = [];
        for (let consumer of data.consumers) {
            let extrasC = [this.translate.instant('consumer.label') + ': ' + consumer.id];
            if (!_isEmpty(consumer.username)) {
                extrasC.push(this.translate.instant('consumer.dialog.username') + ': ' + consumer.username);
            }
            if (!_isEmpty(consumer.custom_id)) {
                extrasC.push(this.translate.instant('consumer.dialog.custom_id') + ': ' + consumer.custom_id);
            }

            // Nodos de consumidor
            const element = generateElement(extrasC);

            // Recojo en una lista los consumidores existentes
            consumerList[consumer.id] = {
                id: consumer.id,
                label: consumer.username || consumer.custom_id,
                title: element,
                group: 'consumer',
                data: consumer
            };
        }

        // Creo los nodos de plugin
        for (let plugin of data.plugins) {
            let extrasC = [this.translate.instant('plugin.label') + ': ' + plugin.id];
            let pluginEdges = [];

            if (plugin.route && !_isEmpty(plugin.route.id)) {
                extrasC.push(this.translate.instant('route.label') + ': ' + plugin.route.id);
                pluginEdges.push(plugin.route.id);
            }
            if (plugin.service && !_isEmpty(plugin.service.id)) {
                extrasC.push(this.translate.instant('service.label') + ': ' + plugin.service.id);
                pluginEdges.push(plugin.service.id);
            }
            if (plugin.consumer && !_isEmpty(plugin.consumer.id)) {
                extrasC.push(this.translate.instant('consumer.label') + ': ' + plugin.consumer.id);
                pluginEdges.push(plugin.id + '#' + plugin.consumer.id);

                // Creo el nodo del consumidor
                const theConsumer = consumerList[plugin.consumer.id];
                this.data.nodes.add({
                    id: plugin.id + '#' + theConsumer.id,
                    consumerId: theConsumer.id,
                    label: theConsumer.label,
                    title: theConsumer.title,
                    group: theConsumer.group,
                    data: theConsumer.data
                });
                consumerNodesCreated.push(plugin.consumer.id);
            }

            // Plugin activo?
            const color = plugin.enabled ? '#7FCA33' : '#E53935';

            // Nodos de plugin
            const element = generateElement(extrasC);
            this.data.nodes.add({
                id: plugin.id,
                label: plugin.name,
                title: element,
                group: 'plugin',
                data: plugin,
                font: {color: color}
            });

            // Si el plugin tiene establecido el campo route, service o consumer, creo los edges para enlazar
            pluginEdges.forEach(edge => {
                this.data.edges.add({
                    from: plugin.id,
                    to: edge,
                    data: 'plugin'
                });
            });
        }

        // Ahora sí creo los nodos consumidores que no haya creado asociados a los plugin
        for (let consu in consumerList) {
            // si no he creado el nodo aún
            if (consumerList.hasOwnProperty(consu) && !consumerNodesCreated.includes(consu)) {
                const thisConsu = consumerList[consu];
                this.data.nodes.add({
                    id: thisConsu.id,
                    consumerId: thisConsu.id,
                    label: thisConsu.label,
                    title: thisConsu.title,
                    group: thisConsu.group,
                    data: thisConsu.data
                });
            }
        }

        // Ahora voy a enganchar al center los nodos que hayan quedado sueltos
        // Recojo todos los ids de edges
        let edgesTos = ['center'];
        this.data.edges.forEach(edge => {
            edgesTos.push(edge.to);

            // Caso particular para los plugin, si están enganchados a algo no necesitan to, así que añado los from en este caso
            if (edge.data && edge.data === 'plugin') {
                edgesTos.push(edge.from);
            }
        });

        // Si el nodo no tiene un edge que vaya a él (un to), pues lo engancho con el centro
        this.data.nodes.forEach(node => {
            // pero no para los nodos starter de route
            if (!edgesTos.includes(node.id) && node.group !== 'routeStart') {
                this.data.edges.add({
                    from: 'center',
                    to: node.id,
                    arrows: {to: {enabled: false}}
                });
            }
        });

        // Por último, genero los nodos upstream huérfanos y los engancho al centro
        for (let upstream of data.upstreams) {
            // miro si el up ya tiene padre
            if (!upstreamsWithParent.includes(upstream.id)) {
                // Le creo un nodo
                this.data.nodes.add({
                    id: upstream.id,
                    label: upstream.name,
                    title: this.translate.instant('upstream.orphan'),
                    group: 'upstream',
                    data: upstream
                });

                // Engancho con el centro
                this.data.edges.add({
                    from: 'center',
                    to: upstream.id,
                    arrows: {to: {enabled: false}}
                });
            }
        }

        // this.clusterConsumers();
    }

    fitNetwork() {
        this.network.fit({animation: {duration: 1000}});
        // this.network.focus('center');
    }

    /**
     * Obtiene los nodos conectados con otro
     * @param nodeId
     */
    getNodesConnectedTo(nodeId) {
        let nodes = [];

        let aux = this.network.getConnectedNodes(nodeId, 'to');
        aux.forEach(nodeId => {
            nodes.push(nodeId);

            nodes = nodes.concat(this.getNodesConnectedTo(nodeId));
        });

        return nodes;
    }

    /**
     Alta edición general
     */
    addEdit(selected = null, group) {
        switch (group) {
            case 'rsu':
                this.addEditRSU(selected);
                break;
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

    /**
     Añade una ruta + servicio + upstream nuevos
     */
    addEditRSU(selected = null) {
        this.dialogHelper.addEdit(selected, 'rsu')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {});
    }

    /**
     Añade un servicio nuevo
     */
    addEditService(selected = null) {
        this.dialogHelper.addEdit(selected, 'service')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {});
    }

    /**
     Añade una ruta nueva
     */
    addEditRoute(selected = null) {
        this.dialogHelper.addEdit(selected, 'route')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {});
    }

    /**
     Añade un upstream nuevo
     */
    addEditUpstream(selected = null) {
        this.dialogHelper.addEdit(selected, 'upstream')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {});
    }

    /**
     Añade un consumidor nuevo
     */
    addEditConsumer(selected = null) {
        this.dialogHelper.addEdit(selected, 'consumer')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {});
    }

    /**
     Añade un Plugin
     */
    addEditPlugin(selected = null) {
        this.dialogHelper.addEdit(selected, 'plugin')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {});
    }

    /**
     Añade un Target
     */
    addTarget(selected = null) {
        this.dialogHelper.addEdit(selected, 'target')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {});
    }

    /**
     Pone el target en estado sano
     */
    setTargetHealthy(selected = null) {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('target.set_healthy_title'),
                name: selected.data.target,
                id: selected.data.id,
                content: this.translate.instant('target.set_healthy_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.putSetTargetHealthy(selected.data.id, selected.data.upstream.id)
                    .subscribe({
                        next: () => {
                            this.toast.success('success.healthy_target', '', {msgExtra: selected.data.id});
                            this.populateGraph();
                        },
                        error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                    });
            })
            .catch(() => {});
    }

    /**
     Pone el target en estado erróneo
     */
    setTargetUnhealthy(selected = null) {
        this.dialogHelper
            .confirm({
                title: this.translate.instant('target.set_unhealthy_title'),
                name: selected.data.target,
                id: selected.data.id,
                content: this.translate.instant('target.set_unhealthy_content')
            })
            .then(() => {
                // Ha aceptado el confirm, así que ejecuto
                this.api.putSetTargetUnhealthy(selected.data.id, selected.data.upstream.id)
                    .subscribe({
                        next: () => {
                            this.toast.success('success.unhealthy_target', '', {msgExtra: selected.data.id});
                            this.populateGraph();
                        },
                        error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                    });
            })
            .catch(() => {});
    }

    /**
     Muestra la info del elemento seleccionado
     */
    showInfo(select) {
        if (this.groupsInfo.includes(select.group) || this.othersInfo.includes(select.group)) {
            this.dialogHelper.showInfoElement(select, select.group);
        }
    }

    /**
     Borra el elemento seleccionado
     */
    delete(select) {
        if (this.groupsDelete.includes(select.group)) {
            select.data['consumerId'] = select.consumerId;
            this.dialogHelper.deleteElement(select.data, select.group)
                .then(() => {
                    this.populateGraph();
                })
                .catch(() => {});
        }
    }

    /**
     * Crea un mensaje con la información de salud
     * @param health
     */
    getHealthData(health) {
        let data = {};

        switch (health) {
            case 'DNS_ERROR':
            case 'UNHEALTHY':
                data['color'] = '#E53935';
                break;
            case 'HEALTHY':
                data['color'] = '#7FCA33';
                break;
            case 'UNKNOWN':
                data['color'] = '#999999';
                break;
        }

        data['label'] = this.translate.instant('text.health') + ': ' + this.translate.instant('target.health_' + health);

        return data;
    }

    /**
     * Clusteriza los nodos de consumidores
     */
    clusterConsumers() {
        // Count number of consumers
        const num = this.dataApi.consumers.length;

        const clusterOptionsByData = {
            // Rules for clustering
            joinCondition: function (childOptions) {
                return childOptions.group === 'consumer';
            },
            clusterNodeProperties: {
                id: 'consumers-cluster',
                group: 'consumerCluster',
                label: num + ' ' + this.translate.instant('architect.cluster_consumers'),
                title: this.translate.instant('architect.cluster_title')
            }
        };
        this.network.cluster(clusterOptionsByData);
    }

    /**
     * Ordena filtrar el grafo por unos valores concretos de etiqueta
     * @param selection
     */
    filterTag(selection) {
        this.netFilter.tag = selection.data.tags.join(',');
        this.netFilter.element = 'all';
        this.netFilter.mode = true;
        this.filterGraphByTag();
    }

    /**
     * Limpia los filtros
     */
    cleanFilters() {
        this.netFilter.tag = '';
        this.netFilter.element = 'all';
        this.netFilter.mode = true;
        this.filterGraphByTag();
    }

    /**
     * Añade una tag a los filtros
     */
    addTagFilter(tag: any) {
        let newTags = this.netFilter.tag.split(',');
        newTags.push(tag);

        newTags = _remove(newTags, function (n) {
            return n !== '';
        });

        this.filterTag({
            data: {
                tags: newTags
            }
        });
    }

    /**
     * Trocea una tag por longitud
     */
    chopTag(tag: any, length: number) {
        return tag.match(new RegExp('.{1,' + length + '}', 'g'));
    }
}

/**
 * Create an HTML div block
 */
function generateElement(arrayOfP) {
    const element = document.createElement('div');

    arrayOfP.forEach(text => {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(text));
        p.setAttribute('style', 'margin:0 !important');
        element.appendChild(p);
    });

    return element;
}
