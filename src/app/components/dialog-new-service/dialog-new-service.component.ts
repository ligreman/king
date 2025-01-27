import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators, FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {sortedUniq as _sortedUniq} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {ToastService} from '../../services/toast.service';
import {CustomValidators} from '../../shared/custom-validators';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-new-service',
    templateUrl: './dialog-new-service.component.html',
    styleUrls: ['./dialog-new-service.component.scss'],
    standalone: false
})
export class DialogNewServiceComponent implements OnInit, OnDestroy {
    // Uso la variable para el estado del formulario
    formValid = false;
    validProtocols = ['http', 'https', 'grpc', 'grpcs', 'tcp', 'tls', 'udp'];
    searchControl = new FormControl('');
    currentTags = [];
    certificatesAvailable = [];
    caCertificatesAvailable = [];
    allTags = [];
    editMode = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    services = [];
    filteredServices: any[] = [];

    form = this.fb.group({
        name: ['', [Validators.required, CustomValidators.isAlphaNum()]],
        input_method: ['url', Validators.required],
        url: ['', [Validators.required, CustomValidators.isHostProtocolPort(this.validProtocols)]],
        protocol: ['', [Validators.required, CustomValidators.isProtocol(this.validProtocols)]],
        host: ['', [Validators.required, CustomValidators.isHost()]],
        port: ['', [Validators.required, CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]],
        path: ['/', [Validators.pattern(/^\//)]],
        enabled: [true],
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
                public dialogRef: MatDialogRef<DialogNewServiceComponent>) {
    }

    /*
        Getters de campos del formulario
     */
    get nameField() {
        return this.form.get('name');
    }

    get inputMethodField() {
        return this.form.get('input_method');
    }

    get enabledField() {
        return this.form.get('enabled');
    }

    get urlField() {
        return this.form.get('url');
    }

    get protocolField() {
        return this.form.get('protocol');
    }

    get hostField() {
        return this.form.get('host');
    }

    get portField() {
        return this.form.get('port');
    }

    get pathField() {
        return this.form.get('path');
    }

    get retriesField() {
        return this.form.get('retries');
    }

    get connectTimeoutField() {
        return this.form.get('connect_timeout');
    }

    get writeTimeoutField() {
        return this.form.get('write_timeout');
    }

    get readTimeoutField() {
        return this.form.get('read_timeout');
    }

    get tlsVerifyDepthField() {
        return this.form.get('tls_verify_depth');
    }

    get caCertificatesField() {
        return this.form.get('ca_certificates');
    }

    ngOnInit(): void {
        // Recupero la lista de certificados
        this.api.getAllCertificates(null, [], ['id'])
            .then((certs) => {
                for (let cert of certs['data']) {
                    this.certificatesAvailable.push(cert.id);
                }
            })
            .catch(error=>{
                this.toast.error_general(error);
            });

        // Recupero la lista de certificados
        this.api.getAllCACertificates(null, [], ['id'])
            .then((cacerts) => {
                for (let cert of cacerts['data']) {
                    this.caCertificatesAvailable.push(cert.id);
                }
            })
            .catch(error=>{
                this.toast.error_general(error);
            });

        // Si viene un servicio para editar
        if (this.serviceIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getService(this.serviceIdEdit)
                .subscribe({
                    next: (service) => {
                        // Cambios especiales para representarlos en el formulario
                        this.form.setValue(this.prepareDataForForm(service));

                        // Estado inicial de los campos disabled
                        this.changeRadio();
                    },
                    error: (error) => this.toast.error_general(error)
                });
        } else {
            // Estado inicial de los campos disabled
            this.changeRadio();
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

        // Retrieve the list of services
        this.api.getAllServices()
            .then((services) => {
                this.services = services['data'];
                this.filteredServices = this.services;
            })
            .catch(error=>{
                this.toast.error_general(error);
            });
        this.searchControl.valueChanges.subscribe((value: string) => {
            this.filterServices(value);
            });
    }

    ngOnDestroy(): void {
    }

    // In your component's TypeScript file
    displayFn = (svcId: any): string => {
        const svc = this.services.find(s => s.id === svcId);
        return svc ? (svc.name ? svc.name : svc.id) : '';
    }

    filterServices(searchTerm: string): void {
        if (!searchTerm) {
          this.filteredServices = this.services;
        } else {
            this.filteredServices = this.services.filter(svc => {
                let instanceName = svc.name ?? ''; // Use empty string if instance_name is null or undefined
                return instanceName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
      } 

    onServiceChange(event) {
        let event_value = '';
        if (event instanceof MatAutocompleteSelectedEvent) {
            event_value = event.option.value;
        } else {
            event_value = event.value;
        }
        // Find the selected route in the routes array
        const selectedService = this.services.find(svc => svc.id === event_value);
        const selectedServiceCopy = {...selectedService};

        if (selectedService) {
            // Prepare the data for the form based on the selected route
            const formData = this.prepareDataForForm(selectedServiceCopy);

            // Update the form with the data from the selected route
            this.form.patchValue(formData);

            // Enable fields
            this.form.controls['input_method'].setValue('complete');
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
        const result = this.prepareDataForKong(this.form.value);
        // Si no venía selected, es que es nuevo servicio
        if (!this.editMode) {
            // llamo al API
            this.api.postNewService(result)
                .subscribe({
                    next: value => {
                        this.toast.success('text.id_extra', 'success.new_service', {msgExtra: value['id']});
                        this.dialogRef.close(true);
                    },
                    error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                });
        }
        // Si venía es que es edición
        else {
            this.api.patchService(this.serviceIdEdit, result)
                .subscribe({
                    next: value => {
                        this.toast.success('text.id_extra', 'success.update_service', {msgExtra: value['id']});
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

    /**
     * Formatear los datos para rellenar el formulario
     */
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
