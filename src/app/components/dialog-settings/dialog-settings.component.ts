import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AutoUnsubscribe} from 'ngx-auto-unsubscribe';
import {ApiService} from '../../services/api.service';
import {ToastService} from '../../services/toast.service';
import * as Joi from "joi";
import {GlobalsService} from "../../services/globals.service";

@AutoUnsubscribe()
@Component({
    selector: 'app-dialog-settings',
    templateUrl: './dialog-settings.component.html',
    styleUrls: ['./dialog-settings.component.scss'],
    standalone: false
})
export class DialogSettingsComponent implements OnInit, OnDestroy {
    formValid = false;
    allowChangeConfigFile = true;
    config_file_url = '';

    form = this.fb.group({
        config_url: ['', []],
        where: ['', []],
        key_field: ['', []],
        token: ['', []]
    }, {validators: [ConfigFormValidator()]});

    constructor(@Inject(MAT_DIALOG_DATA) public consumerIdEdit: any, private fb: FormBuilder, public dialogRef: MatDialogRef<DialogSettingsComponent>,
                private api: ApiService, private toast: ToastService, private globals: GlobalsService,) {
    }


    ngOnInit(): void {
        // Config file URL
        let confFileUrl = localStorage.getItem('kongConfigFileUrl');
        if (confFileUrl === null || confFileUrl === undefined) {
            confFileUrl = this.globals.CONFIG_URL;
        }
        this.config_file_url = confFileUrl;

        const confFile = localStorage.getItem('kongConfig');
        let w = '', k = '', t = '';
        if (confFile !== null && confFile !== undefined && confFile !== '') {
            try {
                const aux = JSON.parse(atob(confFile));
                w = aux['kong_admin_authorization_method'];
                k = aux['kong_admin_authorization_field'];
                t = aux['kong_admin_authorization_token'];
            } catch (e) {
                console.error(e);
            }
        }

        this.form.setValue({config_url: confFileUrl, where: w, key_field: k, token: t});
        this.allowChangeConfigFile = this.globals.ALLOW_CHANGE_CONFIG_FILE_URL;
    }

    ngOnDestroy(): void {
    }

    /*
      Submit del formulario
   */
    onSubmit() {
        let localCfg = {
            kong_admin_authorization_method: this.form.value.where,
            kong_admin_authorization_field: this.form.value.key_field,
            kong_admin_authorization_token: this.form.value.token
        };

        // If I can save the config file url
        if (this.allowChangeConfigFile) {
            // CONFIG
            localStorage.setItem('kongConfigFileUrl', this.form.value.config_url);
            localCfg['kong_admin_url'] = this.form.value.config_url;
        }

        // Save auth settings
        localStorage.setItem('kongConfig', btoa(JSON.stringify(localCfg)));

        this.toast.success('dialog.settings.saved', '', {timeOut: 5000});
        this.dialogRef.close();
    }
}


/*
    Validación final del formulario
 */
function ConfigFormValidator(): ValidatorFn {
    return (fg: AbstractControl): ValidationErrors => {
        let valid = true;
        let data = {configUrlValidation: false, confKongAllow: false, key_field: false, token: false};

        const schema = Joi.string().uri().allow('').allow('/config.json');
        const validation = schema.validate(fg.get('config_url').value);
        if (validation.error) {
            valid = false;
            data.configUrlValidation = true;
        }

        const w = fg.get('where').value;
        const k = fg.get('key_field').value;
        const t = fg.get('token').value;

        if (w) {
            if (!k) {
                valid = false;
                data.key_field = true;
            }
            if (!t) {
                valid = false;
                data.token = true;
            }
        }

        return valid ? null : data;
    };
}
