import { Component, OnInit, Inject, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Server, RESOURCE_MEM, RESOURCE_DISK, RESOURCE_CPU, Resource, Consumer } from "../../util/consts-classes";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ServerService } from "../server.service";
import { TranslateService } from "@ngx-translate/core";
import { Util } from "../../util/util";

@Component({
  selector: 'app-server-detail',
  templateUrl: './server-detail.component.html',
  styleUrls: ['./server-detail.component.css']
})
export class ServerDetailComponent implements OnInit, OnDestroy {
  @Input() server: Server;

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  legendTitle = '';
  showXAxisLabel = false;
  xAxisLabel = 'Time';
  showYAxisLabel = true;
  yAxisLabel = 'SERVER.HISTORY_Y_AXIS';
  yScaleMax = 100;


  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // line, area
  autoScale = false;

  // @ViewChild(MatSort) sort: MatSort;
  onOKClick(): void {
    this.dialogRef.close();
  }

  tabs_text = ["SERVER.RESOURCE_MEM", "SERVER.RESOURCE_DISK", "SERVER.RESOURCE_CPU"];
  tabs = [RESOURCE_MEM, RESOURCE_DISK, RESOURCE_CPU];
  selectedTab = new FormControl(0);
  consumers = {MEM:[], DISK:[], CPU:[]};
  histories;
  message:string;
  private _subscribeList = [];
  constructor( @Inject(MAT_DIALOG_DATA) public data: any,
               private dialogRef: MatDialogRef<ServerDetailComponent>,
               private serverService: ServerService, protected translate: TranslateService) {
    // Util.configTranslate(translate);
  }
  ngOnInit() {
    if (this.data != null) {
      this.legendTitle = this.data.serverName;
      let index = this.tabs.indexOf(this.data.resource);
      if (index >= 0) {
        this.selectedTab.setValue(index);
      }
    }
    this.getServer();
    this.getHistory();
  }

  ngOnDestroy() {
    this._subscribeList.forEach(subscribeItem => subscribeItem.unsubscribe());
  }

  // let consumer_cpu = {userName: `ck${i}adm`,  sid: `ck${i}`, owner: `i06663${i}`, consuming: Math.floor((Math.random() * 20) + 10)};
  displayedColumns = ['userName', 'sid', 'owner', 'consuming', 'checkTime'];

  getResource(tabId): Resource {
    if (this.server == null) {
      return null;
    }
    let index = this.server.resources.findIndex(resource=>resource.type == this.tabs[tabId]);
    return this.server.resources[index];
  }

  getConsumers(tabId): Consumer[] {
    if (tabId >= 3) {
      return;
    }
    if (this.consumers[this.tabs[tabId]].length > 0) {
      return this.consumers[this.tabs[tabId]];
    }

    if (this.server == null) {
      return;
    } else {
      this.consumers[this.tabs[tabId]] =  this.getResource(tabId).consumers;
      while ( this.consumers[this.tabs[tabId]].length < 5) {
        this.consumers[this.tabs[tabId]].push(new Consumer());
      }
      return this.consumers[this.tabs[tabId]];
    }
  }

  getUnit(tabId): string {
    switch(this.tabs[tabId]) {
      case RESOURCE_MEM:
      case RESOURCE_DISK:
        return "GB";
      case RESOURCE_CPU:
        return "%";
      default:
        return "";
    }
  }

  getHeaderSIDOrFolder(tabId): string {
    switch(this.tabs[tabId]) {
      case RESOURCE_MEM:
      case RESOURCE_CPU:
        return "SERVER.TABLE_SID";
      case RESOURCE_DISK:
        return "SERVER.TABLE_FOLDER";
      default:
        return "";
    }
  }

  getTotalCost(tabId): number {
    let consumers_4cost =  this.getConsumers(tabId);
    if (consumers_4cost != null) {
      return consumers_4cost.map(t => t.consuming || 0).reduce((acc, value) => Number(acc) + Number(value), 0);
    }
  }

  getServerTotal(tabId): number {
    let resource = this.getResource(tabId);
    if (resource != null) {
      return isNaN(resource.total)? 0: resource.total;
    }
  }

  getServer(): void {
    this._subscribeList.push(this.serverService.getServer(this.data.serverId).subscribe(
      server => this.server = server,
      error => this.message = `Loading detail info of server (${this.data.serverId}) failed. ${error}`));
  }

  getHistory(): void {
    if (!this.histories) {
      this._subscribeList.push(this.serverService.getServerHistory(this.data.serverId).subscribe(
        history => {
          let mem_history = history.histories.filter(history => !isNaN(history.memUsage))
            .map(history => ({name: new Date(history.checkTime), value: Number(history.memUsage)}));
          let disk_history = history.histories.filter(history => !isNaN(history.diskUsage))
            .map(history => ({name: new Date(history.checkTime), value: Number(history.diskUsage)}));
          let cpu_history = history.histories.filter(history => !isNaN(history.cpuUsage))
            .map(history => ({name: new Date(history.checkTime), value: Number(history.cpuUsage)}));
          if ((mem_history && mem_history.length > 0) ||
              (disk_history && disk_history.length > 0) ||
              (cpu_history && cpu_history.length > 0)) {
            let mem = {name: Util.getTranslatedText(this.translate, 'SERVER.HISTORY_RESOURCE_MEM'), series: mem_history};
            let disk = {name: Util.getTranslatedText(this.translate, 'SERVER.HISTORY_RESOURCE_DISK'), series: disk_history};
            let cpu = {name: Util.getTranslatedText(this.translate, 'SERVER.HISTORY_RESOURCE_CPU'), series: cpu_history};
            this.histories = [mem, disk, cpu];
          }
        },
        error => this.message = `Loading server history (${this.data.serverId}) failed. ${error}`));
    }
  }
}
