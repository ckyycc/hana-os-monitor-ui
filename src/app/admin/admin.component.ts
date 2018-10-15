import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { UserAdminComponent } from "./user-admin/user-admin.component";
import { UserLocationAdminComponent } from "./user-admin/user-location-admin.component";
import { SidAdminComponent } from "./sid-admin/sid-admin.component";
import { SidMappingAdminComponent } from "./sid-admin/sid-mapping-admin.component";
import { ConfigAdminComponent } from "./config-admin/config-admin.component";
import { TranslateService } from "@ngx-translate/core";
import { Util } from "../util/util";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  dialogConfig = { width: '80%' };
  adminItems = [];
  constructor(public translate: TranslateService, public dialog: MatDialog) {
    // Util.configTranslate(translate);
  }

  ngOnInit() {
    this.getAdminItems();
  }

  onClick(type) {
    switch(type) {
      case 'user-location-admin':
        this.dialog.open(UserLocationAdminComponent, this.dialogConfig);
        break;
      case 'user-admin':
        this.dialog.open(UserAdminComponent, this.dialogConfig);
        break;
      case 'sid-admin':
        this.dialog.open(SidAdminComponent, this.dialogConfig);
        break;
      case 'sid-mapping-admin':
        this.dialog.open(SidMappingAdminComponent, this.dialogConfig);
        break;
      case 'config-admin':
        this.dialog.open(ConfigAdminComponent, this.dialogConfig);
        break;
    }
  }


  getAdminItems() {
    let userLocationAdminItem = {
      type: 'user-location-admin',
      headerClass: 'admin-card-header-image-user-location',
      title: 'ADMIN.TITLE_USER_LOCATION',
      subTitle: 'ADMIN.TITLE_USER_ADMIN',
      image: '../../assets/user-location-admin.png',
      explain: 'ADMIN.USER_LOCATION_EXPLAIN'
    };
    this.adminItems.push(userLocationAdminItem);

    let userAdminItem = {
      type: 'user-admin',
      headerClass: 'admin-card-header-image-user',
      title: 'ADMIN.TITLE_USER_INFO',
      subTitle: 'ADMIN.TITLE_USER_ADMIN',
      image: '../../assets/user-admin.png',
      explain: 'ADMIN.USER_INFO_EXPLAIN'
    };
    this.adminItems.push(userAdminItem);

    let sidAdminItem = {
      type: 'sid-admin',
      headerClass: 'admin-card-header-image-sid',
      title: 'ADMIN.TITLE_SID_INFO',
      subTitle: 'ADMIN.TITLE_SID_ADMIN',
      image: '../../assets/sid-admin.png',
      explain: 'ADMIN.SID_INFO_EXPLAIN'
    };
    this.adminItems.push(sidAdminItem);

    let sidMappingAdminItem = {
      type: 'sid-mapping-admin',
      headerClass: 'admin-card-header-image-sid-mapping',
      title: 'ADMIN.TITLE_SID_MAPPING',
      subTitle: 'ADMIN.TITLE_SID_ADMIN',
      image: '../../assets/sid-mapping-admin.png',
      explain: 'ADMIN.SID_MAPPING_EXPLAIN'
    };
    this.adminItems.push(sidMappingAdminItem);

    let configurationAdminItem = {
      type: 'config-admin',
      headerClass: 'admin-card-header-image-config',
      title: 'ADMIN.TITLE_CONFIG',
      subTitle: 'ADMIN.TITLE_CONFIG_ADMIN',
      image: '../../assets/config-admin.png',
      explain: 'ADMIN.CONFIG_EXPLAIN'
    };
    this.adminItems.push(configurationAdminItem);

  }
}


