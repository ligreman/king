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
        return this.httpClient.get(this.globals.NODE_API_URL + '/services').pipe(catchError(this.handleError));
    }

    public postNewService(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/services', body).pipe(catchError(this.handleError));
    }

    public deleteService(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/services/' + id).pipe(catchError(this.handleError));
    }

    /*
        ROUTE ENDPOINTS
     */
    public getRoutes() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/routes').pipe(catchError(this.handleError));
    }

    public postNewRoute(body) {
        return this.httpClient.post(this.globals.NODE_API_URL + '/routes', body).pipe(catchError(this.handleError));
    }

    public deleteRoute(id: string) {
        return this.httpClient.delete(this.globals.NODE_API_URL + '/routes/' + id).pipe(catchError(this.handleError));
    }
}
