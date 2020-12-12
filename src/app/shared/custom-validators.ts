import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as Joi from 'joi';

export class CustomValidators {

    // Comprueba si es un número
    static isNumber(allowEmpty?: boolean): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                if (allowEmpty) {
                    Joi.assert(control.value, Joi.number().allow(null, ''));
                } else {
                    Joi.assert(control.value, Joi.number());
                }
            } catch (e) {
                valid = false;
            }

            return valid ? null : {isNumber: {value: control.value}};
        };
    }

    // Comprueba si es un boolean
    static isBoolean(allowEmpty?: boolean): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                if (allowEmpty) {
                    Joi.assert(control.value, Joi.boolean().allow(null, ''));
                } else {
                    Joi.assert(control.value, Joi.boolean());
                }
            } catch (e) {
                valid = false;
            }

            return valid ? null : {isBoolean: {value: control.value}};
        };
    }

    // Comprueba si es un GUIID
    static isUIID(multi?: boolean): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                if (multi) {
                    const value = control.value.split('\n');
                    Joi.assert(value, Joi.array().items(Joi.string().guid().allow(null, '')));
                } else {
                    Joi.assert(control.value, Joi.string().guid().allow(null, ''));
                }
            } catch (e) {
                valid = false;
            }
            return valid ? null : {isUIID: {value: control.value}};
        };
    }

    // Comprueba si es un nombre alphanum
    static isAlphaNum(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                Joi.assert(control.value, Joi.string().pattern(/^[a-zA-Z0-9\-._~áéíóúüÁÉÍÓÚÜñÑ]+$/));
            } catch (e) {
                valid = false;
            }
            return valid ? null : {isAlphaNum: {value: control.value}};
        };
    }

    // Comprueba si es un uri
    static isUri(validProtocols): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                Joi.assert(control.value, Joi.string().uri({scheme: validProtocols}));
            } catch (e) {
                valid = false;
            }
            return valid ? null : {isUri: {value: control.value}};
        };
    }

    // Comprueba si es protocol+host+port
    static isHostProtocolPort(validProtocols): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                Joi.assert(control.value, Joi.string().pattern(new RegExp('^(' + validProtocols.join('|') + ')+:\\/\\/(.+):([0-9]{1,5})(\\/)?.*')));
                // No permito espacios en blanco
                Joi.assert(control.value, Joi.string().pattern(/^[\S]*$/));
            } catch (e) {
                valid = false;
            }
            return valid ? null : {isHostProtocolPort: {value: control.value}};
        };
    }

    // Comprueba si es un port
    static isPort(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                Joi.assert(control.value, Joi.number().port());
            } catch (e) {
                valid = false;
            }
            return valid ? null : {isPort: {value: control.value}};
        };
    }

    // Comprueba si es un host
    static isHost(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                Joi.assert(control.value, Joi.string().hostname());
            } catch (e) {
                valid = false;
            }
            return valid ? null : {isHost: {value: control.value}};
        };
    }

    // Comprueba si es protocolo
    static isProtocol(validProtocols): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                Joi.assert(control.value, Joi.string().valid(...validProtocols));
            } catch (e) {
                valid = false;
            }
            return valid ? null : {isProtocol: {value: control.value}};
        };
    }


}
