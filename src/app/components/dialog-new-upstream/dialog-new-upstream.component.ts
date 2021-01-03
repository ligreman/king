import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { startsWith as _startsWith } from 'lodash';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../../shared/custom-validators';

@Component({
    selector: 'app-dialog-new-upstream',
    templateUrl: './dialog-new-upstream.component.html',
    styleUrls: ['./dialog-new-upstream.component.scss']
})
export class DialogNewUpstreamComponent implements OnInit {
    // Uso la variable para el estado del formulario
    formValid = false;
    validAlgorithms = ['consistent-hashing', 'least-connections', 'round-robin'];
    validHash = ['none', 'consumer', 'ip', 'header', 'cookie'];
    validProtocols = ['http', 'https', 'grpc', 'grpcs', 'tcp'];
    validHttpStatuses = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 427, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511];
    currentTags = [];
    certificatesAvailable = [];
    servicesAvailable = [];

    editMode = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', [Validators.required, CustomValidators.isAlphaNum()]],
        algorithm: ['round-robin', [CustomValidators.isOneOf(this.validAlgorithms)]],
        hash_on: ['none', [CustomValidators.isOneOf(this.validHash)]],
        hash_fallback: ['none', [CustomValidators.isOneOf(this.validHash)]],
        // si hash_on es header
        hash_on_header: ['', []],
        // si hash_fallback es header
        hash_fallback_header: ['', []],
        // si hash_on o hash_fallback es cookie
        hash_on_cookie: ['', []],
        // si hash_on o hash_fallback es cookie
        hash_on_cookie_path: ['/', []],
        slots: [10000, [CustomValidators.isNumber(), Validators.min(10), Validators.max(65536)]],
        host_header: ['', [CustomValidators.isHost(true)]],
        client_certificate: [''],
        tags: [''],
        // HEALTHCHECKS
        healthchecks: this.fb.group({
            active: this.fb.group({
                https_verify_certificate: [true, CustomValidators.isBoolean()],
                http_path: ['/'],
                timeout: [1, [CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]],
                https_sni: [],
                concurrency: [10, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                type: ['http', [CustomValidators.isOneOf(this.validProtocols)]],
                healthy: this.fb.group({
                    http_statuses: [[200, 302], [CustomValidators.isOneOf(this.validHttpStatuses)]],
                    interval: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]],
                    successes: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]]
                }),
                unhealthy: this.fb.group({
                    http_statuses: [[429, 404, 500, 501, 502, 503, 504, 505], [CustomValidators.isOneOf(this.validHttpStatuses)]],
                    tcp_failures: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    timeouts: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    http_failures: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    interval: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]]
                })
            }),
            pasive: this.fb.group({
                type: ['http', [CustomValidators.isOneOf(this.validProtocols)]],
                healthy: this.fb.group({
                    http_statuses: [[200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308], [CustomValidators.isOneOf(this.validHttpStatuses)]],
                    successes: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]]
                }),
                unhealthy: this.fb.group({
                    http_failures: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    http_statuses: [[429, 500, 503], [CustomValidators.isOneOf(this.validHttpStatuses)]],
                    tcp_failures: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    timeouts: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]]
                })
            }),
            threshold: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(100)]]
        })
    }, {validators: [HashFormValidator()]});


    constructor(@Inject(MAT_DIALOG_DATA) public upstreamIdEdit: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService) { }

    ngOnInit(): void {
        forkJoin([
            this.api.getServices(),
            this.api.getCertificates(),
            this.api.getUpstreams()
        ]).pipe(map(([services, certs, upstreams]) => {
            // forkJoin returns an array of values, here we map those values to an object
            return {services: services['data'], certs: certs['data'], upstreams: upstreams['data']};
        })).subscribe(value => {
            for (let cert of value['certs']) {
                this.certificatesAvailable.push(cert.id);
            }

            // Host para el upstream disponibles
            let upstreams = [];
            for (let up of value['upstreams']) {
                upstreams.push(up.name);
            }

            for (let srv of value['services']) {
                // Si el Host no está ya añadido como posible elección válida
                if (!upstreams.includes(srv.host)) {
                    this.servicesAvailable.push(srv.host);
                }
            }
        }, error => {
            this.toast.error_general(error);
        });

        // Si viene un upstream para editar
        if (this.upstreamIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del upstream del api
            this.api.getUpstream(this.upstreamIdEdit)
                .subscribe(upstream => {
                    // Añado el Host a la lista de válidos ya que lo estoy editando
                    this.servicesAvailable.push(upstream['name']);

                    // Cambios especiales para representarlos en el formulario
                    this.form.setValue(this.prepareDataForForm(upstream));
                }, error => {
                    this.toast.error_general(error);
                });
        }
    }

    /*
      Submit del formulario
   */
    onSubmit() {
        console.log('SUBMIT');
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

    prepareDataForForm(upstream) {
        delete upstream['id'];
        delete upstream['created_at'];
        delete upstream['updated_at'];


        if (upstream['client_certificate'] && upstream['client_certificate']['id']) {
            upstream['client_certificate'] = upstream['client_certificate']['id'];
        } else {
            upstream['client_certificate'] = '';
        }

        this.currentTags = upstream['tags'] || [];
        upstream['tags'] = [];

        return upstream;
    }

    prepareDataForKong(body) {
        if (body.client_certificate === '' || body.client_certificate === null) {
            body.client_certificate = null;
        } else {
            body.client_certificate = {id: body.client_certificate};
        }

        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
        }

        if (body.hash_fallback_header === '' || body.hash_fallback_header === null) {
            body.hash_fallback_header = null;
        }
        if (body.hash_on_cookie === '' || body.hash_on_cookie === null) {
            body.hash_on_cookie = null;
        }
        if (body.hash_on_header === '' || body.hash_on_header === null) {
            body.hash_on_header = null;
        }
        if (body.host_header === '' || body.host_header === null) {
            body.host_header = null;
        }

        // Health
        /*body['healthchecks'] = {
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
        };*/

        // return body;
    }


    /*
        Getters de campos del formulario
     */
    get nameField() { return this.form.get('name'); }

    get algorithmField() { return this.form.get('algorithm'); }

    get slotsField() { return this.form.get('slots'); }

    get hashOnField() { return this.form.get('hash_on'); }

    get hashOnHeaderField() { return this.form.get('hash_on_header'); }

    get hashFallbackField() { return this.form.get('hash_fallback'); }

    get hashFallbakHeaderField() { return this.form.get('hash_fallback_header'); }

    get hashOnCookieField() { return this.form.get('hash_on_cookie'); }

    get hashOnCookiePathField() { return this.form.get('hash_on_cookie_path'); }

    get haHttpsVerifyCertificateField() { return this.form.get('healthchecks.active.https_verify_certificate'); }

    get haHttpPathField() { return this.form.get('healthchecks.active.http_path'); }

    get hostHeaderField() { return this.form.get('host_header'); }

    get clientCertificateField() { return this.form.get('client_certificate'); }

    get tagsField() { return this.form.get('tags'); }
}


function HashFormValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors => {
        const hashOn = fg.get('hash_on').value;
        const hashOnHeader = fg.get('hash_on_header').value;
        const hashFallback = fg.get('hash_fallback').value;
        const hashFallbackHeader = fg.get('hash_fallback_header').value;
        const hashOnCookie = fg.get('hash_on_cookie').value;
        const hashOnCookiePath = fg.get('hash_on_cookie_path').value;
        let valid = true;

        // Dependiendo del hash on y fallback necesito unos campos u otros
        if (hashOn === 'header' && (hashOnHeader === '' || hashOnHeader === null)) {
            return {hashOnForm: hashOn};
        }
        if (hashFallback === 'header' && (hashFallbackHeader === '' || hashFallbackHeader === null)) {
            return {hashFallbackForm: hashFallback};
        }
        if ((hashOn === 'cookie' || hashFallback === 'cookie') && (hashOnCookie === '' || hashOnCookie === null
            || hashOnCookiePath === '' || hashOnCookiePath === null || !_startsWith(hashOnCookiePath, '/'))) {
            return {hashCookieForm: hashOn};
        }

        return valid ? null : {finalForm: ''};
    };
}
