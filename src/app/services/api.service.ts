import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GlobalsService } from './globals.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private httpClient: HttpClient, private globals: GlobalsService) { }

    /*
      Manage the errors
     */
    handleError(error: HttpErrorResponse) {
        let errorMessage;
        if (error['error']['message']) {
            errorMessage = error.error.message;
        } else {
            errorMessage = `Code: ${error.status}. Error: ${error.message}`;
        }
        return throwError({code: error.status, message: errorMessage});
    }

    /*
        NODES ENDPOINTS
     */
    public getNodeInformation() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/').pipe(catchError(this.handleError));
        //  const options = { params: new HttpParams({fromString: "_page=1&_limit=20"}) };
        //     return this.httpClient.get(this.REST_API_SERVER, options).pipe(retry(3), catchError(this.handleError));
    }

    public getNodeStatus() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/status').pipe(catchError(this.handleError));
    }

    /*
        SERVICE ENDPOINTS
     */
    public getServices() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/services?size=1000').pipe(catchError(this.handleError));
    }

    public getService(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/services/' + id).pipe(catchError(this.handleError));
    }

    public postNewService(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/services', body).pipe(catchError(this.handleError));
    }

    public patchService(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/services/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteService(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/services/' + id).pipe(catchError(this.handleError));
    }

    /*
        ROUTE ENDPOINTS
     */
    public getRoutes() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/routes?size=1000').pipe(catchError(this.handleError));
    }

    public getRoute(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/routes/' + id).pipe(catchError(this.handleError));
    }

    public postNewRoute(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/routes', body).pipe(catchError(this.handleError));
    }

    public patchRoute(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/routes/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteRoute(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/routes/' + id).pipe(catchError(this.handleError));
    }

    /*
        UPSTREAMS ENDPOINTS
     */
    public getUpstreams() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/upstreams?size=1000').pipe(catchError(this.handleError));
    }

    public getUpstream(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/upstreams/' + id).pipe(catchError(this.handleError));
    }

    public getUpstreamHealth(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/upstreams/' + id + '/health').pipe(catchError(this.handleError));
    }

    public postNewUpstream(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/upstreams', body).pipe(catchError(this.handleError));
    }

    public patchUpstream(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/upstreams/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteUpstream(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/upstreams/' + id).pipe(catchError(this.handleError));
    }

    /*
        CONSUMERS ENDPOINTS
     */
    public getConsumers() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/consumer?size=1000').pipe(catchError(this.handleError));
    }

    public getConsumer(id: string) {
        return this.httpClient.get(this.globals.NODE_API_URL + '/consumer/' + id).pipe(catchError(this.handleError));
    }

    public postNewConsumer(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/consumer', body).pipe(catchError(this.handleError));
    }

    public patchConsumer(id: string, body) {
        return this.httpClient.patch(this.globals.NODE_API_URL + '/consumer/' + id, body).pipe(catchError(this.handleError));
    }

    public deleteConsumer(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/consumer/' + id).pipe(catchError(this.handleError));
    }

    /*
        TARGET ENDPOINTS
     */
    public postNewTarget(body, upstreamId) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/upstreams/' + upstreamId + '/targets', body).pipe(catchError(this.handleError));
    }

    /*
       CERTIFICATE ENDPOINTS
    */
    public getCertificates() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/certificates?size=1000').pipe(catchError(this.handleError));
    }

    public postNewCertificate(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/certificates', body).pipe(catchError(this.handleError));
    }

    /*
       CA CERTIFICATE ENDPOINTS
    */
    public getCACertificates() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/ca_certificates?size=1000').pipe(catchError(this.handleError));
    }

}
