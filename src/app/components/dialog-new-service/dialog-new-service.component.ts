import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { isNumber } from 'lodash';

@Component({
    selector: 'app-dialog-new-service',
    templateUrl: './dialog-new-service.component.html',
    styleUrls: ['./dialog-new-service.component.scss']
})
export class DialogNewServiceComponent implements OnInit {
    validProtocols = ['http', 'https', 'grpc', 'grpcs', 'tcp', 'tls', 'udp'];
    tags = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', Validators.required],
        input_method: ['url', Validators.required],
        url: ['', Validators.required],
        protocol: ['', Validators.required],
        host: ['', Validators.required],
        port: ['', [Validators.required, Validators.min(0), Validators.max(65535)]],
        path: ['', [Validators.pattern(/^\//)]],
        retries: [5, [Validators.min(0), Validators.max(20)]],
        connect_timeout: [60000, [Validators.min(0), Validators.max(3600000)]],
        write_timeout: [60000, [Validators.min(0), Validators.max(3600000)]],
        read_timeout: [60000, [Validators.min(0), Validators.max(3600000)]],
        client_certificate: [''],
        tls_verify: [''],
        tls_verify_depth: [''],
        ca_certificates: [''],
        tags: ['']
    });

    constructor(private fb: FormBuilder) { }

    ngOnInit(): void {
    }

    /*
        Validamos los campos del formulario
     */
    isValid(): boolean {
        let status = true;
        // Compruebo que los campos requeridos, según lo seleccionado, son válidos
        if (this.nameField.invalid || (this.inputMethodField.value === 'url' && this.urlField.invalid)) {
            status = false;
        }

        if (this.inputMethodField.value === 'complete' && (this.protocolField.invalid || this.hostField.invalid || this.portField.invalid || this.pathField.invalid)) {
            status = false;
        }

        if (this.retriesField.invalid || this.connectTimeoutField.invalid || this.writeTimeoutField.invalid || this.readTimeoutField.invalid) {
            status = false;
        }

        if (!isNumber(this.retriesField.value) || !isNumber(this.connectTimeoutField.value) || !isNumber(this.writeTimeoutField.value) ||
            !isNumber(this.readTimeoutField.value || (this.tlsVerifyDepthField.value !== '' && !isNumber(this.tlsVerifyDepthField.value)))) {
            status = false;
        }

        return status;
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
