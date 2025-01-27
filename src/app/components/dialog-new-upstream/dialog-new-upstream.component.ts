import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import * as Joi from 'joi';
import {size as _size, sortedUniq as _sortedUniq, startsWith as _startsWith} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {forkJoin} from 'rxjs';
import {map} from 'rxjs/operators';
import {ApiService} from '../../services/api.service';
import {ToastService} from '../../services/toast.service';
import {CustomValidators} from '../../shared/custom-validators';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-new-upstream',
    templateUrl: './dialog-new-upstream.component.html',
    styleUrls: ['./dialog-new-upstream.component.scss'],
    standalone: false
})
export class DialogNewUpstreamComponent implements OnInit, OnDestroy {
    loading = true;
    // Uso la variable para el estado del formulario
    formValid = false;
    validAlgorithms = ['consistent-hashing', 'least-connections', 'round-robin'];
    validHash = ['none', 'consumer', 'ip', 'header', 'cookie', 'path', 'query_arg', 'uri_capture'];
    validProtocols = ['http', 'https', 'grpc', 'grpcs', 'tcp'];
    validHttpStatuses = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 427, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511];
    currentTags = [];
    currentHeaders = {};
    allTags = [];
    certificatesAvailable = [];
    servicesAvailable = new Map<String, String>();

    editMode = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', [Validators.required, CustomValidators.isAlphaNum()]],
        algorithm: ['round-robin', [CustomValidators.isOneOf(this.validAlgorithms)]],
        hash_on: ['none', [CustomValidators.isOneOf(this.validHash)]],
        hash_fallback: ['none', [CustomValidators.isOneOf(this.validHash)]],
        // si hash_on es header
        hash_on_header: ['', []],
        // si hash_on es query_arg
        hash_on_query_arg: ['', []],
        // si hash_on es uri_capture
        hash_on_uri_capture: ['', []],
        // si hash_fallback es header
        hash_fallback_header: ['', []],
        // si hash_fallback es query_arg
        hash_fallback_query_arg: ['', []],
        // si hash_fallback es uri_capture
        hash_fallback_uri_capture: ['', []],
        // si hash_on o hash_fallback es cookie
        hash_on_cookie: ['', []],
        // si hash_on o hash_fallback es cookie
        hash_on_cookie_path: ['/', []],
        slots: [10000, [CustomValidators.isNumber(), Validators.min(10), Validators.max(65536)]],
        host_header: ['', [CustomValidators.isHost(true)]],
        client_certificate: [''],
        use_srv_name: [false, CustomValidators.isBoolean()],
        tags: [''],
        // HEALTHCHECKS
        healthchecks: this.fb.group({
            active: this.fb.group({
                https_verify_certificate: [true, CustomValidators.isBoolean()],
                http_path: ['/'],
                timeout: [1, [CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]],
                https_sni: [''],
                headers: [''],
                concurrency: [10, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                type: ['http', [CustomValidators.isOneOf(this.validProtocols)]],
                healthy: this.fb.group({
                    http_statuses: [[200, 302], [CustomValidators.isArrayOfOneOf(this.validHttpStatuses)]],
                    interval: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]],
                    successes: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]]
                }),
                unhealthy: this.fb.group({
                    http_statuses: [[429, 404, 500, 501, 502, 503, 504, 505], [CustomValidators.isArrayOfOneOf(this.validHttpStatuses)]],
                    tcp_failures: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    timeouts: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    http_failures: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    interval: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]]
                })
            }),
            passive: this.fb.group({
                type: ['http', [CustomValidators.isOneOf(this.validProtocols)]],
                healthy: this.fb.group({
                    http_statuses: [[200, 201, 202, 203, 204, 205, 206, 207, 208, 226, 300, 301, 302, 303, 304, 305, 306, 307, 308], [CustomValidators.isArrayOfOneOf(this.validHttpStatuses)]],
                    successes: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]]
                }),
                unhealthy: this.fb.group({
                    http_failures: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    http_statuses: [[429, 500, 503], [CustomValidators.isArrayOfOneOf(this.validHttpStatuses)]],
                    tcp_failures: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]],
                    timeouts: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(2147483648)]]
                })
            }),
            threshold: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(100)]]
        })
    }, {validators: [HashFormValidator()]});


    constructor(@Inject(MAT_DIALOG_DATA) public upstreamIdEdit: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                public dialogRef: MatDialogRef<DialogNewUpstreamComponent>) {
    }

    /*
        Getters de campos del formulario
     */
    get nameField() {
        return this.form.get('name');
    }

    get slotsField() {
        return this.form.get('slots');
    }

    get hashOnHeaderField() {
        return this.form.get('hash_on_header');
    }

    get hashFallbakHeaderField() {
        return this.form.get('hash_fallback_header');
    }

    get hashOnQueryArg() {
        return this.form.get('hash_on_query_arg');
    }

    get hashFallbakQueryArg() {
        return this.form.get('hash_fallback_query_arg');
    }

    get hashOnUriCapture() {
        return this.form.get('hash_on_uri_capture');
    }

    get hashFallbakUriCapture() {
        return this.form.get('hash_fallback_uri_capture');
    }

    get hashOnCookieField() {
        return this.form.get('hash_on_cookie');
    }

    get hashOnCookiePathField() {
        return this.form.get('hash_on_cookie_path');
    }

    get haHttpPathField() {
        return this.form.get('healthchecks.active.http_path');
    }

    get httpsSniField() {
        return this.form.get('healthchecks.active.https_sni');
    }

    get timeoutActiveField() {
        return this.form.get('healthchecks.active.timeout');
    }

    get activeHeadersField() {
        return this.form.get('healthchecks.active.headers');
    }

    get concurrencyField() {
        return this.form.get('healthchecks.active.concurrency');
    }

    get httpStatusesAHField() {
        return this.form.get('healthchecks.active.healthy.http_statuses');
    }

    get successesAHField() {
        return this.form.get('healthchecks.active.healthy.successes');
    }

    get intervalAHField() {
        return this.form.get('healthchecks.active.healthy.interval');
    }

    get httpStatusesAUHField() {
        return this.form.get('healthchecks.active.unhealthy.http_statuses');
    }

    get httpFailuresAUHField() {
        return this.form.get('healthchecks.active.unhealthy.http_failures');
    }

    get tcpFailuresAUHField() {
        return this.form.get('healthchecks.active.unhealthy.tcp_failures');
    }

    get intervalAUHField() {
        return this.form.get('healthchecks.active.unhealthy.interval');
    }

    get timeoutsAUHField() {
        return this.form.get('healthchecks.active.unhealthy.timeouts');
    }

    get thresholdField() {
        return this.form.get('healthchecks.threshold');
    }

    get hostHeaderField() {
        return this.form.get('host_header');
    }

    ngOnInit(): void {
        forkJoin([
            this.api.getAllServices(null, [], ['id', 'name', 'host']),
            this.api.getAllCertificates(null, [], ['id']),
            this.api.getAllUpstreams(null, [], ['id', 'name'])
        ]).pipe(map<any, any>(([services, certs, upstreams]) => {
            // forkJoin returns an array of values, here we map those values to an object
            return {services: services['data'], certs: certs['data'], upstreams: upstreams['data']};
        })).subscribe({
            next: (value) => {
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
                        this.servicesAvailable.set('srv-' + srv.name, srv.host);
                    }
                }

                // ordeno el Map
                this.servicesAvailable = new Map([...this.servicesAvailable.entries()].sort());
            },
            error: (error) => this.toast.error_general(error),
            complete: () => {

                // Si viene un upstream para editar
                if (this.upstreamIdEdit !== null) {
                    this.editMode = true;

                    // Rescato la info del upstream del api
                    this.api.getUpstream(this.upstreamIdEdit)
                        .subscribe({
                            next: (upstream) => {
                                // Añado el Host a la lista de válidos ya que lo estoy editando
                                this.servicesAvailable.set('up', upstream['name']);

                                // Cambios especiales para representarlos en el formulario
                                this.form.setValue(this.prepareDataForForm(upstream));
                            },
                            error: (error) => this.toast.error_general(error),
                            complete: () => {
                                this.loading = false;
                                this.selectHost();
                            }
                        });
                } else {
                    this.loading = false;
                    this.selectHost();
                }
            }
        });

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
    }

    ngOnDestroy(): void {
    }

    // Select the [up] host
    selectHost() {
        this.servicesAvailable.forEach((value, key) => {
            if (key === 'up') {
                this.nameField.setValue(value.toString());
            }
        });
    }

    /*
      Submit del formulario
   */
    onSubmit() {
        const result = this.prepareDataForKong(this.form.value);
        if (!this.editMode) {
            // llamo al API
            this.api.postNewUpstream(result)
                .subscribe({
                    next: (value) => {
                        this.toast.success('text.id_extra', 'success.new_upstream', {msgExtra: value['id']});
                        this.dialogRef.close(true);
                    },
                    error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                });
        }
        // Si venía es que es edición
        else {
            this.api.patchUpstream(this.upstreamIdEdit, result)
                .subscribe({
                    next: (value) => {
                        this.toast.success('text.id_extra', 'success.update_upstream', {msgExtra: value['id']});
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
            this.form.get('healthchecks.active.headers').setValue('true');

            keyInput.value = '';
            valInput.value = '';
        }
    }

    removeHeader(key): void {
        delete this.currentHeaders[key];
        if (_size(this.currentHeaders) === 0) {
            // Para poder consultar este campo en la validación final del formulario y saber si tiene algo
            this.form.get('healthchecks.active.headers').setValue(null);
        }
    }

    selectedTag($event: MatAutocompleteSelectedEvent) {
        this.currentTags.push($event.option.viewValue);
    }

    /**
     * Formatear los datos para rellenar el formulario
     */
    prepareDataForForm(upstream) {
        delete upstream['id'];
        delete upstream['created_at'];
        delete upstream['updated_at'];


        if (upstream['client_certificate'] && upstream['client_certificate']['id']) {
            upstream['client_certificate'] = upstream['client_certificate']['id'];
        } else {
            upstream['client_certificate'] = '';
        }

        if (upstream['host_header'] === '' || upstream['host_header'] === null) {
            upstream['host_header'] = '';
        }

        this.currentHeaders = upstream['healthchecks']['active']['headers'] || [];
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

        if (this.currentHeaders && Object.getOwnPropertyNames(this.currentHeaders).length > 0) {
            body.healthchecks.active.headers = this.currentHeaders;
        } else {
            body.healthchecks.active.headers = {};
        }

        if (body.host_header === '' || body.host_header === null) {
            body.host_header = null;
        }
        if (body.hash_on_cookie === '' || body.hash_on_cookie === null) {
            body.hash_on_cookie = null;
        }
        if (body.hash_on_header === '' || body.hash_on_header === null) {
            body.hash_on_header = null;
        }
        if (body.hash_fallback_header === '' || body.hash_fallback_header === null) {
            body.hash_fallback_header = null;
        }
        if (body.hash_on_query_arg === '' || body.hash_on_query_arg === null) {
            body.hash_on_query_arg = null;
        }
        if (body.hash_fallback_query_arg === '' || body.hash_fallback_query_arg === null) {
            body.hash_fallback_query_arg = null;
        }
        if (body.hash_on_uri_capture === '' || body.hash_on_uri_capture === null) {
            body.hash_on_uri_capture = null;
        }
        if (body.hash_fallback_uri_capture === '' || body.hash_fallback_uri_capture === null) {
            body.hash_fallback_uri_capture = null;
        }

        if (body.healthchecks.active.https_sni === '' || body.healthchecks.active.https_sni === null) {
            body.healthchecks.active.https_sni = null;
        }

        return body;
    }
}


function HashFormValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors => {
        const hashOn = fg.get('hash_on').value;
        const hashOnHeader = fg.get('hash_on_header').value;
        const hashOnQueryArg = fg.get('hash_on_query_arg').value;
        const hashOnUriCapture = fg.get('hash_on_uri_capture').value;
        const hashFallback = fg.get('hash_fallback').value;
        const hashFallbackHeader = fg.get('hash_fallback_header').value;
        const hashFallbackQueryArg = fg.get('hash_fallback_query_arg').value;
        const hashFallbackUriCapture = fg.get('hash_fallback_uri_capture').value;
        const hashOnCookie = fg.get('hash_on_cookie').value;
        const hashOnCookiePath = fg.get('hash_on_cookie_path').value;
        let valid = true;
        let error = null;

        // Dependiendo del hash on y fallback necesito unos campos u otros
        if (hashOn === 'header' && (hashOnHeader === '' || hashOnHeader === null)) {
            error = {hashOnForm: hashOn};
            valid = false;
        }
        if (hashFallback === 'header' && (hashFallbackHeader === '' || hashFallbackHeader === null)) {
            error = {hashFallbackForm: hashFallback};
            valid = false;
        }
        if ((hashOn === 'cookie' || hashFallback === 'cookie') && (hashOnCookie === '' || hashOnCookie === null
            || hashOnCookiePath === '' || hashOnCookiePath === null || !_startsWith(hashOnCookiePath, '/'))) {
            error = {hashCookieForm: hashOn};
            valid = false;
        }
        if (hashOn === 'query_arg' && (hashOnQueryArg === '' || hashOnQueryArg === null)) {
            error = {hashOnForm: hashOn};
            valid = false;
        }
        if (hashFallback === 'query_arg' && (hashFallbackQueryArg === '' || hashFallbackQueryArg === null)) {
            error = {hashFallbackForm: hashFallback};
            valid = false;
        }
        if (hashOn === 'uri_capture' && (hashOnUriCapture === '' || hashOnUriCapture === null)) {
            error = {hashOnForm: hashOn};
            valid = false;
        }
        if (hashFallback === 'uri_capture' && (hashFallbackUriCapture === '' || hashFallbackUriCapture === null)) {
            error = {hashFallbackForm: hashFallback};
            valid = false;
        }

        return valid ? null : error;
    };
}
