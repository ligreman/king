import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isEmpty as _isEmpty, max as _max, min as _min, sortedUniq as _sortedUniq } from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { DialogHelperService } from '../../services/dialog-helper.service';
import { GlobalsService } from '../../services/globals.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../../shared/custom-validators';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-new-rsu',
    templateUrl: './dialog-new-rsu.component.html',
    styleUrls: ['./dialog-new-rsu.component.scss']
})
export class DialogNewRsuComponent implements OnInit, OnDestroy {
    // Uso la variable para el estado del formulario
    formValid = false;
    validProtocols = ['http', 'https'];
    allTags = [];
    currentTags = [];
    expressions = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    validETransforms = [];
    validETransformsStrings = ['lower'];
    validEFields = ['http.method', 'http.host', 'http.path', 'http.headers.header_name', 'net.protocol', 'net.port', 'tls.sni'];
    validEOpsStrings = ['==', '!=', '~', '^=', '=^', 'in', 'not in'];
    validEOpsIntegers = ['==', '!=', '>', '>=', '<', '<='];
    eType = 'string';


    form = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-._~]+$/)]],
        tags: [''],
        route: this.fb.group({
            protocols: ['', [Validators.required, CustomValidators.isProtocolListValidForRoute(this.validProtocols)]],
            expression: ['', [Validators.required]],
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

    constructor(@Inject(MAT_DIALOG_DATA) public routeIdEdit: any, private fb: FormBuilder, private api: ApiService, private globals: GlobalsService, private toast: ToastService, public dialogRef: MatDialogRef<DialogNewRsuComponent>, private dialogHelper: DialogHelperService) { }

    /*
        Getters de campos del formulario
     */
    get nameField() { return this.form.get('name'); }

    get serviceProtocolField() { return this.form.get('service.protocol'); }

    get serviceHostField() { return this.form.get('service.host'); }

    get servicePortField() { return this.form.get('service.port'); }

    get servicePathField() { return this.form.get('service.path'); }

    get serviceRetriesField() { return this.form.get('service.retries'); }

    get serviceTimeoutsField() { return this.form.get('service.timeouts'); }

    get routeProtocolsField() { return this.form.get('route.protocols'); }

    get routeExpressionField() { return this.form.get('route.expression'); }

    get targetsField() { return this.form.get('upstream.targets');}

    ngOnInit(): void {
        this.dialogHelper.getRouterMode().then(() => {
            // Si no estoy en modo expressions cambio la tabla
            if (this.globals.ROUTER_MODE !== 'expressions') {
                this.expressions = false;
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
        }).catch(() => this.toast.error('error.route_mode'));
    }

    ngOnDestroy(): void {
    }

    /*
        Submit del formulario
     */
    onSubmit() {
        const result = this.prepareDataForKong(this.form.value);
        // llamo al API para crear el servicio
        this.api.postNewService(result.service).subscribe({
            next: (newService) => {
                // Ahora creo la ruta y el Upstream
                result.route.service.id = newService['id'];

                forkJoin([this.api.postNewRoute(result.route), this.api.postNewUpstream(result.upstream)])
                    .subscribe({
                        next: () => {
                            this.toast.success('success.new_rsu');
                            this.dialogRef.close(true);
                        },
                        error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                    });
            },
            error: (error) => this.toast.error_general(error, {disableTimeOut: true})
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

    btnAppend(txt): void {
        if (txt) {
            this.form.get('route.expression').setValue(this.form.get('route.expression').value + txt);
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
            this.form.get('route.expression').setValue(this.form.get('route.expression').value + out);
        }
    }

    changeEField(newField) {
        if (newField === 'net.port') {
            this.eType = 'int';
        } else {
            this.eType = 'string';
        }
    }

    prepareDataForKong(body) {
        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
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
                expression: body.route.expression,
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
