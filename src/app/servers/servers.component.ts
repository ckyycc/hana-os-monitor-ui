import {Component, OnDestroy, OnInit} from '@angular/core';

import { Server, Location, STATUS, RESOURCE_MEM, RESOURCE_DISK, RESOURCE_CPU } from '../util/consts-classes';
import { ServerService } from "./server.service";

import { timer } from "rxjs"
import { MatDialog } from "@angular/material/dialog";
import { ServerDetailComponent } from "./server-detail/server-detail.component";
import { MatSnackBar } from '@angular/material';
import { Util } from "../util/util"
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-servers',
  templateUrl: './servers.component.html',
  styleUrls: ['./servers.component.css']
})
export class ServersComponent implements OnInit, OnDestroy  {

  servers: Server[];
  locations: Location[];
  resourceTypeText = {};
  //color ='primary'//'accent'//'warn'//'primary';
  mode = 'determinate'; //'determinate'//'buffer';
  // value = 85;
  bufferValue = 90;
  columnNum: number;

  SERVER_STATUS = STATUS;
  STATUS_PRIMARY = "primary";
  STATUS_ACCENT = "accent";
  STATUS_WARN = "warn";

  selectedLocationId: number;
  warningMessages = "";
  filterValue = "";
  refreshSubscription;

  constructor(protected translate: TranslateService,
              private serverService: ServerService,
              private snackBar: MatSnackBar,
              public serverDetailDialog: MatDialog ) {
    // Util.configTranslate(translate);
    this.resourceTypeText[RESOURCE_MEM] = 'SERVER.RESOURCE_MEM';
    this.resourceTypeText[RESOURCE_DISK] = 'SERVER.RESOURCE_DISK';
    this.resourceTypeText[RESOURCE_CPU] = 'SERVER.RESOURCE_CPU';
  }

  ngOnInit() {
    this.refreshData();
    this.getColumnNum(window.innerWidth);
  }
  ngOnDestroy() {
    if (this.refreshSubscription != null) {
      this.refreshSubscription.unsubscribe();
    }
  }
  getColor(status): string {
    // let thresholdValues = THRESHOLD[type].split("-");
    if (status === this.SERVER_STATUS.PRIMARY) {
      return this.STATUS_PRIMARY;
    } else if (status === this.SERVER_STATUS.ACCENT) {
      return this.STATUS_ACCENT;
    } else {
      return this.STATUS_WARN;
    }
  }

  getResourceValue(resource): string {
    if (resource.status >= this.SERVER_STATUS.WARN ) {
      let resourceValue =  isNaN(resource.value)? -1 : resource.value;
      return ` (${resourceValue} %)`;
    } else {
      return '';
    }
  }



  // getResourceTypeText(resource): string {
  //   let resourceTypeText = null;
  //    switch (resource.type)  {
  //      case RESOURCE_MEM:
  //        resourceTypeText = 'SERVER.RESOURCE_MEM';
  //        break;
  //      case RESOURCE_DISK:
  //        resourceTypeText = 'SERVER.RESOURCE_DISK';
  //        break;
  //      case RESOURCE_CPU:
  //        resourceTypeText = 'SERVER.RESOURCE_CPU';
  //    }
  //    return resourceTypeText;
  // }

  getTooltip(server): string {
    return  `${server.resources[0].type}:${isNaN(server.resources[0].value)? -1: server.resources[0].value}% 
             ${server.resources[1].type}:${isNaN(server.resources[1].value)? -1: server.resources[1].value}% 
             ${server.resources[2].type}:${isNaN(server.resources[2].value)? -1: server.resources[2].value}%`;
  }

  getColumnNum(width): void {

    let num = Math.floor(width / 220);
    this.columnNum = num > 0? num: 1;
  }
  onResize(event): void {
    this.getColumnNum(event.target.innerWidth);
  }

  // updateServers(): void {
  //   this.getServers();
  // }
  refreshData(): void {
    if (this.refreshSubscription != null) {
      this.refreshSubscription.unsubscribe();
    }
    this.refreshSubscription = timer(0,300000).subscribe(() => this.getServers());
  }

  checkDetail(serverId, serverName, resourceType = RESOURCE_MEM) {
    // this.router.navigate(['/server', { id: serverId, resource: resourceType}]);//`/server/${serverId}`]); //, { id: serverId, resource: resourceType}]);
    this.serverDetailDialog.open(ServerDetailComponent, {
      data: {serverId: serverId, serverName: serverName, resource: resourceType},
      width: '60%',
      height: '530px',
    });
  }


  getDisplayServers(filterValue): Server[] {
    if (filterValue) {
      return this.servers.filter(server => server.name.includes(filterValue));
    } else {
      return this.servers;
    }
  }


  private getServers(): void {
    if (this.selectedLocationId == null) {
      this.serverService.getServers()
        .then(servers => {
          let currentUser = Util.getCurrentUser();
          if (currentUser != null) {
            this.servers = servers;
            this.getLocations();
            this.showMessages();
          }})
        .catch(error => this.showMessages(`Getting servers failed. ${error}`, 'ERROR'));
    } else {
      this.serverService.getServers()
        .then(servers => {
          this.servers = servers.filter(server => server.location.locationId == this.selectedLocationId);
          this.getLocations();
          this.showMessages();
        })
        .catch(error => this.showMessages(`Getting servers failed. ${error}`, 'ERROR'));
    }
  }

  private  showMessages(message='', action=''): void {
    if (message) {
      this.snackBar.open(message, action, {
        duration: 500000,
        panelClass: ['warning-snackbar']
      });
    } else {
      if (this.checkTimestamp()) {
        this.snackBar.open(this.warningMessages, 'WARNING', {
          duration: 500000,
          panelClass: ['warning-snackbar']
        });
      } else {
        this.snackBar.dismiss();
      }
    }
  }

  private checkTimestamp(): boolean {
    if (this.servers != null) {
      for (let i = 0; i < this.servers.length; i++) {
        for (let j = 0; j < this.servers[i].resources.length; j++) {
          let time_check = Date.now() - Date.parse(this.servers[i].resources[j].checkTime);
          if (time_check > 7200000) {
            //longer than 2 hours, need to show the warning.
            this.warningMessages = Util.getTranslatedText(this.translate, 'SERVER.CHECK_TIME_WARNING',
              [`${this.servers[i].name} (${this.servers[i].resources[j].type})`, `${(time_check/1000/3600).toFixed(2)}`]);
            return true;
          }
        }
      }
    }
    return false;
  }


  private getLocations(): void {
    if (this.locations == null) {
      this.locations = this.servers.filter((server, index, self) =>
        self.findIndex(t => t.location.locationId == server.location.locationId) === index
      ).map(server => server.location);

      // this.locations = [];
      // for (let i = 0; i < this.servers.length; i++) {
      //   if (this.locations.findIndex((location) => location.locationId === this.servers[i].location.locationId) < 0 &&
      //     this.getCurrentUser().locIDs.includes(this.servers[i].location.locationId)) {
      //     //only display the locations in users location list
      //     this.locations.push(this.servers[i].location)
      //   }
      // }
      if (this.locations.length == 1) {
        this.selectedLocationId = this.locations[0].locationId;
      }
    }
  }
}
