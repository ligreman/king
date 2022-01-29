import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isEmpty as _isEmpty, max as _max, min as _min, sortedUniq as _sortedUniq } from 'lodash';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../../shared/custom-validators';

@Component({
    selector: 'app-dialog-new-rsu',
    templateUrl: './dialog-new-rsu.component.html',
    styleUrls: ['./dialog-new-rsu.component.scss']
})
export class DialogNewRsuComponent implements OnInit {
    // Uso la variable para el estado del formulario
    formValid = false;
    validProtocols = ['http', 'https'];
    validMethods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'CONNECT', 'OPTIONS', 'TRACE'];
    allTags = [];
    currentTags = [];
    currentPaths = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];


    form = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-._~]+$/)]],
        tags: [''],
        route: this.fb.group({
            protocols: ['', [Validators.required, CustomValidators.isProtocolListValidForRoute(this.validProtocols)]],
            methods: ['', []],
            paths: [''],
            strip_path: [true]
        }),
        service: this.fb.group({
            protocol: ['', [Validators.required, CustomValidators.isProtocol(this.validProtocols)]],
            host: ['', [Validators.required, CustomValidators.isHost()]],
            port: ['', [Validators.required, CustomValidators.isNumber(), Validators.min(0), Validators.max(65535)]],
            path: ['/', [Validators.pattern(/^\//), Validators.required]],
            retries: [5, [CustomValidators.isNumber(), Validators.min(0), Validators.max(32767)]],
            timeouts: [60000, [CustomValidators.isNumber(), Validators.min(1), Validators.max(2147483646)]]
        }),
        upstream: this.fb.group({
            targets: [1, [CustomValidators.isNumber(), Validators.min(1)]]
        }),

        paths_validation: ['']
    }, {validators: [FinalFormValidator()]});

    constructor(@Inject(MAT_DIALOG_DATA) public routeIdEdit: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                public dialogRef: MatDialogRef<DialogNewRsuComponent>) { }

    /*
        Getters de campos del formulario
     */
    get nameField() { return this.form.get('name'); }

    get tagsField() { return this.form.get('tags'); }

    get serviceProtocolField() { return this.form.get('service.protocol'); }

    get serviceHostField() { return this.form.get('service.host'); }

    get servicePortField() { return this.form.get('service.port'); }

    get servicePathField() { return this.form.get('service.path'); }

    get serviceRetriesField() { return this.form.get('service.retries'); }

    get serviceTimeoutsField() { return this.form.get('service.timeouts'); }

    get routeProtocolsField() { return this.form.get('route.protocols'); }

    get routeMethodsField() { return this.form.get('route.methods'); }

    get routePathsField() { return this.form.get('route.paths'); }

    get routeStripPathField() { return this.form.get('route.strip_path'); }

    get targetsField() { return this.form.get('upstream.targets');}

    ngOnInit(): void {
        // Lista de tags
        this.api.getTags()
            .subscribe(res => {
                // Recojo las tags
                res['data'].forEach(data => {
                    this.allTags.push(data.tag);
                });
                this.allTags.sort();
                this.allTags = _sortedUniq(this.allTags);
            });
    }

    /*
        Submit del formulario
     */
    onSubmit() {
        const result = this.prepareDataForKong(this.form.value);
        // llamo al API para crear el servicio
        this.api.postNewService(result.service).subscribe(newService => {
            // Ahora creo la ruta y el Upstream
            result.route.service.id = newService['id'];

            forkJoin({
                theRoute: this.api.postNewRoute(result.route),
                theUpstream: this.api.postNewUpstream(result.upstream)
            }).subscribe(results => {
                this.toast.success('success.new_rsu');
                this.dialogRef.close(true);
            }, error => {
                this.toast.error_general(error, {disableTimeOut: true});
            });
        }, error => {
            this.toast.error_general(error, {disableTimeOut: true});
        });
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
        Gestión de rutas
     */
    addPath(event: MatChipInputEvent): void {
        const input = event.chipInput.inputElement;
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

    prepareDataForKong(body) {
        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
        }

        if (this.currentPaths && this.currentPaths.length > 0) {
            body.route.paths = this.currentPaths;
        } else {
            body.route.paths = [];
        }

        if (_isEmpty(this.routeMethodsField.value)) {
            body.route.methods = [];
        }

        // Cálculo de slots del upstream
        let slotis = body.upstream.targets * 100;
        slotis = _max([10, slotis]);
        slotis = _min([65536, slotis]);

        return {
            service: {
                name: body.name,
                retries: body.service.retries,
                protocol: body.service.protocol,
                host: body.service.host,
                port: body.service.port,
                path: body.service.path,
                connect_timeout: body.service.timeouts,
                write_timeout: body.service.timeouts,
                read_timeout: body.service.timeouts,
                tags: body.tags
            },
            route: {
                name: body.name,
                service: {id: ''},
                protocols: body.route.protocols,
                methods: body.route.methods,
                paths: body.route.paths,
                strip_path: body.route.strip_path,
                tags: body.tags
            },
            upstream: {
                name: body.service.host,
                slots: slotis,
                tags: body.tags
            }
        };
    }
}

/*
    Validación final del formulario
 */
function FinalFormValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors => {

        const protos = fg.get('route.protocols').value;
        let valid = true;

        // For http or https, at least one of methods or paths;
        if ((protos.includes('http') || protos.includes('https')) && _isEmpty(fg.get('route.methods').value) && _isEmpty(fg.get('paths_validation').value)) {
            valid = false;
        }

        return valid ? null : {finalValidation: protos};
    };
}
