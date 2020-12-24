import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as Joi from 'joi';
import { isEmpty as _isEmpty, size as _size } from 'lodash';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../../shared/custom-validators';

@Component({
    selector: 'app-dialog-new-route',
    templateUrl: './dialog-new-route.component.html',
    styleUrls: ['./dialog-new-route.component.scss']
})
export class DialogNewRouteComponent implements OnInit {
    // Uso la variable para el estado del formulario
    formValid = false;
    validProtocols = ['http', 'https', 'tcp', 'tls', 'udp', 'grpc', 'grpcs'];
    validMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE'];
    validRedirectCodes = [426, 301, 302, 307, 308];
    currentTags = [];
    currentHosts = [];
    currentPaths = [];
    currentSnis = [];
    currentHeaders = {};
    currentSources = [];
    currentDestinations = [];
    servicesAvailable = [];
    editMode = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];


    form = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-._~]+$/)]],
        service: ['', [Validators.required]],
        protocols: ['', [Validators.required, CustomValidators.isProtocolListValidForRoute(this.validProtocols)]],
        // methods: ['', [CustomValidators.isArrayOfOneOf(this.validMethods)]],
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
        snis_validation: [''],
        headers: [''],
        sources: [''],
        destinations: ['']
    }, {validator: FinalFormValidator});

    constructor(@Inject(MAT_DIALOG_DATA) public routeIdEdit: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        // Recupero la lista de servicios
        this.api.getServices()
            .subscribe(services => {
                for (let serv of services['data']) {
                    this.servicesAvailable.push({id: serv.id, name: serv.name});
                }
            }, error => {
                this.toast.error_general(error);
            });

        // Si viene un servicio para editar
        if (this.routeIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getRoute(this.routeIdEdit)
                .subscribe(route => {
                    // Relleno el formuarlio
                    this.form.setValue(this.prepareDataForForm(route));
                }, error => {
                    this.toast.error_general(error);
                });
        }
    }

    /*
        Submit del formulario
     */
    onSubmit() {
        return this.prepareDataForKong(this.form.value);
    }

    /*
        Gestión de tags
     */
    addTag(event: MatChipInputEvent): void {
        const input = event.input;
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

    /*
        Gestión de hosts
     */
    addHost(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value.trim();

        // Add
        if ((value || '') && /^[^*]*\*?[^*]*$/.test(value) && (/^\*\./.test(value) || /\.\*$/.test(value) || /^[^*]*$/.test(value))) {
            this.currentHosts.push(value);
            this.form.get('hosts_validation').setValue('true');

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
                this.form.get('hosts_validation').setValue(null);
            }
        }
    }

    /*
        Gestión de rutas
     */
    addPath(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value.trim();

        // Add
        if ((value || '') && /^\//.test(value) && !/\/\//.test(value)) {
            this.currentPaths.push(value);
            this.form.get('paths_validation').setValue('true');

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
                this.form.get('paths_validation').setValue(null);
            }
        }
    }

    /*
        Gestión de snis
     */
    addSni(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value.trim();

        // Add
        if ((value || '')) {
            this.currentSnis.push(value);
            this.form.get('snis_validation').setValue('true');

            // Reset the input value
            if (input) {
                input.value = '';
            }
        }
    }

    removeSni(host): void {
        const index = this.currentSnis.indexOf(host);
        if (index >= 0) {
            this.currentSnis.splice(index, 1);
            if (this.currentSnis.length === 0) {
                // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
                this.form.get('snis_validation').setValue(null);
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
            this.form.get('headers').setValue('true');

            keyInput.value = '';
            valInput.value = '';
        }
    }

    removeHeader(key): void {
        delete this.currentHeaders[key];
        if (_size(this.currentHeaders) === 0) {
            // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
            this.form.get('headers').setValue(null);
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
            this.form.get('sources').setValue('true');

            ipInput.value = '';
            portInput.value = '';
        }
    }

    removeSource(idx): void {
        this.currentSources.splice(idx, 1);
        if (this.currentSources.length === 0) {
            // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
            this.form.get('sources').setValue(null);
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
            this.form.get('destinations').setValue('true');

            ipInput.value = '';
            portInput.value = '';
        }
    }

    removeDestination(idx): void {
        this.currentDestinations.splice(idx, 1);
        if (this.currentDestinations.length === 0) {
            // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
            this.form.get('destinations').setValue(null);
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

        this.currentSnis = route['snis'] || [];
        route['snis'] = [];

        this.currentHeaders = route['headers'] || [];
        this.currentSources = route['sources'] || [];
        this.currentDestinations = route['destinations'] || [];

        route['hosts_validation'] = '';
        route['snis_validation'] = '';
        route['paths_validation'] = '';

        return route;
    }

    prepareDataForKong(body) {
        // Genero el body para la petición API
        // El servicio hay que mandarlo así
        body.service = {id: this.serviceField.value};
        delete body.hosts_validation;
        delete body.snis_validation;
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

        if (this.currentSnis && this.currentSnis.length > 0) {
            body.snis = this.currentSnis;
        } else {
            body.snis = [];
        }

        if (this.currentHeaders && this.currentHeaders[0]) {
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

    /*
        Getters de campos del formulario
     */
    get nameField() { return this.form.get('name'); }

    get serviceField() { return this.form.get('service'); }

    get protocolsField() { return this.form.get('protocols'); }

    get hostsField() { return this.form.get('hosts'); }

    get methodsField() { return this.form.get('methods'); }

    get pathsField() { return this.form.get('paths'); }

    get httpsRedirectStatusCodeField() { return this.form.get('https_redirect_status_code'); }

    get snisField() { return this.form.get('snis'); }

    get regexPriorityField() { return this.form.get('regex_priority'); }

    get pathHandlingField() { return this.form.get('path_handling'); }

    get stripPathField() { return this.form.get('strip_path'); }

    get preserveHostField() { return this.form.get('preserve_host'); }

    get requestBufferingField() { return this.form.get('request_buffering'); }

    get responseBufferingField() { return this.form.get('response_buffering'); }

    get tagsField() { return this.form.get('tags'); }
}

/*
    Validación final del formulario
 */
const FinalFormValidator: ValidatorFn = (fg: FormGroup) => {
    const protos = fg.get('protocols').value;
    let valid = true;

    // For http, at least one of methods, hosts, headers or paths;
    if (protos.includes('http') && ((_isEmpty(fg.get('methods').value) && _isEmpty(fg.get('hosts_validation').value) && _isEmpty(fg.get('headers').value) && _isEmpty(fg.get('paths_validation').value)) || (!_isEmpty(fg.get('sources').value) || !_isEmpty(fg.get('destinations').value)))) {
        valid = false;
    }
    // For https, at least one of methods, hosts, headers, paths or snis;
    if (protos.includes('https') && ((_isEmpty(fg.get('methods').value) && _isEmpty(fg.get('hosts_validation').value) && _isEmpty(fg.get('headers').value) && _isEmpty(fg.get('paths_validation').value) && _isEmpty(fg.get('snis_validation').value)) || (!_isEmpty(fg.get('sources').value) || !_isEmpty(fg.get('destinations').value)))) {
        valid = false;
    }

    // For tcp or udp, at least one of sources or destinations;
    if ((protos.includes('tcp') || protos.includes('udp')) && ((_isEmpty(fg.get('sources').value) && _isEmpty(fg.get('destinations').value)) || (!_isEmpty(fg.get('methods').value) || !_isEmpty(fg.get('hosts_validation').value) || !_isEmpty(fg.get('headers').value) || !_isEmpty(fg.get('paths_validation').value)))) {
        valid = false;
    }
    // For tls, at least one of sources, destinations or snis;
    if (protos.includes('tls') && _isEmpty(fg.get('sources').value) && ((_isEmpty(fg.get('destinations').value) && _isEmpty(fg.get('snis_validation').value)) || (!_isEmpty(fg.get('methods').value) || !_isEmpty(fg.get('hosts_validation').value) || !_isEmpty(fg.get('headers').value) || !_isEmpty(fg.get('paths_validation').value)))) {
        valid = false;
    }

    // For grpc, at least one of hosts, headers or paths;
    if (protos.includes('grpc') && ((_isEmpty(fg.get('hosts_validation').value) && _isEmpty(fg.get('headers').value) && _isEmpty(fg.get('paths_validation').value)) || (!_isEmpty(fg.get('sources').value) || !_isEmpty(fg.get('destinations').value) || !_isEmpty(fg.get('methods').value)))) {
        valid = false;
    }
    // For grpcs, at least one of hosts, headers, paths or snis
    if (protos.includes('grpcs') && ((_isEmpty(fg.get('hosts_validation').value) && _isEmpty(fg.get('headers').value) && _isEmpty(fg.get('paths_validation').value) && _isEmpty(fg.get('snis_validation').value)) || (!_isEmpty(fg.get('sources').value) || !_isEmpty(fg.get('destinations').value) || !_isEmpty(fg.get('methods').value)))) {
        valid = false;
    }

    return valid ? null : {finalValidation: protos};
};