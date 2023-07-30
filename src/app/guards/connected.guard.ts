import {Injectable} from '@angular/core';
import {UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {GlobalsService} from '../services/globals.service';

@Injectable({
    providedIn: 'root'
})
export class ConnectedGuard {
    constructor(private globals: GlobalsService) {}

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.globals.NODE_API_URL !== '';
    }

}
