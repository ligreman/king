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
        if (error.error instanceof ErrorEvent) {
            // Client-side errors
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side errors
            errorMessage = `Code: ${error.status}. Error: ${error.message}`;
        }
        return throwError(errorMessage);
    }

    /*
        NODES ENDPOINTS
     */
    public getNodeInformation() {
        return this.httpClient.get(this.globals.NODE_API_URL + '/').pipe(catchError(this.handleError));
        //  const options = { params: new HttpParams({fromString: "_page=1&_limit=20"}) };
        //     return this.httpClient.get(this.REST_API_SERVER, options).pipe(retry(3), catchError(this.handleError));
    }
}
