import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators, FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {orderBy as _orderBy, sortedUniq as _sortedUniq} from 'lodash';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {ToastService} from '../../services/toast.service';
import {CustomValidators} from '../../shared/custom-validators';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-new-route',
    templateUrl: './dialog-new-route.component.html',
    styleUrls: ['./dialog-new-route.component.scss'],
    standalone: false
})
export class DialogNewRouteComponent implements OnInit, OnDestroy {
    // Uso la variable para el estado del formulario
    formValid = false;
    validProtocols = ['http', 'https', 'tcp', 'tls', 'udp', 'grpc', 'grpcs'];
    validRedirectCodes = [426, 301, 302, 307, 308];
    validETransforms = [];
    validETransformsStrings = ['lower'];
    validEFields = ['http.method', 'http.host', 'http.path', 'http.headers.header_name', 'net.protocol', 'net.port', 'tls.sni'];
    validEOpsStrings = ['==', '!=', '~', '^=', '=^', 'in', 'not in'];
    validEOpsIntegers = ['==', '!=', '>', '>=', '<', '<='];
    eType = 'string';
    allTags = [];
    routes = [];
    filteredRoutes: any[] = [];
    searchControl = new FormControl('');
    currentTags = [];
    servicesAvailable = [];
    editMode = false;
    formE = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-._~]+$/)]],
        service: ['', [Validators.required]],
        expression: ['', [Validators.required]],
        priority: [0, [CustomValidators.isNumber(), Validators.min(0), Validators.max(999999)]],
        protocols: ['', [Validators.required, CustomValidators.isProtocolListValidForRoute(this.validProtocols)]],
        https_redirect_status_code: [426, [Validators.required, CustomValidators.isOneOf(this.validRedirectCodes)]],
        tags: [''],
        strip_path: [true],
        preserve_host: [false],
        request_buffering: [true, [Validators.required]],
        response_buffering: [true, [Validators.required]]
    }, {validators: [FinalFormValidator()]});

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(@Inject(MAT_DIALOG_DATA) public routeIdEdit: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                public dialogRef: MatDialogRef<DialogNewRouteComponent>) {
    }

    /*
        Getters de campos del formulario
     */
    get nameField() {
        return this.formE.get('name');
    }

    get serviceField() {
        return this.formE.get('service');
    }

    get protocolsField() {
        return this.formE.get('protocols');
    }

    get expressionField() {
        return this.formE.get('expression');
    }

    get priorityField() {
        return this.formE.get('priority');
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
            this.formE.patchValue(formData);
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

        // Si viene un route para editar
        if (this.routeIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getRoute(this.routeIdEdit)
                .subscribe({
                    next: (route) => {
                        // Relleno el formuarlio
                        this.formE.setValue(this.prepareDataForForm(route));
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
                this.filteredRoutes = this.routes;
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
        result = this.prepareDataForKong(this.formE.value);

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

    btnAppend(txt): void {
        if (txt) {
            this.formE.get('expression').setValue(this.formE.get('expression').value + txt);
        }
    }

    btnExp(transform, field, op, value): void {
        let out = '';

        value = value.replace(/"/g, '').replace(/'/g, '');
        // Si no tiene comillas dobles las añado
        value = '"' + value + '"';

        if (field && op && value) {
            out = field;
            if (transform) {
                out = transform + '(' + out + ')';
            }
            out += ' ' + op + ' ' + value;
            this.formE.get('expression').setValue(this.formE.get('expression').value + out);
        }
    }

    changeEField(newField) {
        if (newField === 'net.port') {
            this.eType = 'int';
        } else {
            this.eType = 'string';
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

        // Elimino campos del route_flavour "no expressions" que vienen en la respuesta y provocan errores
        delete route['destinations'];
        delete route['methods'];
        delete route['regex_priority'];
        delete route['paths'];
        delete route['snis'];
        delete route['hosts'];
        delete route['headers'];
        delete route['path_handling'];
        delete route['sources'];

        this.currentTags = route['tags'] || [];
        route['tags'] = [];

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

        return valid ? null : {finalValidation: protos};
    };
}
