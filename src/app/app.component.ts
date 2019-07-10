import {Component, OnDestroy, OnInit} from '@angular/core';
import {URL_SERVERS, URL_ADMIN, URL_HELP, Employee, SUPPORT_LANGUAGE, URL_INFO} from "./util/consts-classes";
import { Util } from "./util/util";
import { NavigationEnd, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import {delay} from "rxjs/operators";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy{
  title = 'ROOT.TITLE';
  links = [{name:"/"+URL_SERVERS, display:'ROOT.TAB_HOME'},
           {name:"/"+URL_INFO, display:'ROOT.TAB_INFO'},
           {name:"/"+URL_ADMIN, display:'ROOT.TAB_ADMIN'},
           {name:"/"+URL_HELP, display:'ROOT.TAB_HELP'}];
  activeLink: string;//this.links[0].name;
  user: Employee;
  selectedLanguage: string = null;
  constructor(private  router: Router, public translate: TranslateService) {
    Util.configTranslate(translate);
    this.selectedLanguage = Util.getCurrentLanguage(translate);
  }

  subscribeRouterEvents;

  ngOnInit() {
    this.subscribeRouterEvents = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        if (event.url == "/") {
          this.activeLink = this.links[0].name;
        } else {
          this.activeLink = event.url;
        }
      }
    });
    Util.hideArrowFromSelect("language-selector");
  }

  ngOnDestroy() {
    if (this.subscribeRouterEvents != null) {
      this.subscribeRouterEvents.unsubscribe();
    }
  }

  getUser() : Employee {
    if (!this.user || this.user.employeeId) {
      this.user = Util.getCurrentUser();
    }
    return this.user;
  }
  getUserName() {
    // this.user = Util.getCurrentUser();
    if (this.user != null && this.user.employeeId != null) {
      return `${this.user.employeeName} ( ${this.user.employeeId} )`;
    }
  }

  getLangText(language) {
    return SUPPORT_LANGUAGE.find(lang => lang.value.includes(language)).name;
  }
  changeLanguage(event, language) {
    if (language) {
      this.selectedLanguage = language;
    }

    Util.configTranslate(this.translate, this.selectedLanguage);

    //change the background color, to simulator the click:
    let item = document.getElementById(event.target.id);
    if (item) {
      let itemBackground = item.style.background;
      item.style.background = 'lightgrey';
      setTimeout(()=> item.style.background = itemBackground, 100);
    }
  }

}


