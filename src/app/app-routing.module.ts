import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { ServersComponent } from "./servers/servers.component";
import { AuthGuard } from "./auth-guard.service";
import { LoginComponent, NoAuthorizationComponent } from "./login/login.component";
import { HelpComponent } from "./help/help.component";
import { AdminComponent } from "./admin/admin.component";
import { URL_SERVERS, URL_ADMIN, URL_NO_AUTH, URL_LOGIN, URL_HELP } from "./util/consts-classes"

const routes: Routes = [
  { path: '', redirectTo: `/${URL_SERVERS}`, pathMatch: 'full' },
  { path: URL_SERVERS, canActivate: [AuthGuard], component: ServersComponent },
  { path: URL_ADMIN, canActivate: [AuthGuard], component: AdminComponent },
  { path: URL_NO_AUTH, component: NoAuthorizationComponent },
  { path: URL_LOGIN, component: LoginComponent},
  { path: URL_HELP, component: HelpComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
