import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {ToastService} from '../../services/toast.service';
import * as Joi from "joi";
import {CustomValidators} from "../../shared/custom-validators";
import {GlobalsService} from "../../services/globals.service";

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-settings',
    templateUrl: './dialog-settings.component.html',
    styleUrls: ['./dialog-settings.component.scss']
})
export class DialogSettingsComponent implements OnInit, OnDestroy {
    formValid = false;
    allowChangeConfigFile = true;
    config_file_url = '';

    form = this.fb.group({
        config_url: ['', []]
    }, {validators: [ConfigFormValidator()]});

    formLoop = this.fb.group({
        enabled: [false, [CustomValidators.isBoolean(false)]],
        where: ['', [Validators.required]],
        key_field: ['', [Validators.required]],
        token: ['', [Validators.required]]
    }, {});

    constructor(@Inject(MAT_DIALOG_DATA) public consumerIdEdit: any, private fb: FormBuilder, public dialogRef: MatDialogRef<DialogSettingsComponent>,
                private api: ApiService, private toast: ToastService, private globals: GlobalsService,) {
        /* TODO
            check enable or not
            where: header, query, body
            key field
            loopback url info (decirle que ponga la url de loopback en el campo de nodo de Kong)

            radio button "Auth plugin": 3 opciones
            basic auth: 2 campos user+pass
            key: token
            jwt: token (info de cómo generarlo)

            Aviso de que se guarda en local
            boton save, boton cancel
            El save guarda en localstorage los datos
        */

    }


    ngOnInit(): void {
        // Config file URL
        let confFileUrl = localStorage.getItem('kongConfigFileUrl');
        if (confFileUrl === null || confFileUrl === undefined) {
            confFileUrl = this.globals.CONFIG_URL;
        }
        this.config_file_url = confFileUrl;
        this.form.setValue({config_url: confFileUrl});
        this.allowChangeConfigFile = this.globals.ALLOW_CHANGE_CONFIG_FILE_URL;
    }

    ngOnDestroy(): void {
    }

    /*
      Submit del formulario
   */
    onSubmit() {
        // If i can save the config file url
        if (this.allowChangeConfigFile) {
            // CONFIG
            localStorage.setItem('kongConfigFileUrl', this.form.value.config_url);
        }

        this.toast.success('dialog.settings.saved', '', {timeOut:5000});
        this.dialogRef.close();
    }
}


/*
    Validación final del formulario
 */
function ConfigFormValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors => {
        let valid = true;
        let data = {configUrlValidation: false, confKongAllow: false};

        const schema = Joi.string().uri().allow('').allow('/config.json');
        const validation = schema.validate(fg.get('config_url').value);
        if (validation.error) {
            valid = false;
            data.configUrlValidation = true;
        }

        return valid ? null : data;
    };
}
