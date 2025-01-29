import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root'
})
export class GuardLoginGuard implements CanActivate {

  constructor(
      private _authSrv:AuthService,
      private _router:Router
    ){
  }
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      if(!this._authSrv.isAuthenticated()){
        this._router.navigate(['/login']);
        return false;
      }
    return true;
  }
  
}
