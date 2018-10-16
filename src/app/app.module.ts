import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MdePopoverModule } from '@material-extended/mde'
// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { ServersComponent } from './servers/servers.component';
import { ServerDetailComponent } from './servers/server-detail/server-detail.component';
import { LoginComponent, NoAuthorizationComponent } from './login/login.component';
import { HelpComponent, HelpDialog } from './help/help.component';
import { AdminComponent } from './admin/admin.component';
import { UserAdminComponent } from "./admin/user-admin/user-admin.component";
import { UserLocationAdminComponent } from "./admin/user-admin/user-location-admin.component";
import { SidAdminComponent } from "./admin/sid-admin/sid-admin.component"
import { SidMappingAdminComponent } from "./admin/sid-admin/sid-mapping-admin.component";
import { ConfigAdminComponent } from "./admin/config-admin/config-admin.component"
import { ConfirmationDialog } from "./util/confirmation-dialog";
import { HttpClientInterceptor } from "./http-client.interceptor";

@NgModule({
  declarations: [
    AppComponent,
    HelpDialog,
    NoAuthorizationComponent,
    ServersComponent,
    ServerDetailComponent,
    LoginComponent,
    HelpComponent,
    AdminComponent,
    UserAdminComponent,
    UserLocationAdminComponent,
    SidAdminComponent,
    SidMappingAdminComponent,
    ConfigAdminComponent,
    ConfirmationDialog
  ],
  imports: [
    Ng2SmartTableModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatExpansionModule,
    MatButtonModule,
    MatTabsModule,
    MatTableModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCardModule,
    MatGridListModule,
    MatTooltipModule,
    MatDialogModule,
    HttpClientModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatDividerModule,
    MatInputModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

    // HttpClientInMemoryWebApiModule.forRoot(
    //   InMemoryServerService, { dataEncapsulation: false }
    // ),
    NgxChartsModule,
    MdePopoverModule
  ],
  entryComponents: [
    ServerDetailComponent,
    HelpDialog,
    UserAdminComponent,
    UserLocationAdminComponent,
    SidAdminComponent,
    SidMappingAdminComponent,
    ConfigAdminComponent,
    ConfirmationDialog
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: HttpClientInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }

