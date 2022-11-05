import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
    get as _get,
    isArray as _isArray,
    isObject as _isObject,
    orderBy as _orderBy,
    set as _set,
    sortedUniq as _sortedUniq,
    toInteger as _toInteger
} from 'lodash';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../../shared/custom-validators';

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-new-plugin',
    templateUrl: './dialog-new-plugin.component.html',
    styleUrls: ['./dialog-new-plugin.component.scss']
})
export class DialogNewPluginComponent implements OnInit, OnDestroy {
    // Uso la variable para el estado del formulario
    formValid = false;
    defaultProtocols = ['http', 'https', 'tcp', 'tls', 'udp', 'grpc', 'grpcs'];
    validProtocols = this.defaultProtocols;
    currentTags = [];
    allTags = [];
    editMode = false;
    servicesList;
    routesList;
    consumersList;
    pluginsList;
    pluginForm = [];
    arrayFields = [];
    fieldTypes = {};
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', [Validators.required]],
        route: this.fb.group({
            id: []
        }),
        service: this.fb.group({
            id: []
        }),
        consumer: this.fb.group({
            id: []
        }),
        protocols: ['', [Validators.required, CustomValidators.isArrayOfOneOf(this.validProtocols)]],
        enabled: [true, [CustomValidators.isBoolean(true)]],
        config: this.fb.group({}),
        tags: ['']
    });

    constructor(@Inject(MAT_DIALOG_DATA) public pluginData: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                public dialogRef: MatDialogRef<DialogNewPluginComponent>) { }

    /*
        Getters de campos del formulario
     */
    get nameField() { return this.form.get('name'); }

    get serviceField() { return this.form.get('service.id'); }

    get routeField() { return this.form.get('route.id'); }

    get consumerField() { return this.form.get('consumer.id'); }

    get protocolsField() { return this.form.get('protocols'); }

    ngOnInit(): void {
        // Recojo del api los datos
        forkJoin([
            this.api.getServices(),
            this.api.getRoutes(),
            this.api.getConsumers(),
            this.api.getPluginsEnabled()
        ]).pipe(map(([services, routes, consumers, plugins]) => {
            // forkJoin returns an array of values, here we map those values to an object
            return {services: services['data'], routes: routes['data'], consumers: consumers['data'], plugins: plugins['enabled_plugins']};
        })).subscribe((value) => {
            value.services = _orderBy(value.services, ['name'], ['asc']);
            value.routes = _orderBy(value.routes, ['name'], ['asc']);
            value.consumers = _orderBy(value.consumers, ['username'], ['asc']);

            this.servicesList = value.services;
            this.routesList = value.routes;
            this.consumersList = value.consumers;
            this.pluginsList = value.plugins.sort();

            // ¿vienen datos extra con el service, route o consumer ya elegido?
            if (this.pluginData !== null && this.pluginData.extras !== null) {
                switch (this.pluginData.extras.group) {
                    case 'route':
                        this.routeField.setValue(this.pluginData.extras.id);
                        break;
                    case 'service':
                        this.serviceField.setValue(this.pluginData.extras.id);
                        break;
                    case 'consumer':
                        this.consumerField.setValue(this.pluginData.extras.id);
                        break;
                }
            }
        });

        // Si viene un plugin para editar
        if (this.pluginData !== null && this.pluginData.selectedId !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getPlugin(this.pluginData.selectedId)
                .subscribe({
                    next: (plugin) => {
                        // Primero he de disparar el evento de cambio de schema para que cargue los campos de formulario
                        this.nameField.setValue(plugin['name']);
                        this.pluginChange(plugin);

                        // Como estoy en modo edición, no permito cambiar el tipo de plugin
                        this.nameField.disable();
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
    }

    ngOnDestroy(): void {
    }

    /*
        Submit del formulario
     */
    onSubmit() {
        const result = this.prepareDataForKong(this.form.value);
        if (!this.editMode) {
            // llamo al API
            this.api.postNewPlugin(result)
                .subscribe({
                    next: (value) => {
                        this.toast.success('text.id_extra', 'success.new_plugin', {msgExtra: value['id']});
                        this.dialogRef.close(true);
                    },
                    error: (error) => this.toast.error_general(error, {disableTimeOut: true})
                });
        }
        // Si es que es edición
        else {
            this.api.patchPlugin(this.pluginData.selectedId, result)
                .subscribe({
                    next: (value) => {
                        this.toast.success('text.id_extra', 'success.update_plugin', {msgExtra: value['id']});
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

    /*
        Preparo los datos
     */
    prepareDataForForm(plugin) {
        // Cambios especiales para representarlos en el formulario
        delete plugin['id'];
        delete plugin['created_at'];
        delete plugin['updated_at'];

        this.currentTags = plugin['tags'] || [];
        plugin['tags'] = [];

        if (plugin['route'] === null) {
            plugin['route'] = {id: null};
        }
        if (plugin['service'] === null) {
            plugin['service'] = {id: null};
        }
        if (plugin['consumer'] === null) {
            plugin['consumer'] = {id: null};
        }

        // Campos array
        this.arrayFields.forEach(field => {
            // Cojo el array de valores
            const fValue = _get(plugin, field, null);
            if (fValue !== null && _isArray(fValue)) {
                _set(plugin, field, fValue.join('\n'));
            } else if (fValue !== null && _isObject(fValue)) {
                const keys = Object.getOwnPropertyNames(fValue);
                let converted = [];

                keys.forEach(key => {
                    converted.push(key + ':' + fValue[key]);
                });

                _set(plugin, field, '' + converted.join('\n'));
            } else {
                _set(plugin, field, null);
            }
        });

        return plugin;
    }

    prepareDataForKong(body) {
        // Genero el body para la petición API
        if (this.currentTags && this.currentTags.length > 0) {
            body.tags = this.currentTags;
        } else {
            body.tags = [];
        }

        if (this.routeField.value === '' || this.routeField.value === null) {
            body.route = null;
        }
        if (this.serviceField.value === '' || this.serviceField.value === null) {
            body.service = null;
        }
        if (this.consumerField.value === '' || this.consumerField.value === null) {
            body.consumer = null;
        }

        // Los campos que vengan como cadena vacía, los paso a null
        if (body.config) {
            Object.keys(body.config).forEach(field => {
                if (body.config[field] === '') {
                    body.config[field] = null;
                }
            });
        }

        // Campos array
        this.arrayFields.forEach(field => {
            const fValue = _get(body, field);
            // Si es nulo, vacío o undefined, o un array de un valor único que es vacío => le pongo de valor un array vacío
            if (fValue === '' || fValue === null || fValue === undefined || (_isArray(fValue) && fValue.length === 1 && fValue[0] === '')) {
                _set(body, field, []);
            } else if (!_isArray(fValue)) {
                let values = fValue.split('\n');
                let output;
                const confField = field.replace('config.', '');

                // Miro si he de convertir a integer
                if (this.fieldTypes[confField] === 'number' || this.fieldTypes[confField] === 'integer') {
                    output = values.map((el) => {
                        return _toInteger(el);
                    });
                }
                // Si es map, transformo a objeto
                else if (this.fieldTypes[confField] === 'map') {
                    output = {};
                    values.forEach(val => {
                        const [a, b] = val.split(':');
                        if (a !== undefined && b !== undefined) {
                            output[a] = b;
                        }
                    });
                } else {
                    output = values;
                }

                _set(body, field, output);
            } else {
                _set(body, field, fValue);
            }
        });

        return body;
    }

    /*
        Al cambiar el nombre del plugin
     */
    pluginChange(updateFormData = null) {
        // Obtengo el schema del plugin
        this.api.getPluginSchema(this.nameField.value)
            .subscribe((value) => {
                const pluginSchemaFields = this.parseSchema(value);
                this.arrayFields = [];
                this.fieldTypes = {};
                this.form.get('config').reset();

                const data = this.generateFormFields(pluginSchemaFields, 'config');

                this.form.setControl('config', data.dConfig);
                this.form.get('config').clearValidators();

                // Los campos para el HTML
                this.pluginForm = data.formFields;

                if (updateFormData !== null) {
                    setTimeout(() => {
                        this.form.setValue(this.prepareDataForForm(updateFormData));
                    }, 0);
                } else {
                    // De inicio pongo los valores de campos array como una entrada por línea
                    this.arrayFields.forEach(field => {
                        let f = this.form.get(field);
                        if (f.value !== null) {
                            f.setValue(f.value.join('\n'));
                        }
                    });
                }
            });
    }

    generateFormFields(schema, currentGroup) {
        // Genero el formulario dinámico
        let dConfig = this.fb.group({});
        let formFields = [];

        schema.forEach(element => {
            const keys = Object.getOwnPropertyNames(element);
            const field = keys[0];

            if (element.hasOwnProperty(field)) {
                const value = element[field];

                // Strings
                if (value.type === 'string') {
                    let validators = [];
                    let tipo = value.type;
                    let opts = null;

                    // Requerido
                    if (value.required) {
                        validators.push(Validators.required);
                    }

                    // Min len
                    if (value.len_min) {
                        validators.push(Validators.minLength(value.len_min));
                    }

                    // Max len
                    if (value.len_max) {
                        validators.push(Validators.maxLength(value.len_max));
                    }

                    // Si tiene one_of es un select
                    if (value.one_of) {
                        tipo = 'select';
                        opts = value.one_of;
                    }

                    dConfig.addControl(field, this.fb.control(value.default, validators));
                    formFields.push({
                        field: field,
                        type: tipo,
                        required: value.required || false,
                        options: opts,
                        multi: false
                    });
                }

                // Numbers
                if (value.type === 'number' || value.type === 'integer') {
                    let validators = [];
                    let hint = [null, null];

                    // Requerido
                    if (value.required) {
                        validators.push(Validators.required);
                    }

                    // gt
                    if (value.gt) {
                        validators.push(Validators.min(value.gt));
                        hint[0] = value.gt;
                    }

                    // lt
                    if (value.lt) {
                        validators.push(Validators.max(value.lt));
                        hint[1] = value.lt;
                    }

                    // Between
                    if (value.between) {
                        validators.push(Validators.min(value.between[0]));
                        validators.push(Validators.max(value.between[1]));
                        hint = value.between;
                    }

                    dConfig.addControl(field, this.fb.control(value.default, validators));
                    formFields.push({
                        field: field,
                        type: 'number',
                        required: value.required || false,
                        hint: hint
                    });
                }

                // Boolean
                if (value.type === 'boolean') {
                    let validators = [];

                    // Requerido
                    if (value.required) {
                        // validators.push(Validators.required);
                        validators.push(CustomValidators.isBoolean());
                    }

                    dConfig.addControl(field, this.fb.control(value.default, validators));
                    formFields.push({
                        field: field,
                        type: 'boolean',
                        required: value.required || false
                    });
                }

                // Maps (objetos)
                if (value.type === 'map') {
                    let validators = [];

                    // Requerido
                    if (value.required) {
                        // validators.push(Validators.required);
                        validators.push(CustomValidators.isBoolean());
                    }

                    this.arrayFields.push(currentGroup + '.' + field);
                    this.fieldTypes[field] = value.type;

                    dConfig.addControl(field, this.fb.control(value.default, validators));
                    formFields.push({
                        field: field,
                        type: 'map',
                        required: value.required || false
                    });
                }

                // Sets y arrays
                if (value.type === 'set' || value.type === 'array') {
                    let validators = [];
                    let tipo = 'array';
                    let opts = [];

                    // Requerido
                    if (value.required) {
                        // Si el valor por defecto es un array vacío, quito el requerido
                        if (value.default.length === 0) {
                            value.required = false;
                        } else {
                            validators.push(Validators.required);
                        }
                    }

                    // Si tiene one_of es un select
                    if (value.elements && value.elements.one_of) {
                        tipo = 'select';
                        opts = value.elements.one_of;
                    } else {
                        // Es un array de strings (no hay de otro tipo)
                        this.arrayFields.push(currentGroup + '.' + field);
                    }

                    // Guardo el tipo
                    if (value.elements && value.elements.type) {
                        this.fieldTypes[field] = value.elements.type;
                    }

                    dConfig.addControl(field, this.fb.control(value.default, validators));
                    formFields.push({
                        field: field,
                        type: tipo,
                        required: value.required || false,
                        options: opts,
                        multi: true
                    });
                }

                // Record -> Anidado
                if (value.type === 'record') {
                    // Llamada recursiva
                    const newData = this.generateFormFields(value.fields, currentGroup + '.' + field);

                    // Añado el grupo anidado
                    dConfig.addControl(field, newData.dConfig);
                    // Para el HTML
                    formFields.push({
                        field: field,
                        child_fields: newData.formFields,
                        type: value.type
                    });
                }
            }
        });

        return {dConfig, formFields};
    }

    parseSchema(schema) {
        let res = [];
        this.serviceField.enable();
        this.routeField.enable();
        this.consumerField.enable();
        this.validProtocols = this.defaultProtocols;

        schema.fields.forEach(field => {
            if (field['protocols'] && field['protocols']['elements'] && field['protocols']['elements']['one_of']) {
                this.validProtocols = field['protocols']['elements']['one_of'];
            }
            if (field['service'] && field['service']['eq'] === null) {
                this.serviceField.disable();
            }
            if (field['route'] && field['route']['eq'] === null) {
                this.routeField.disable();
            }
            if (field['consumer'] && field['consumer']['eq'] === null) {
                this.consumerField.disable();
            }
            if (field['config']) {
                res = field['config'].fields;
            }
        });

        return res;
    }

    createDocLink(plugin: string): string {
        let url = 'https://docs.konghq.com/hub/kong-inc/' + plugin;

        if (plugin === 'proxy-cache-redis') {
            url = 'https://github.com/ligreman/kong-proxy-cache-redis-plugin/blob/master/README.md';
        }

        if (plugin === 'proxy-cache-redis-cluster') {
            url = 'https://github.com/ligreman/kong-proxy-cache-redis-cluster-plugin/blob/main/README.md';
        }

        return url;
    }
}
