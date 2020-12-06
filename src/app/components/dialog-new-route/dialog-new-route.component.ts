import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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
    validProtocols = ['http', 'https', 'grpc', 'grpcs', 'tcp', 'tls', 'udp'];
    validMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE'];
    validRedirectCodes = [426, 301, 302, 307, 308];
    tags = [];
    servicesAvailable = [];
    editMode = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    /*
    For http, at least one of methods, hosts, headers or paths;
For https, at least one of methods, hosts, headers, paths or snis;
For tcp, at least one of sources or destinations;
For tls, at least one of sources, destinations or snis;
For grpc, at least one of hosts, headers or paths;
For grpcs, at least one of hosts, headers, paths or snis
     */

    form = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-._~]+$/)]],
        // service: {'id': 'f2f74df2-f920-4eb5-9d02-721779a967f0'}
        service: [''],
        protocol: ['', Validators.required],
        // 'methods': ['GET', 'POST'],
        methods: [''],
        // 'hosts': ['example.com', 'foo.test'],
        hosts: [''],
        // 'paths': ['\/foo', '\/bar'],
        paths: ['', [Validators.pattern(/^\//)]],
        // 'headers': {'x-another-header': ['bla'], 'x-my-header': ['foo', 'bar']},
        headers: [''],
        https_redirect_status_code: [426, [Validators.required]],
        tags: [''],

        // null ["kkkk", "jijij"]
        snis: [null],
        // null [{"ip": 12.13.14.15, "port": 23}]
        destinations: [null],
        // null [{"ip": 12.13.14.15, "port": 23}]
        sources: [null],
        regex_priority: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(1000)]],
        path_handling: ['v0'],
        strip_path: [true],
        preserve_host: [false],
        request_buffering: [true, [Validators.required]],
        response_buffering: [true, [Validators.required]]

        // ca_certificates: ['', Validators.pattern(/^([0-9abcdefABCDEF\-]|[\r\n])+$/)]
    }, {validator: ProtocolPathValidator});

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
                    // Cambios especiales para representarlos en el formulario
                    delete route['id'];
                    delete route['created_at'];
                    delete route['updated_at'];
                    route['input_method'] = 'complete';
                    route['url'] = '';

                    if (route['client_certificate'] && route['client_certificate']['id']) {
                        route['client_certificate'] = route['client_certificate']['id'];
                    } else {
                        route['client_certificate'] = '';
                    }
                    if (route['ca_certificates'] && route['ca_certificates'].length > 0) {
                        route['ca_certificates'] = route['ca_certificates'].join('\n');
                    } else {
                        route['ca_certificates'] = '';
                    }
                    if (route['tls_verify'] === null) {
                        route['tls_verify'] = '';
                    } else {
                        route['tls_verify'] = '' + route['tls_verify'];
                    }

                    this.tags = route['tags'];
                    route['tags'] = [];

                    // Relleno el formuarlio
                    this.form.setValue(route);

                    // Estado inicial de los campos disabled
                    this.changeRadio();
                }, error => {
                    this.toast.error_general(error);
                });
        } else {
            // Estado inicial de los campos disabled
            this.changeRadio();
        }
    }

    /*
        Al cambiar el tipo de input activo y desactivo campos
     */
    changeRadio() {

    }

    /*
        Submit del formulario
     */
    onSubmit() {
        // Genero el body a devolver
        let body = this.form.value;

        // Limpio el campo si viene como '' para enviar null
        /*if (this.tlsVerifyField.value === '') {
            body.tls_verify = null;
        } else {
            // Convierto 'true' a true...
            body.tls_verify = this.tlsVerifyField.value === 'true';
        }
        if (this.tlsVerifyDepthField.value === '') {
            body.tls_verify_depth = null;
        }

        if (this.caCertificatesField.value !== '') {
            body.ca_certificates = this.caCertificatesField.value.split('\n');
        } else {
            body.ca_certificates = null;
        }

        if (this.clientCertificateField.value !== '') {
            body.client_certificate = {id: this.clientCertificateField.value};
        } else {
            // no me interesa enviarlo si es ''
            delete body.client_certificate;
        }

        if (this.tags && this.tags.length > 0) {
            body.tags = this.tags;
        } else {
            delete body.tags;
        }

        if (this.inputMethodField.value === 'url') {
            delete body.protocol;
            delete body.host;
            delete body.port;
            delete body.path;
        } else {
            delete body.url;

            if (this.pathField.value === '') {
                delete body.path;
            }
        }*/

        delete body.input_method;

        return body;
    }

    /*
        Gestión de tags
     */
    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our tag
        if ((value || '').trim()) {
            this.tags.push(value.trim());
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    removeTag(tag): void {
        const index = this.tags.indexOf(tag);
        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    /*
        Getters de campos del formulario
     */
    get nameField() { return this.form.get('name'); }

    get serviceField() { return this.form.get('service'); }

    get protocolField() { return this.form.get('protocol'); }

    get hostsField() { return this.form.get('hosts'); }

    get methodsField() { return this.form.get('methods'); }

    get pathsField() { return this.form.get('paths'); }

    get headersField() { return this.form.get('headers'); }

    get httpsRedirectStatusCodeField() { return this.form.get('https_redirect_status_code'); }

    get snisField() { return this.form.get('snis'); }

    get destinationsField() { return this.form.get('destinations'); }

    get sourcesField() { return this.form.get('sources'); }

    get regexPriorityField() { return this.form.get('regex_priority'); }

    get pathHandlingField() { return this.form.get('path_handling'); }

    get stripPathField() { return this.form.get('strip_path'); }

    get preserveHostField() { return this.form.get('preserve_host'); }

    get requestBufferingField() { return this.form.get('request_buffering'); }

    get responseBufferingField() { return this.form.get('response_buffering'); }

    get tagsField() { return this.form.get('tags'); }
}

const ProtocolPathValidator: ValidatorFn = (fg: FormGroup) => {
    const proto = fg.get('protocol').value;
    let valid = true;

    // Si no es http o https no puede llevar path
    if (proto !== 'http' && proto !== 'https') {
        if (fg.get('path').value !== '' && fg.get('path').value !== null) {
            valid = false;
        }
    }
    return valid ? null : {protocol: proto};
};
