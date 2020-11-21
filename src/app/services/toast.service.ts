import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    constructor(private translate: TranslateService, private toastr: ToastrService) { }

    public success(msg: string, title: string = '', options: any = {}) {
        const {timeOut = 5000, extendedTimeOut = 1000, disableTimeOut = false, msgExtra = '', titleExtra = ''} = options;

        msg = this.translate.instant(msg, {extra: msgExtra});
        if (title != '') title = this.translate.instant(title, {extra: titleExtra});
        this.toastr.success(msg, title, {timeOut: timeOut, extendedTimeOut: extendedTimeOut, disableTimeOut: disableTimeOut});
    };

    public error(msg: string, title: string = '', options: any = {}) {
        const {timeOut = 5000, extendedTimeOut = 1000, disableTimeOut = false, msgExtra = '', titleExtra = ''} = options;

        msg = this.translate.instant(msg, {extra: msgExtra});
        if (title != '') title = this.translate.instant(title, {extra: titleExtra});
        this.toastr.error(msg, title, {timeOut: timeOut, extendedTimeOut: extendedTimeOut, disableTimeOut: disableTimeOut});
    };

    public warning(msg: string, title: string = '', options: any = {}) {
        const {timeOut = 5000, extendedTimeOut = 1000, disableTimeOut = false, msgExtra = '', titleExtra = ''} = options;

        msg = this.translate.instant(msg, {extra: msgExtra});
        if (title != '') title = this.translate.instant(title, {extra: titleExtra});
        this.toastr.warning(msg, title, {timeOut: timeOut, extendedTimeOut: extendedTimeOut, disableTimeOut: disableTimeOut});
    };

    public info(msg: string, title: string = '', options: any = {}) {
        const {timeOut = 5000, extendedTimeOut = 1000, disableTimeOut = false, msgExtra = '', titleExtra = ''} = options;

        msg = this.translate.instant(msg, {extra: msgExtra});
        if (title != '') title = this.translate.instant(title, {extra: titleExtra});
        this.toastr.info(msg, title, {timeOut: timeOut, extendedTimeOut: extendedTimeOut, disableTimeOut: disableTimeOut});
    };
}
