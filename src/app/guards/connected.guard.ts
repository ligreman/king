import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalsService } from '../services/globals.service';

@Injectable({
    providedIn: 'root'
})
export class ConnectedGuard implements CanActivate {
    constructor(private globals: GlobalsService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.globals.NODE_API_URL !== '';
    }

}
