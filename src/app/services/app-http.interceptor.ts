import {Injectable} from '@angular/core';
import { HttpEvent, HttpHandler, HttpRequest } from "@angular/common/http";
import {Observable} from 'rxjs';
import {GlobalsService} from "./globals.service";
import {isEmpty as _isEmpty} from 'lodash';

@Injectable()
export class AppHttpInterceptor implements AppHttpInterceptor {

    constructor(private globals: GlobalsService) {
    }

    /**
     * Adds Authorization header if needed, to all requests.
     */
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if ((this.globals.AUTH_METHOD && !_isEmpty(this.globals.AUTH_METHOD)) && !_isEmpty(this.globals.AUTH_FIELD) && !_isEmpty(this.globals.AUTH_TOKEN)) {
            let opts = {};

            switch (this.globals.AUTH_METHOD) {
                case 'header':
                    opts['headers'] = request.headers.set(this.globals.AUTH_FIELD, this.globals.AUTH_TOKEN);
                    break;
                case 'query':
                    opts['params'] = request.params.set(this.globals.AUTH_FIELD, this.globals.AUTH_TOKEN);
                    break;
                case 'body':
                    let a = {};
                    a[this.globals.AUTH_FIELD] = this.globals.AUTH_TOKEN;
                    opts['body'] = a;
                    break;
            }

            request = request.clone(opts);
        }

        return next.handle(request);
    }
}

//eyJrb25nX2FkbWluX3VybCI6Imh0dHA6Ly8xOTIuMTY4LjIuMTkzOjgwMDEiLCJrb25nX2FkbWluX2F1dGhvcml6YXRpb24iOiJCYXNpYyBkWE5sY201aGJXVTZjR0Z6YzNkdmNtUT0ifQ==
