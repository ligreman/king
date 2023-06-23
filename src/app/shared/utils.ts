import * as Joi from "joi";

export class Utils {
    static calculateHash(text: string) {
        let hash = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return hash;
    }


    // Comprueba si es una IP
    static isIp(value: string, allowEmpty?: boolean): boolean {
        let valid = true;

        try {
            if (allowEmpty) {
                Joi.assert(value, Joi.string().ip().allow(''));
            } else {
                Joi.assert(value, Joi.string().ip());
            }
        } catch (e) {
            valid = false;
        }
        return valid;
    }
}
