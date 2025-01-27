import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators, FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as Joi from 'joi';
import {isEmpty as _isEmpty, orderBy as _orderBy, size as _size, sortedUniq as _sortedUniq} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {ToastService} from '../../services/toast.service';
import {CustomValidators} from '../../shared/custom-validators';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-new-route-noexpressions',
    templateUrl: './dialog-new-route-noexpressions.component.html',
    styleUrls: ['./dialog-new-route-noexpressions.component.scss'],
    standalone: false
})
export class DialogNewRouteNoexpressionsComponent implements OnInit, OnDestroy {
    // Uso la variable para el estado del formulario
    formValid = false;
    validProtocols = ['http', 'https', 'tcp', 'tls', 'udp', 'grpc', 'grpcs'];
    validMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE'];
    validRedirectCodes = [426, 301, 302, 307, 308];
    allTags = [];
    routes = [];
    filteredRoutes: any[] = [];
    searchControl = new FormControl('');
    currentTags = [];
    currentHosts = [];
    currentPaths = [];
    currentHeaders = {};
    currentSources = [];
    currentDestinations = [];
    servicesAvailable = [];
    snisAvailable = [];
    editMode = false;
    formNE = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-._~]+$/)]],
        service: ['', [Validators.required]],
        protocols: ['', [Validators.required, CustomValidators.isProtocolListValidForRoute(this.validProtocols)]],
        methods: ['', []],
        https_redirect_status_code: [426, [Validators.required, CustomValidators.isOneOf(this.validRedirectCodes)]],
        tags: [''],
        regex_priority: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(999999)]],
        path_handling: ['v0', [Validators.pattern(/(v0|v1)/)]],
        hosts: [''],
        paths: [''],
        snis: [''],
        strip_path: [true],
        preserve_host: [false],
        request_buffering: [true, [Validators.required]],
        response_buffering: [true, [Validators.required]],
        hosts_validation: [''],
        paths_validation: [''],
        headers: [''],
        sources: [''],
        destinations: ['']
    }, {validators: [FinalFormValidator()]});

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(@Inject(MAT_DIALOG_DATA) public routeIdEdit: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                public dialogRef: MatDialogRef<DialogNewRouteNoexpressionsComponent>) {
    }

    /*
        Getters de campos del formulario
     */
    get nameField() {
        return this.formNE.get('name');
    }

    get serviceField() {
        return this.formNE.get('service');
    }

    get protocolsField() {
        return this.formNE.get('protocols');
    }

    get methodsField() {
        return this.formNE.get('methods');
    }

    get regexPriorityField() {
        return this.formNE.get('regex_priority');
    }

    ngOnInit(): void {
        this.loadData();
        this.searchControl.valueChanges.subscribe(value => {
            this.filterRoutes(value);
          });
    }

    filterRoutes(searchTerm: string): void {
        if (!searchTerm) {
          this.filteredRoutes = this.routes;
        } else {
            this.filteredRoutes = this.routes.filter(route => {
                let instanceName = route.name ?? ''; // Use empty string if instance_name is null or undefined
                return instanceName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
      }

      displayFn = (routeId: any): string => {
        const route = this.routes.find(r => r.id === routeId);
        return route ? (route.name ? route.name : route.id) : '';
    }

    ngOnDestroy(): void {
    }

    onRouteChange(event) {
        // Find the selected route in the routes array
        let event_value = '';
        if (event instanceof MatAutocompleteSelectedEvent) {
            event_value = event.option.value;
        } else {
            event_value = event.value;
        }
        const selectedRoute = this.routes.find(route => route.id === event_value);
        const selectedRouteCopy = {...selectedRoute};

        if (selectedRoute) {
            // Prepare the data for the form based on the selected route
            const formData = this.prepareDataForForm(selectedRouteCopy);

            // Update the form with the data from the selected route
            this.formNE.patchValue(formData);
        }
    }

    loadData() {
        // Recupero la lista de servicios
        this.api.getAllServices(null, [], ['id', 'name'])
            .then((services) => {
                for (let serv of services['data']) {
                    this.servicesAvailable.push({id: serv.id, name: serv.name});
                }

                // ordeno
                this.servicesAvailable = _orderBy(this.servicesAvailable, ['name'], ['asc']);
            })
            .catch(error => {
                this.toast.error_general(error);
            });

        // La lista de SNIs
        this.api.getAllSnis(null, [], ['id', 'name'])
            .then((snis) => {
                for (let sni of snis['data']) {
                    this.snisAvailable.push({id: sni.id, name: sni.name});
                }
            })
            .catch(error => {
                this.toast.error_general(error);
            });

        // Si viene un route para editar
        if (this.routeIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getRoute(this.routeIdEdit)
                .subscribe({
                    next: (route) => {
                        // Relleno el formuarlio
                        this.formNE.setValue(this.prepareDataForForm(route));
                    },
                    error: (error) => this.toast.error_general(error)
                });
        }

        // Lista de tags
        this.api.getTags()
            .subscribe((res) => {
                // Recojo las tags
                res['data'].forEach(data => {
                    this.allTags.push(data.tag);
                });
                this.allTags.sort();
                this.allTags = _sortedUniq(this.allTags);
            });

        // Retrieve the list of routes
        this.api.getAllRoutes()
            .then((routes) => {
                this.routes = routes['data'];
            })
            .catch(error => {
                this.toast.error_general(error);
            });
    }

    /*
        Submit del formulario
     */
    onSubmit() {
        let result;
        result = this.prepareDataForKong(this.formNE.value);

        if (!this.editMode) {
            // llamo al API
            this.api.postNewRoute(result)
                .subscribe({
                    next: (value) => {
                        this.toast.success('text.id_extra', 'success.new_route', {msgExtra: value['id']});
                        this.dialogRef.close(true);
                    },
                    error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                });
        }
        // Si venía es que es edición
        else {
            this.api.patchRoute(this.routeIdEdit, result)
                .subscribe({
                    next: (value) => {
                        this.toast.success('text.id_extra', 'success.update_route', {msgExtra: value['id']});
                        this.dialogRef.close(true);
                    },
                    error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                });
        }
    }

    /*
        Gestión de tags
     */
    addTag(event: MatChipInputEvent): void {
        const input = event.chipInput.inputElement;
        const value = event.value.trim();

        // Add our tag
        if ((value || '') && /^[\w.\-_~]+$/.test(value)) {
            this.currentTags.push(value);

            // Reset the input value
            if (input) {
                input.value = '';
            }
        }
    }

    removeTag(tag): void {
        const index = this.currentTags.indexOf(tag);
        if (index >= 0) {
            this.currentTags.splice(index, 1);
        }
    }

    selectedTag($event: MatAutocompleteSelectedEvent) {
        this.currentTags.push($event.option.viewValue);
    }

    /*
        Gestión de hosts
     */
    addHost(event: MatChipInputEvent): void {
        const input = event.chipInput.inputElement;
        const value = event.value.trim();

        // Add
        if ((value || '') && /^[^*]*\*?[^*]*$/.test(value) && (/^\*\./.test(value) || /\.\*$/.test(value) || /^[^*]*$/.test(value))) {
            this.currentHosts.push(value);
            this.formNE.get('hosts_validation').setValue('true');

            // Reset the input value
            if (input) {
                input.value = '';
            }
        }
    }

    removeHost(host): void {
        const index = this.currentHosts.indexOf(host);
        if (index >= 0) {
            this.currentHosts.splice(index, 1);
            if (this.currentHosts.length === 0) {
                // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
                this.formNE.get('hosts_validation').setValue(null);
            }
        }
    }

    /*
        Gestión de rutas
     */
    addPath(event: MatChipInputEvent): void {
        const input = event.chipInput.inputElement;
        const value = event.value.trim();

        // Add
        if ((value || '') && /^\//.test(value) && !/\/\//.test(value)) {
            this.currentPaths.push(value);
            this.formNE.get('paths_validation').setValue('true');

            // Reset the input value
            if (input) {
                input.value = '';
            }
        }
    }

    removePath(host): void {
        const index = this.currentPaths.indexOf(host);
        if (index >= 0) {
            this.currentPaths.splice(index, 1);
            if (this.currentPaths.length === 0) {
                // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
                this.formNE.get('paths_validation').setValue(null);
            }
        }
    }

    /*
        Gestión de headers
     */
    addHeader(keyInput, valInput): void {
        const {error, value} = Joi.object({
            key: Joi.string().invalid('Host').required(),
            value: Joi.string().required()
        }).validate({key: keyInput.value, value: valInput.value});

        // Add
        if (error === undefined) {
            this.currentHeaders[keyInput.value] = valInput.value.split(',');
            this.formNE.get('headers').setValue('true');

            keyInput.value = '';
            valInput.value = '';
        }
    }

    removeHeader(key): void {
        delete this.currentHeaders[key];
        if (_size(this.currentHeaders) === 0) {
            // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
            this.formNE.get('headers').setValue(null);
        }
    }

    /*
        Gestión de sources
     */
    addSource(ipInput, portInput): void {
        let obj = {};
        if (ipInput.value !== '') {
            obj['ip'] = ipInput.value;
        }
        if (portInput.value !== '') {
            obj['port'] = portInput.value;
        }

        const schema = Joi.object({
            ip: Joi.string().ip().trim().allow(''),
            port: Joi.number().port().allow('')
        }).or('ip', 'port');
        const {error, value} = schema.validate(obj);

        // Add
        if (error === undefined && !this.currentSources.includes(value)) {
            this.currentSources.push(value);
            this.formNE.get('sources').setValue('true');

            ipInput.value = '';
            portInput.value = '';
        }
    }

    removeSource(idx): void {
        this.currentSources.splice(idx, 1);
        if (this.currentSources.length === 0) {
            // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
            this.formNE.get('sources').setValue(null);
        }
    }

    /*
        Gestión de destinations
     */
    addDestination(ipInput, portInput): void {
        let obj = {};
        if (ipInput.value !== '') {
            obj['ip'] = ipInput.value;
        }
        if (portInput.value !== '') {
            obj['port'] = portInput.value;
        }

        const schema = Joi.object({
            ip: Joi.string().ip().trim().allow(''),
            port: Joi.number().port().allow('')
        }).or('ip', 'port');
        const {error, value} = schema.validate(obj);

        // Add
        if (error === undefined && !this.currentDestinations.includes(value)) {
            this.currentDestinations.push(value);
            this.formNE.get('destinations').setValue('true');

            ipInput.value = '';
            portInput.value = '';
        }
    }

    removeDestination(idx): void {
        this.currentDestinations.splice(idx, 1);
        if (this.currentDestinations.length === 0) {
            // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
            this.formNE.get('destinations').setValue(null);
        }
    }

    /*
        Preparo los datos
     */
    prepareDataForForm(route) {
        // Cambios especiales para representarlos en el formulario
        delete route['id'];
        delete route['created_at'];
        delete route['updated_at'];

        if (route['service'] && route['service']['id']) {
            route['service'] = route['service']['id'];
        } else {
            route['service'] = '';
        }

        this.currentTags = route['tags'] || [];
        route['tags'] = [];

        this.currentHosts = route['hosts'] || [];
        route['hosts'] = [];

        this.currentPaths = route['paths'] || [];
        route['paths'] = [];

        this.currentHeaders = route['headers'] || [];
        this.currentSources = route['sources'] || [];
        this.currentDestinations = route['destinations'] || [];

        route['hosts_validation'] = '';
        route['paths_validation'] = '';

        // Si estos campos vienen ya completos, la validación es correcta
        if (this.currentHosts.length > 0) {
            route['hosts_validation'] = 'true';
        }
        if (this.currentPaths.length > 0) {
            route['paths_validation'] = 'true';
        }

        return route;
    }

    prepareDataForKong(body) {
        // Genero el body para la petición API
        // El servicio hay que mandarlo así
        body.service = {id: this.serviceField.value};
        delete body.hosts_validation;
        delete body.paths_validation;

        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
        }

        if (this.currentHosts && this.currentHosts.length > 0) {
            body.hosts = this.currentHosts;
        } else {
            body.hosts = [];
        }

        if (this.currentPaths && this.currentPaths.length > 0) {
            body.paths = this.currentPaths;
        } else {
            body.paths = [];
        }

        if (this.currentHeaders && Object.getOwnPropertyNames(this.currentHeaders).length > 0) {
            body.headers = this.currentHeaders;
        } else {
            body.headers = {};
        }

        if (this.currentSources && this.currentSources.length > 0) {
            body.sources = this.currentSources;
        } else {
            body.sources = [];
        }

        if (this.currentDestinations && this.currentDestinations.length > 0) {
            body.destinations = this.currentDestinations;
        } else {
            body.destinations = [];
        }

        if (_isEmpty(this.methodsField.value)) {
            body.methods = [];
        }

        if (_isEmpty(body.snis)) {
            body.snis = null;
        }

        // Si es http o https no admite sources y destionations
        if (body.protocols.includes('http') || body.protocols.includes('https')) {
            delete body.sources;
            delete body.destinations;
        }
        // En caso de tcp, tls o udp no puede llevar methods, headers, paths o hosts
        if (body.protocols.includes('tcp') || body.protocols.includes('tls') || body.protocols.includes('udp')) {
            delete body.hosts;
            delete body.methods;
            delete body.paths;
            delete body.headers;
        }
        // Para estos no hay que enviar strip_path, sources ni destinations
        if (body.protocols.includes('grpc') || body.protocols.includes('grpcs')) {
            delete body.strip_path;
            delete body.sources;
            delete body.destinations;
        }

        return body;
    }
}

/*
    Validación final del formulario
 */
function FinalFormValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors => {

        const protos = fg.get('protocols').value;
        let valid = true;

        // Dependiendo del modo de router
        // For http, at least one of methods, hosts, headers or paths;
        if (protos.includes('http') && ((_isEmpty(fg.get('methods').value) && _isEmpty(fg.get('hosts_validation').value) && _isEmpty(fg.get('headers').value) && _isEmpty(fg.get('paths_validation').value)) || (!_isEmpty(fg.get('sources').value) || !_isEmpty(fg.get('destinations').value)))) {
            valid = false;
        }
        // For https, at least one of methods, hosts, headers, paths or snis;
        if (protos.includes('https') && ((_isEmpty(fg.get('methods').value) && _isEmpty(fg.get('hosts_validation').value) && _isEmpty(fg.get('headers').value) && _isEmpty(fg.get('paths_validation').value) && _isEmpty(fg.get('snis').value)) || (!_isEmpty(fg.get('sources').value) || !_isEmpty(fg.get('destinations').value)))) {
            valid = false;
        }

        // For tcp or udp, at least one of sources or destinations;
        if ((protos.includes('tcp') || protos.includes('udp')) && ((_isEmpty(fg.get('sources').value) && _isEmpty(fg.get('destinations').value)) || (!_isEmpty(fg.get('methods').value) || !_isEmpty(fg.get('hosts_validation').value) || !_isEmpty(fg.get('headers').value) || !_isEmpty(fg.get('paths_validation').value)))) {
            valid = false;
        }
        // For tls, at least one of sources, destinations or snis;
        if (protos.includes('tls') && _isEmpty(fg.get('sources').value) && ((_isEmpty(fg.get('destinations').value) && _isEmpty(fg.get('snis').value)) || (!_isEmpty(fg.get('methods').value) || !_isEmpty(fg.get('hosts_validation').value) || !_isEmpty(fg.get('headers').value) || !_isEmpty(fg.get('paths_validation').value)))) {
            valid = false;
        }

        // For grpc, at least one of hosts, headers or paths;
        if (protos.includes('grpc') && ((_isEmpty(fg.get('hosts_validation').value) && _isEmpty(fg.get('headers').value) && _isEmpty(fg.get('paths_validation').value)) || (!_isEmpty(fg.get('sources').value) || !_isEmpty(fg.get('destinations').value) || !_isEmpty(fg.get('methods').value)))) {
            valid = false;
        }
        // For grpcs, at least one of hosts, headers, paths or snis
        if (protos.includes('grpcs') && ((_isEmpty(fg.get('hosts_validation').value) && _isEmpty(fg.get('headers').value) && _isEmpty(fg.get('paths_validation').value) && _isEmpty(fg.get('snis').value)) || (!_isEmpty(fg.get('sources').value) || !_isEmpty(fg.get('destinations').value) || !_isEmpty(fg.get('methods').value)))) {
            valid = false;
        }

        return valid ? null : {finalValidation: protos};
    };
}
