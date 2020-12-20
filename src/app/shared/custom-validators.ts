import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as Joi from 'joi';
import { invert as _invert } from 'lodash';

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

    // Comprueba si es uno de los valores permitidos
    static isOneOf(validValues): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                Joi.assert(control.value, Joi.string().valid(...validValues));
            } catch (e) {
                valid = false;
            }
            return valid ? null : {isOneOf: {value: control.value}};
        };
    }

    // Comprueba si la lsita de protocolos es válida para una ruta
    static isProtocolListValidForRoute(validProtocols): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            let valid = true;

            try {
                // Son todo protocolos permitidos
                Joi.assert(control.value, Joi.array().items(Joi.string().valid(...validProtocols)));

                // Convierto a objeto para validar exclusiones
                let obj = Object.assign({}, control.value);
                obj = _invert(obj);
                
                // Valido las exclusiones
                Joi.assert(obj,
                    Joi.object()
                        .without('http', ['tcp', 'tls', 'udp', 'grpc', 'grpcs'])
                        .without('https', ['tcp', 'tls', 'udp', 'grpc', 'grpcs'])
                        .without('tcp', ['http', 'https', 'grpc', 'grpcs'])
                        .without('tls', ['http', 'https', 'grpc', 'grpcs'])
                        .without('udp', ['http', 'https', 'grpc', 'grpcs'])
                        .without('grpc', ['tcp', 'tls', 'udp', 'http', 'https'])
                        .without('grpcs', ['tcp', 'tls', 'udp', 'http', 'https'])
                );
            } catch (e) {
                valid = false;
            }
            return valid ? null : {isProtocolListValidForRoute: {value: control.value}};
        };
    }

}
