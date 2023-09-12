import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {
    cloneDeep as _cloneDeep,
    filter as _filter,
    floor as _floor,
    isEmpty as _isEmpty,
    sortBy as _sortBy,
    sortedUniq as _sortedUniq
} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {firstValueFrom, forkJoin, ReplaySubject, Subject, takeUntil} from 'rxjs';
import {map} from 'rxjs/operators';
import {DataSet, Network} from 'vis-network/standalone';
import {ApiService} from '../../services/api.service';
import {DialogHelperService} from '../../services/dialog-helper.service';
import {GlobalsService} from '../../services/globals.service';
import {ToastService} from '../../services/toast.service';
import {FormControl} from "@angular/forms";
import {MatSelect} from "@angular/material/select";

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
    // Tags que son de clusterizado
    clusterTags = [];
    // Última tag desclusterizada para mantenerla en sucesivos refrescos del grafo
    lastDeclusteredTag = '';
    // Usar clusters en el grafo
    clusterize = true;
    // Plugins activos
    enabledPlugins = [];
    // Filtros del grafo
    graphFilter = {tag: '', element: 'all', mode: false};
    // Posibles tipos de nodos que tienen acciones propias
    groupsInfo = ['service', 'route', 'upstream', 'target', 'plugin'];
    othersInfo = ['acl', 'key', 'jwt'];
    groupsEdit = ['service', 'route', 'upstream', 'consumer', 'plugin'];
    groupsDelete = ['service', 'route', 'upstream', 'consumer', 'target', 'plugin'];
    groupsAddPlugin = ['service', 'route', 'consumer'];
    groupsAddTarget = ['upstream'];
    groupsHealth = ['target'];
    groupsAll = ['service', 'route', 'upstream', 'consumer', 'target', 'plugin'];
    distRouterStep = 175;
    distConsumerStep = 75;
    lastPosition = {scale: 1, position: {x: 0, y: 0}};

    // Datos del grafo
    data = {
        nodes: new DataSet([]),
        edges: new DataSet([])
    };

    // TAGS
    tagSubscription = null;
    /** control for the selected tags for multi-selection */
    public tagSelectedCtrl: FormControl<string[]> = new FormControl<string[]>([]);

    /** control for the MatSelect filter keyword multi-selection */
    public tagFilterCtrl: FormControl<string> = new FormControl<string>('');
    /** list of available tags filtered by the filter control */
    public tagFilteredList: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);

    @ViewChild('multiSelect', {static: true}) multiSelect: MatSelect;

    protected _onDestroy = new Subject<void>();

    constructor(private api: ApiService, private route: Router, private toast: ToastService, private globals: GlobalsService,
                private translate: TranslateService, private dialogHelper: DialogHelperService) {
        const lastFilters = localStorage.getItem('kongLastFilters');
        if (lastFilters && lastFilters !== '') {
            try {
                this.graphFilter = JSON.parse(lastFilters);
                this.tagSelectedCtrl.setValue(this.graphFilter.tag.split('###'));
            } catch (e) {
            }
        }

        this.clusterize = (localStorage.getItem('kongClusteredPref') === 'false' ? false : true);
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

    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

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
                    maxVelocity: 100,
                    minVelocity: 1.5,
                    wind: {x: 2, y: 0},
                    barnesHut: {
                        theta: 0.8,
                        springLength: 150,
                        springConstant: 0.15,
                        avoidOverlap: 0.5
                    },
                    timestep: 0.75
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
                        // Open cluster
                        if (this.network.isCluster(info.nodes[0])) {
                            this.selection = '';
                            this.lastDeclusteredTag = info.nodes[0].replace('api-cluster-', '');
                            this.network.openCluster(info.nodes[0]);
                        } else {
                            this.selection = this.data.nodes.get(info.nodes[0]);

                            // Info node
                            if (this.selection !== null && this.groupsInfo.includes(this.selection.group)) {
                                this.showInfo(this.selection);
                            }
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

                        // Primera vez que se crea el grafo
                        if (!this.firstStabilized) {
                            this.network.fit();
                            this.firstStabilized = true;

                            setTimeout(() => {
                                // Guardo la posición
                                this.lastPosition.scale = this.network.getScale();
                                this.lastPosition.position = this.network.getViewPosition();
                            }, 2000);
                        } else {
                            // Si había posición guardada la recupero
                            this.network.moveTo(this.lastPosition);
                        }
                        // this.network.focus('center');
                    }
                });

                this.populateGraph(false);
                this.showTools = true;


                if (this.graphFilter.element === 'untagged') {
                    this.tagSelectedCtrl.disable();
                }
            }
        }, 1500);
    }

    /**
     Llama al API y genera nodos y edges
     */
    populateGraph(loadTags = true) {
        // Solo cargo datos en el grafo si estoy filtrando por etiquetas
        if (!this.isTagfilterEmpty()) {
            this.loading = true;
            this.selection = '';

            // Guardo la posición
            this.lastPosition.scale = this.network.getScale();
            this.lastPosition.position = this.network.getViewPosition();

            // Recojo las tags por si hay nuevas
            if (loadTags) {
                this.getTags();
            }

            // Llamo al API por la información para pintar el grafo
            this.getGraphDataFromApi().subscribe((value) => {
                this.dataApi = value;
                this.filterGraphByTag();
            });
        } else {
            this.loading = false;
        }
    }

    /**
     Agrupo las llamadas al API para pedir los datos del grafo
     */
    getGraphDataFromApi() {
        let tags = null;
        if (!this.isTagfilterEmpty()) {
            tags = this.tagSelectedCtrl.value.slice();
        }

        // ¿Estoy buscando los elementos sin tag?
        if (this.graphFilter.element === 'untagged') {
            tags = null;
        }

        // Recojo del api los datos
        return forkJoin([
            this.api.getAllServices(null, [], [], tags, this.graphFilter.mode),
            this.api.getAllRoutes(null, [], [], tags, this.graphFilter.mode),
            this.api.getAllUpstreams(null, [], [], tags, this.graphFilter.mode),
            this.api.getAllConsumers(null, [], [], tags, this.graphFilter.mode),
            this.api.getAllPlugins(null, [], [], tags, this.graphFilter.mode)
        ]).pipe(map<any, any>(([services, routes, upstreams, consumers, plugins]) => {
            // forkJoin returns an array of values, here we map those values to an object
            return {
                services: services['data'],
                routes: routes['data'],
                upstreams: upstreams['data'],
                consumers: consumers['data'],
                plugins: plugins['data']
            };
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

    isTagfilterEmpty() {
        return !(this.tagSelectedCtrl.value.length > 0 && this.tagSelectedCtrl.value[0] !== '');
    }

    /**
     * Obtiene todas las tags que existen en Kong
     */
    getTags() {
        this.api.getTags()
            .subscribe((res) => {
                // Recojo las tags
                res['data'].forEach(data => {
                    // Me quedo con los cluster tags para generar los nodos del grafo
                    if (data.tag.startsWith('c-')) {
                        this.clusterTags.push(data.tag);
                    }
                    this.allTags.push(data.tag);
                });
                this.allTags.sort();
                this.allTags = _sortedUniq(this.allTags);
                this.tagFilteredList.next(this.allTags.slice());

                if (this.tagSubscription) {
                    this.tagSubscription.unsubscribe();
                }

                // listen for search field value changes
                this.tagSubscription = this.tagFilterCtrl.valueChanges
                    .pipe(takeUntil(this._onDestroy))
                    .subscribe(() => {
                        if (!this.allTags) {
                            return;
                        }
                        // get the search keyword
                        let search = this.tagFilterCtrl.value;
                        if (!search) {
                            this.tagFilteredList.next(this.allTags.slice());
                            return;
                        } else {
                            search = search.toLowerCase();
                        }
                        // filter the tags
                        this.tagFilteredList.next(
                            this.allTags.filter(tag => tag.toLowerCase().indexOf(search) > -1)
                        );
                    });
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
        let newData = _cloneDeep(this.dataApi);

        // Filtro de elementos a mostrar
        if (this.graphFilter.element === 'mainonly') {
            // Elimino consumers y plugins
            newData.consumers = [];
            newData.plugins = [];
        }

        // Filtro los elementos para dejar solo los que no tengan etiquetas
        if (this.graphFilter.element === 'untagged') {
            // Me quedo sólo con los primeros 500 elementos de cada uno, y si me paso pongo mensaje
            if (this.dataApi.services.length > 500 || this.dataApi.routes.length > 500 || this.dataApi.upstreams.length > 500 || this.dataApi.plugins.length > 500 || this.dataApi.consumers.length > 500) {
                this.toast.info('architect.there_are_more', '',{timeOut: 8000, extendedTimeOut: 15000});
            }

            newData.services = this.dataApi.services.slice(0, 500);
            newData.routes = this.dataApi.routes.slice(0, 500);
            newData.upstreams = this.dataApi.upstreams.slice(0, 500);
            newData.consumers = this.dataApi.consumers.slice(0, 500);
            newData.plugins = this.dataApi.plugins.slice(0, 500);
            newData.services = _filter(newData.services, function (o) {
                return (o.tags === undefined || o.tags === null || o.tags.length === 0)
            });
            newData.routes = _filter(newData.routes, function (o) {
                return (o.tags === undefined || o.tags === null || o.tags.length === 0)
            });
            newData.upstreams = _filter(newData.upstreams, function (o) {
                return (o.tags === undefined || o.tags === null || o.tags.length === 0)
            });
            newData.consumers = _filter(newData.consumers, function (o) {
                return (o.tags === undefined || o.tags === null || o.tags.length === 0)
            });
            newData.plugins = _filter(newData.plugins, function (o) {
                return (o.tags === undefined || o.tags === null || o.tags.length === 0)
            });
        }

        this.graphFilter.tag = this.tagSelectedCtrl.value.join('###');
        const filterJson = JSON.stringify(this.graphFilter);
        localStorage.setItem('kongLastFilters', filterJson);

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
            group: 'kong'
        });

        // Recorro los servicios creando los nodos de servicios
        for (let service of data.services) {
            const scolor = service.enabled ? '#CCCCCC' : '#E53935';
            let sLabel = service.name + '\n' + service.protocol + '://' + service.host + ':' + service.port;
            if (service.path && service.path !== '') {
                sLabel += service.path;
            }

            // Nodos de Servicio
            this.data.nodes.add({
                id: service.id,
                label: sLabel,
                title: this.translate.instant('service.label') + ': ' + service.id + '\n' + this.translate.instant('architect.labels') + ': ' + joiner(service.tags, ', '),
                group: 'service',
                x: 450,
                y: 0,
                data: service,
                font: {color: scolor}
            });

            // Si el host de este servicio se corresponde con el name de un Upstream, edge
            const serviceUpstream = _filter(data.upstreams, {name: service.host});
            if (serviceUpstream.length > 0) {
                for (const up of serviceUpstream) {
                    let upstreamJustCreated = false;
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
                        const element = generateElement(['Upstream: ' + up.id, this.translate.instant('upstream.dialog.algorithm') + ': ' + up.algorithm, hc['label'], this.translate.instant('architect.labels') + ': ' + joiner(up.tags, ', ')]);
                        this.data.nodes.add({
                            id: up.id,
                            label: up.name,
                            title: element,
                            group: 'upstream',
                            data: up,
                            font: {color: hc['color']}
                        });
                        upstreamJustCreated = true;
                    }

                    // Edge desde el servicio al upstream
                    this.data.edges.add({
                        from: service.id,
                        to: up.id,
                        width: 2,
                        background: {
                            enabled: true,
                            color: 'rgba(56,142,60,0.2)',
                            size: 6
                        }
                    });

                    // Si no he generado previamente el nodo de upstream ya o lo acabo de crear, genero también los targets
                    if (this.data.nodes.get(up.id) === null || upstreamJustCreated) {
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

                            const element = generateElement(['Target: ' + target.id, this.translate.instant('target.dialog.weight') + ': ' + target.weight, htc['label'], this.translate.instant('architect.labels') + ': ' + joiner(target.tags, ', ')]);
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
                                width: 2,
                                dashes: [2, 4],
                                arrows: {to: {enabled: false}},
                                background: {
                                    enabled: true,
                                    color: 'rgba(245,124,0,0.2)',
                                    size: 6,
                                    dashes: [2, 4]
                                }
                            });
                        }
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
                    width: 2,
                    dashes: [2, 4],
                    arrows: {to: {enabled: false}},
                    background: {
                        enabled: true,
                        color: 'rgba(56,142,60,0.2)',
                        size: 6,
                        dashes: [2, 4]
                    }
                });
            }
        }

        // Ordeno las rutas por nombre de ruta
        const allRoutes = _sortBy(data.routes, ['name']);
        const par = (allRoutes.length % 2) === 0;
        const half = _floor(allRoutes.length / 2);
        // Contador de rutas
        let distRoutes = half * -this.distRouterStep, routeCounter = 1;

        // Recorro las rutas creando los nodos de rutas
        for (let route of allRoutes) {
            let extras = [this.translate.instant('route.label') + ': ' + route.id];
            // Label
            let lbl = '', prefix = '';

            // Dependiendo del modo de router, el label y los extras será uno u otro
            if (this.globals.ROUTER_MODE === 'expressions') {
                if (!_isEmpty(route.expression)) {
                    extras.push(this.translate.instant('route.dialog.expression') + ': ' + route.expression);
                    extras.push(this.translate.instant('route.dialog.priority') + ': ' + route.priority);
                    lbl = route.expression;
                    prefix = route.priority + ' - ';
                }
            } else {
                if (!_isEmpty(route.methods)) {
                    extras.push(this.translate.instant('route.dialog.methods') + ': ' + joiner(route.methods, ', '));
                }
                if (!_isEmpty(route.hosts)) {
                    extras.push(this.translate.instant('route.dialog.hosts') + ': ' + joiner(route.hosts, ', '));
                }
                if (!_isEmpty(route.paths)) {
                    extras.push(this.translate.instant('route.dialog.paths') + ': ' + joiner(route.paths, ', '));
                    lbl = joiner(route.paths, ', ');
                }
                if (!_isEmpty(route.headers)) {
                    extras.push(this.translate.instant('route.dialog.headers') + ': ' + JSON.stringify(route.headers));
                }
                if (!_isEmpty(route.regex_priority)) {
                    extras.push(this.translate.instant('route.dialog.regex_priority') + ': ' + route.regex_priority);
                    prefix = route.regex_priority + ' - ';
                }
            }

            // Nodos de ruta
            extras.push(this.translate.instant('architect.labels') + ': ' + joiner(route.tags, ', '));
            const element = generateElement(extras);
            this.data.nodes.add({
                id: route.id,
                label: route.name + '\n' + lbl + '\n' + prefix + '[' + joiner(route.protocols, ', ') + ']',
                title: element,
                group: 'route',
                x: 300,
                y: distRoutes,
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
                        width: 3,
                        background: {
                            enabled: true,
                            color: 'rgba(2,136,209,0.2)',
                            size: 6
                        }
                    });
                }
            }

            // Genero un nodo de inicio para esta ruta
            this.data.nodes.add({
                id: 'route-start-' + routeCounter,
                group: 'routeStart',
                x: 150,
                y: distRoutes
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
            distRoutes += this.distRouterStep;
            // Si el número de rutas es par, no pongo ninguna en el punto 0 del eje y
            if (distRoutes === 0 && par) {
                distRoutes += this.distRouterStep;
            }
        }

        // Preparo la información de los nodos de consumidor aunque no los creo aún
        let consumerList = {};
        for (let consumer of data.consumers) {
            let extrasC = [this.translate.instant('consumer.label') + ': ' + consumer.id];
            if (!_isEmpty(consumer.username)) {
                extrasC.push(this.translate.instant('consumer.dialog.username') + ': ' + consumer.username);
            }
            if (!_isEmpty(consumer.custom_id)) {
                extrasC.push(this.translate.instant('consumer.dialog.custom_id') + ': ' + consumer.custom_id);
            }

            // Nodos de consumidor
            extrasC.push(this.translate.instant('architect.labels') + ': ' + joiner(consumer.tags, ', '));
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
            let extrasP = [
                this.translate.instant('plugin.label') + ': ' + plugin.id,
                this.translate.instant('plugin.dialog.name') + ': ' + plugin.name
            ];
            let pluginEdges = [];

            if (plugin.instance_name) {
                extrasP.push(this.translate.instant('plugin.dialog.alias') + ': ' + plugin.instance_name);
            }
            if (plugin.route && !_isEmpty(plugin.route.id)) {
                extrasP.push(this.translate.instant('route.label') + ': ' + plugin.route.id);
                pluginEdges.push(plugin.route.id);
            }
            if (plugin.service && !_isEmpty(plugin.service.id)) {
                extrasP.push(this.translate.instant('service.label') + ': ' + plugin.service.id);
                pluginEdges.push(plugin.service.id);
            }
            if (plugin.consumer && !_isEmpty(plugin.consumer.id)) {
                extrasP.push(this.translate.instant('consumer.label') + ': ' + plugin.consumer.id);
                pluginEdges.push(plugin.consumer.id);
            }

            // Plugin activo?
            const color = plugin.enabled ? '#7FCA33' : '#E53935';

            // Nodos de plugin
            extrasP.push(this.translate.instant('architect.labels') + ': ' + joiner(plugin.tags, ', '));
            const element = generateElement(extrasP);

            // Nombre
            let thePName = '(' + plugin.name + ')';
            if (plugin.instance_name) {
                thePName += ' ' + plugin.instance_name;
            }

            this.data.nodes.add({
                id: plugin.id,
                label: thePName,
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
                    data: 'plugin',
                    dashes: [10, 10],
                    arrows: {to: {type: 'circle', scaleFactor: 0.5}}
                });
            });
        }

        /************** CONSUMIDORES ***********************/
        const halfC = _floor(Object.keys(consumerList).length / 2);
        // Contador de rutas
        let distConsumers = halfC * -this.distConsumerStep;
        // Ahora sí creo los nodos consumidores que no haya creado asociados a los plugin
        for (let consuId in consumerList) {
            // si no he creado el nodo aún
            if (consumerList.hasOwnProperty(consuId)) {
                const thisConsu = consumerList[consuId];
                this.data.nodes.add({
                    id: thisConsu.id,
                    consumerId: thisConsu.id,
                    label: thisConsu.label,
                    title: thisConsu.title,
                    group: thisConsu.group,
                    data: thisConsu.data,
                    x: -200,
                    y: distConsumers,
                    fixed: {x: true, y: true}
                });
            }

            // Añado distancia al nodo
            distConsumers += this.distConsumerStep;
        }

        // Ahora voy a enganchar al center los nodos que hayan quedado sueltos
        // Recojo todos los ids de edges
        let edgesTos = ['center'];
        this.data.edges.forEach(edge => {
            // Caso particular para los plugin, si están enganchados a algo no necesitan to, así que añado los from
            if (edge.data && edge.data === 'plugin') {
                edgesTos.push(edge.from);
            } else {
                edgesTos.push(edge.to);
            }
        });

        // Si el nodo no tiene un edge que vaya a él (un to), pues lo engancho con el centro
        this.data.nodes.forEach(node => {
            // pero no para los nodos starter de route.
            if (!edgesTos.includes(node.id) && node.group !== 'routeStart') {
                this.data.edges.add({
                    from: 'center',
                    to: node.id,
                    arrows: {to: {enabled: false}},
                    dashes: [10, 10, 1, 10]
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
                    title: this.translate.instant('upstream.orphan') + '\n' + this.translate.instant('architect.labels') + ': ' + joiner(upstream.tags, ', '),
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

        if (this.clusterize) {
            this.clusterConsumers();
            this.clusterByTag();
        }
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
            .catch(() => {
            });
    }

    /**
     Añade un servicio nuevo
     */
    addEditService(selected = null) {
        this.dialogHelper.addEdit(selected, 'service')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {
            });
    }

    /**
     Añade una ruta nueva
     */
    addEditRoute(selected = null) {
        this.dialogHelper.addEdit(selected, 'route')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {
            });
    }

    /**
     Añade un upstream nuevo
     */
    addEditUpstream(selected = null) {
        this.dialogHelper.addEdit(selected, 'upstream')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {
            });
    }

    /**
     Añade un consumidor nuevo
     */
    addEditConsumer(selected = null) {
        this.dialogHelper.addEdit(selected, 'consumer')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {
            });
    }

    /**
     Añade un Plugin
     */
    addEditPlugin(selected = null, extraNode = null) {
        // If extraNode => new plugin over a service, route or consumer
        let extras = null;
        if (extraNode !== null) {
            if (extraNode['group'] === 'route' || extraNode['group'] === 'service' || extraNode['group'] === 'consumer') {
                extras = {
                    group: extraNode['group'],
                    id: extraNode['id']
                };
            }
        }

        this.dialogHelper.addEdit(selected, 'plugin', extras)
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {
            });
    }

    /**
     Añade un Target
     */
    addTarget(selected = null) {
        this.dialogHelper.addEdit(selected, 'target')
            .then(() => {
                this.populateGraph();
            })
            .catch(() => {
            });
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
            .catch(() => {
            });
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
            .catch(() => {
            });
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
                .catch(() => {
                });
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
     * Clusteriza según las tags que empiezan por "c-"
     */
    clusterByTag() {
        // por cada tag de cluster, creo uno
        this.clusterTags.forEach(cTag => {
            if (cTag === this.lastDeclusteredTag) {
                return false;
            }

            const clusterOptionsByData = {
                // Rules for clustering
                joinCondition: function (childOptions) {
                    if (childOptions.data && childOptions.data.tags) {
                        return childOptions.data.tags.includes(cTag);
                    } else {
                        return false;
                    }
                },
                clusterNodeProperties: {
                    id: 'api-cluster-' + cTag,
                    group: 'apiCluster',
                    label: cTag,
                    title: this.translate.instant('architect.cluster_title')
                }
            };
            this.network.cluster(clusterOptionsByData);
        });
    }

    /**
     * Ordena filtrar el grafo por unos valores concretos de etiqueta
     * @param selection
     */
    filterTag(selection) {
        this.tagSelectedCtrl.setValue(selection.data.tags);
        this.graphFilter.tag = joiner(selection.data.tags, ',');
        this.graphFilter.element = 'all';
        this.graphFilter.mode = false;
        this.populateGraph();
    }

    /**
     * Limpia los filtros
     */
    cleanFilters() {
        this.tagSelectedCtrl.setValue([]);
        this.graphFilter.tag = '';
        this.graphFilter.element = 'all';
        this.graphFilter.mode = false;
        this.populateGraph();
    }

    /**
     * Cambia el estado del uso de clusters en el grafo
     */
    changeClusterize() {
        this.clusterize = !this.clusterize;
        localStorage.setItem('kongClusteredPref', '' + this.clusterize);
        this.populateGraph();
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

/**
 * Join an array of strings checking if it is not null
 * @param array Array of tags or null
 * @param joint String to join tags
 */
function joiner(array, joint) {
    let retValue = '';
    if (Array.isArray(array)) {
        try {
            retValue = array.join(joint);
        } catch (e) {
            retValue = '';
        }
    } else {
        retValue = '';
    }
    return retValue;
}

/**
 * Splits a string
 * @param string String to split
 * @param separator String to split tags
 */
function splitter(string, separator) {
    if (!string) {
        return [];
    }
    return string.split(separator);
}
