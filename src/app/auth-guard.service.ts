import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { URL_ADMIN, URL_SERVERS } from "./util/consts-classes";
import { Util } from "./util/util";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{

  constructor(private router: Router) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (Util.getCurrentUser() == null) {
      //not login, redirect to logon page
      this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
      return false;
    } else {
      let user = Util.getCurrentUser();
      if ((state.url == `/${URL_SERVERS}` && Util.checkAuth(user)) ||
          (state.url == `/${URL_ADMIN}` && Util.checkAuthAdmin(user))
      ) {
        return true;
      } else {
        this.router.navigate(['/no-auth']);
        return false;
      }
    }
  }
}
