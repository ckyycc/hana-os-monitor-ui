import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import { AuthenticationService } from "./authentication.service";
import { timer } from "rxjs/index";
import { Employee } from "../util/consts-classes";
import { Util } from "../util/util"
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.css' ],
  providers: [ AuthenticationService ]
})
export class LoginComponent implements OnInit, OnDestroy {

  returnUrl: string;
  message: string;
  progress = '';
  subscription: any;
  subscriptLogon: any;
  constructor(protected translate: TranslateService,
              private route: ActivatedRoute,
              private router: Router,
              private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.login();
    this.subscription = timer(0,2000).subscribe(() => this.updateProgress());
  }

  ngOnDestroy() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
    if (this.subscriptLogon != null) {
      this.subscriptLogon.unsubscribe();
    }
  }

  updateProgress(status='.') {
    this.progress = `${this.progress}${status}`;
  }

  login() {
    this.subscriptLogon = this.authenticationService.logon().subscribe(
      user => {
        if (user != null && Util.checkUserValidity(user)) {
          this.subscription.unsubscribe();
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.message = `Login error: ${JSON.stringify(user)} is not valid, please make sure you chose the correct certification.`;
          this.subscription.unsubscribe();
          this.updateProgress('Error');
          console.error(this.message)
        }},
      error => {
        this.message = `Login failed with ${error} Please make sure you chose the right certificate.`;
        this.subscription.unsubscribe();
        this.updateProgress('Error');
        console.error(error)
      }
    );
  }
}


@Component({
  selector: 'app-no-auth',
  template: `
    <div class="no-authorization">
      <p *ngIf="!isAuth()">Current user: {{getUserName()}} do not have authorization for accessing this page, please contact your administrator.</p>
      <p *ngIf="isAuthAdmin()">Current user: {{getUserName()}} have authorization for monitoring and administration.</p>
      <p *ngIf="!isAuthAdmin() && isAuth()">Current user: {{getUserName()}} have authorization for monitoring only, please access "Home" page.</p>
    </div>
  `,
  styles: ['div.no-authorization {\n' +
            '  margin-top: 150px;\n' +
            '  height: 50px;\n' +
            '  font-size: 18px;\n' +
            '  font-weight: bold;\n' +
            '  text-align: center;\n' +
            '  color: red;\n' +
            '}']
})
export class NoAuthorizationComponent {
  currentUser: Employee;
  constructor() {
    this.currentUser = Util.getCurrentUser();
  }

  isAuth(): boolean {
    return Util.checkAuth(this.currentUser);
  }
  isAuthAdmin(): boolean {
    return Util.checkAuthAdmin(this.currentUser);
  }
  getUserName() {
    if (this.currentUser != null && this.currentUser.employeeId != null) {
      return `${this.currentUser.employeeId} (${this.currentUser.employeeName})`;
    }
  }
}

