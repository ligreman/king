import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {

    // Comprueba si es un número
    static isNumber(allowEmpty?: boolean): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const regexp = /^[0-9]+$/;

            // Verifico que es un número
            let number = regexp.test(control.value);
            console.log('test ' + number);
            // A ver si permito nulls o vacíos
            if (allowEmpty && (control.value === '')) {
                number = true;
            }

            return number ? null : {isNumber: {value: control.value}};
        };
    }
}
