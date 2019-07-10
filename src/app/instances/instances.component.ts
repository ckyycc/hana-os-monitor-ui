import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Util} from "../util/util";
import {TranslateService} from "@ngx-translate/core";
import {LocalDataSource} from "ng2-smart-table";
import {STATUS} from "../util/consts-classes";
import {MatSnackBar} from "@angular/material";
import {InstanceService} from "./instance.service";

@Component({
  selector: 'app-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css']
})
export class InstancesComponent implements OnInit, OnDestroy{
  @ViewChild('instancesTable', { read: ElementRef }) instancesTableRef: ElementRef;


  public tableSource: LocalDataSource;
  protected subscribeList = [];

  tableSettings;

  constructor(private _translate: TranslateService,
              private _snackBar: MatSnackBar,
              private _instanceService: InstanceService) {}

  ngOnInit() { this.loadData();}

  loadData(): void {
    this.subscribeList.push(this._instanceService.getInstances().subscribe(
      sids => {
        sids.forEach(sid => {
          sid.memUsageGB = sid.memUsageGB ? Number(sid.memUsageGB) : null;
          sid.diskUsageGB = sid.diskUsageGB ? Number(sid.diskUsageGB) : null;
          sid.cpuUsagePCT = sid.cpuUsagePCT ? Number(sid.cpuUsagePCT) : null;
          // sid.os = sid.os
          //   .replace("SUSE Linux Enterprise Server", "SLES")
          //   .replace("Red Hat Enterprise Linux", "RHEL");
          sid.checkTime = sid.checkTime.slice(0, 19);
        });
        this.loadDataAndSettings(sids);
        this.onResize();
      },
      error => this.setMessage(STATUS.WARN, "Some thing wrong, please check with your administrator.", "", error)
    ));
  }

  ngOnDestroy() {
    this.subscribeList.forEach(subscribeItem => subscribeItem.unsubscribe());
  }

  /**
   * recalculating chart height when resizing
   */
  onResize() {
    const instancesTableRef = this.instancesTableRef ? this.instancesTableRef.nativeElement : null;
    if (instancesTableRef)
      instancesTableRef.style.height = `${window.innerHeight - 135}px`;
  }

  protected loadDataAndSettings(data) {
    this.tableSettings = {
      actions: false, // hide action column
      pager: {
        display: true,
        perPage: 1000
      },
      columns: {
        serverName: { title: this.getTranslatedText("ADMIN.TABLE_SERVER_NAME"), editable: false },
        sid: { title: this.getTranslatedText("ADMIN.TABLE_SID"), editable: false },
        employeeName: { title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_NAME"), editable: false },
        revision: { title: "Revision", editable: false },
        releaseSP: { title: "Release", editable: false },
        memUsageGB: { title: "MEM Usage(GB)", editable: false },
        memUsageRank: { title: "MEM Rank", editable: false },
        diskUsageGB: { title: "Disk Usage(GB)", editable: false },
        diskUsageRank: { title: "Disk Rank", editable: false },
        cpuUsagePCT: { title: "CPU Usage(%)", editable: false },
        // cpuUsageRank: { title: "CPU Usage Rank", editable: false },
        // os: { title: "OS", editable: false },
        checkTime: { title: "Check Time", editable: false }
      }
    };
    this.tableSource = new LocalDataSource(data);
  }

  protected getTranslatedText(key, parameters=null) {
    return Util.getTranslatedText(this._translate, key, parameters);
  }

  protected setMessage(type=STATUS.PRIMARY, messageKey=null, messageParameter=null, error=null): void {
    if (messageKey) {
      //let action = '';
      let snackClass = 'info-snackbar';
      switch (type) {
        case STATUS.ACCENT:
          //action = 'WARNING';
          snackClass = 'warning-snackbar';
          break;
        case STATUS.WARN:
          //action = 'ERROR';
          snackClass = 'error-snackbar';
      }

      this._translate.get(messageKey, Util.getMsgParameters(messageParameter)).subscribe((message: string) => {
        this._snackBar.open(message, '', {duration: 25000, panelClass: [snackClass]});
      });
    } else {
      this._snackBar.dismiss();
    }
    if (type == STATUS.WARN && error) {
      console.error(error);
    }
  }
}