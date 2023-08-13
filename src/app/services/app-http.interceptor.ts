import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpRequest} from "@angular/common/http";
import {Observable} from 'rxjs';
import {GlobalsService} from "./globals.service";

@Injectable()
export class AppHttpInterceptor implements AppHttpInterceptor {

    constructor(private globals: GlobalsService) {
    }

    /**
     * Adds Authorization header if needed, to all requests.
     */
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (this.globals.AUTH_HEADER && (this.globals.AUTH_HEADER.startsWith('Basic') || this.globals.AUTH_HEADER.startsWith('Bearer'))) {
            request = request.clone({
                headers: request.headers.set('Authorization', this.globals.AUTH_HEADER)
            });
        }

        return next.handle(request);
    }
}
//eyJrb25nX2FkbWluX3VybCI6Imh0dHA6Ly8xOTIuMTY4LjIuMTkzOjgwMDEiLCJrb25nX2FkbWluX2F1dGhvcml6YXRpb24iOiJCYXNpYyBkWE5sY201aGJXVTZjR0Z6YzNkdmNtUT0ifQ==
