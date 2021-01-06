import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
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
    currentTags = [];
    certificatesAvailable = [];
    caCertificatesAvailable = [];
    editMode = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', [Validators.required, CustomValidators.isAlphaNum()]],
        input_method: ['url', Validators.required],
        url: ['', [Validators.required, CustomValidators.isHostProtocolPort(this.validProtocols)]],
        protocol: ['', [Validators.required, CustomValidators.isProtocol(this.validProtocols)]],
        host: ['', [Validators.required, CustomValidators.isHost()]],
        port: ['', [Validators.required, CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]],
        path: ['', [Validators.pattern(/^\//)]],
        retries: [5, [CustomValidators.isNumber(), Validators.min(0), Validators.max(32767)]],
        connect_timeout: [60000, [CustomValidators.isNumber(), Validators.min(1), Validators.max(2147483646)]],
        write_timeout: [60000, [CustomValidators.isNumber(), Validators.min(1), Validators.max(2147483646)]],
        read_timeout: [60000, [CustomValidators.isNumber(), Validators.min(1), Validators.max(2147483646)]],
        client_certificate: [''],
        tls_verify: ['', [CustomValidators.isBoolean(true)]],
        tls_verify_depth: ['', [CustomValidators.isNumber(true), Validators.min(0), Validators.max(64)]],
        ca_certificates: [''],
        tags: ['']
    }, {validators: [ProtocolPathValidator()]});

    constructor(@Inject(MAT_DIALOG_DATA) public serviceIdEdit: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                public dialogRef: MatDialogRef<DialogNewServiceComponent>) { }

    ngOnInit(): void {
        // Recupero la lista de certificados
        this.api.getCertificates()
            .subscribe(certs => {
                for (let cert of certs['data']) {
                    this.certificatesAvailable.push(cert.id);
                }
            }, error => {
                this.toast.error_general(error);
            });

        // Recupero la lista de certificados
        this.api.getCACertificates()
            .subscribe(cacerts => {
                for (let cert of cacerts['data']) {
                    this.caCertificatesAvailable.push(cert.id);
                }
            }, error => {
                this.toast.error_general(error);
            });

        // Si viene un servicio para editar
        if (this.serviceIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getService(this.serviceIdEdit)
                .subscribe(service => {
                    // Cambios especiales para representarlos en el formulario
                    this.form.setValue(this.prepareDataForForm(service));

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
        this.dialogRef.close(this.prepareDataForKong(this.form.value));
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

    prepareDataForForm(service) {
        delete service['id'];
        delete service['created_at'];
        delete service['updated_at'];
        service['input_method'] = 'complete';
        service['url'] = '';

        if (service['client_certificate'] && service['client_certificate']['id']) {
            service['client_certificate'] = service['client_certificate']['id'];
        } else {
            service['client_certificate'] = '';
        }
        if (service['ca_certificates'] === null || service['ca_certificates'].length > 0) {
            service['ca_certificates'] = [];
        }
        if (service['tls_verify'] === null) {
            service['tls_verify'] = '';
        } else {
            service['tls_verify'] = '' + service['tls_verify'];
        }

        this.currentTags = service['tags'] || [];
        service['tags'] = [];

        return service;
    }

    prepareDataForKong(body) {
        if (body.input_method === 'url') {
            delete body.protocol;
            delete body.host;
            delete body.port;
            delete body.path;
        } else {
            delete body.url;

            if (body.path === '') {
                delete body.path;
            }
        }
        delete body.input_method;


        if (body.tls_verify === '' || body.tls_verify === null) {
            body.tls_verify = null;
        } else {
            // Convierto 'true' a true...
            body.tls_verify = body.tls_verify === 'true';
        }
        if (body.tls_verify_depth === '') {
            body.tls_verify_depth = null;
        }

        if (body.ca_certificates === '' || body.ca_certificates === null || body.ca_certificates.length === 0) {
            body.ca_certificates = null;
        }

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

        return body;
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

function ProtocolPathValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors => {
        const proto = fg.get('protocol').value;
        let valid = true;

        // Si no es http o https no puede llevar path
        if (fg.get('input_method').value === 'complete' && proto !== 'http' && proto !== 'https') {
            if (fg.get('path').value !== '' && fg.get('path').value !== null) {
                valid = false;
            }
        }

        return valid ? null : {protocol: proto};
    };
}
