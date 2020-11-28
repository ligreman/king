import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { CustomValidators } from '../../shared/custom-validators';

@Component({
    selector: 'app-dialog-new-service',
    templateUrl: './dialog-new-service.component.html',
    styleUrls: ['./dialog-new-service.component.scss']
})
export class DialogNewServiceComponent implements OnInit {
    // Uso la variable para el estado del formulario
    formValid = false;
    validProtocols = ['http', 'https', 'grpc', 'grpcs', 'tcp', 'tls', 'udp'];
    tags = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-._~]+$/)]],
        input_method: ['url', Validators.required],
        url: ['', [Validators.required, Validators.pattern(/^(http|https|grpc|grpcs|tcp|tls|udp)+:\/\/(.+):([0-9]{1,5})(\/)?.*/)]],
        protocol: ['', Validators.required],
        host: ['', Validators.required],
        port: ['', [Validators.required, CustomValidators.isNumber(), Validators.min(1), Validators.max(65535)]],
        path: ['', [Validators.pattern(/^\//)]],
        retries: [5, [CustomValidators.isNumber(), Validators.min(0), Validators.max(20)]],
        connect_timeout: [60000, [CustomValidators.isNumber(), Validators.min(0), Validators.max(3600000)]],
        write_timeout: [60000, [CustomValidators.isNumber(), Validators.min(0), Validators.max(3600000)]],
        read_timeout: [60000, [CustomValidators.isNumber(), Validators.min(0), Validators.max(3600000)]],
        client_certificate: ['', Validators.pattern(/^[0-9abcdefABCDEF\-]+$/)],
        tls_verify: [''],
        tls_verify_depth: ['', [CustomValidators.isNumber(true)]],
        ca_certificates: ['', Validators.pattern(/^([0-9abcdefABCDEF\-]|[\r\n])+$/)],
        tags: ['']
    });

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
        // Estado inicial de los campos disabled
        this.changeRadio();
    }

    /*
        Al cambiar el tipo de input activo y desactivo campos
     */
    changeRadio() {
        this.urlField.disable();
        this.protocolField.disable();
        this.hostField.disable();
        this.portField.disable();
        this.pathField.disable();

        if (this.inputMethodField.value === 'url') {
            this.urlField.enable();
        } else {
            this.protocolField.enable();
            this.hostField.enable();
            this.portField.enable();
            this.pathField.enable();
        }
    }

    /*
        Submit del formulario
     */
    onSubmit() {
        // Genero el body a devolver
        let body = this.form.value;

        // Limpio el campo si viene como '' para enviar null
        if (this.tlsVerifyField.value === '') {
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

        if (this.tags.length > 0) {
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
        }

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

    get inputMethodField() { return this.form.get('input_method'); }

    get urlField() { return this.form.get('url'); }

    get protocolField() { return this.form.get('protocol'); }

    get hostField() { return this.form.get('host'); }

    get portField() { return this.form.get('port'); }

    get pathField() { return this.form.get('path'); }

    get retriesField() { return this.form.get('retries'); }

    get connectTimeoutField() { return this.form.get('connect_timeout'); }

    get writeTimeoutField() { return this.form.get('write_timeout'); }

    get readTimeoutField() { return this.form.get('read_timeout'); }

    get clientCertificateField() { return this.form.get('client_certificate'); }

    get tlsVerifyField() { return this.form.get('tls_verify'); }

    get tlsVerifyDepthField() { return this.form.get('tls_verify_depth'); }

    get caCertificatesField() { return this.form.get('ca_certificates'); }

    get tagsField() { return this.form.get('tags'); }
}
