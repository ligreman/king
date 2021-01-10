import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CustomValidators } from '../../shared/custom-validators';

@Component({
    selector: 'app-dialog-new-plugin',
    templateUrl: './dialog-new-plugin.component.html',
    styleUrls: ['./dialog-new-plugin.component.scss']
})
export class DialogNewPluginComponent implements OnInit {
    // Uso la variable para el estado del formulario
    formValid = false;
    validProtocols = ['http', 'https', 'tcp', 'tls', 'udp', 'grpc', 'grpcs'];
    currentTags = [];
    editMode = false;
    servicesList;
    routesList;
    consumersList;
    pluginsList;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    form = this.fb.group({
        name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9\-._~]+$/)]],
        route: [''],
        service: [''],
        consumer: [''],
        protocols: ['', [Validators.required, CustomValidators.isArrayOfOneOf(this.validProtocols)]],
        enabled: [true, [CustomValidators.isBoolean(true)]],
        config: ['', []],
        tags: ['']
    });

    // }, {validators: [FinalFormValidator()]});

    constructor(@Inject(MAT_DIALOG_DATA) public pluginIdEdit: any, private fb: FormBuilder, private api: ApiService, private toast: ToastService,
                public dialogRef: MatDialogRef<DialogNewPluginComponent>) { }

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
        })).subscribe(value => {
            this.servicesList = value.services;
            this.routesList = value.routes;
            this.consumersList = value.consumers;
            this.pluginsList = value.plugins.sort();
        });

        // Si viene un servicio para editar
        if (this.pluginIdEdit !== null) {
            this.editMode = true;

            // Rescato la info del servicio del api
            this.api.getPlugin(this.pluginIdEdit)
                .subscribe(plugin => {
                    // Relleno el formuarlio
                    this.form.setValue(this.prepareDataForForm(plugin));
                }, error => {
                    this.toast.error_general(error);
                });
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

        return plugin;
    }

    prepareDataForKong(body) {
        // Genero el body para la petición API
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

    get serviceField() { return this.form.get('service'); }

    get routeField() { return this.form.get('route'); }

    get consumerField() { return this.form.get('consumer'); }

    get protocolsField() { return this.form.get('protocols'); }

    get enabledField() { return this.form.get('enabled'); }

    get configField() { return this.form.get('config'); }

    get tagsField() { return this.form.get('tags'); }
}

