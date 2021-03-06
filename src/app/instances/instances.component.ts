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
          // sid.sid = sid.instanceNum != null ? `${sid.sid} (${sid.instanceNum})` : `${sid.sid} (N/A)`
          // sid.os = sid.os
          //   .replace("SUSE Linux Enterprise Server", "SLES")
          //   .replace("Red Hat Enterprise Linux", "RHEL");

          //remove domain name from full names (it's too long)
          if (sid.host.indexOf(".") >= 0) {
            let i = sid.host.indexOf("."), host = sid.host.slice(0, i);
            while (i < sid.host.length) {
              //domain name starts, skip all other domain names until reaches the end (the space)
              if (sid.host[i] == ".") { while (sid.host[i] != " " && sid.host[i] != "(") { i++; } }
              //update host
              host += sid.host[i++];
            }
            sid.host = host;
          }
          sid.checkTime = sid.checkTime.slice(0, 13);
          sid.edition = sid.edition.replace("SAP HANA ", "");
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
        //TODO: localization
        // serverName: { title: "Server", editable: false, width: "125px" },
        // sid: { title: "SID", editable: false, width: "75px" },
        // instanceNum: { title: "Inst. Num", editable: false, width: "100px" },
        // revision: { title: "Revision", editable: false,  width: "165px" },
        // edition: { title: "Edition", editable: false, width: "85px" },
        // employeeName: { title: "Name", editable: false, width: "165px" },
        // memUsageGB: { title: "MEM (GB)", editable: false, width: "100px" },
        // memUsageRank: { title: "MEM Rank", editable: false, width: "105px" },
        // diskUsageGB: { title: "Disk (GB)", editable: false, width: "100px" },
        // diskUsageRank: { title: "Disk Rank", editable: false, width: "105px" },
        // cpuUsagePCT: { title: "CPU (%)", editable: false, width: "100px" },
        // host: {title:"Host", editable: false},
        // // cpuUsageRank: { title: "CPU Usage Rank", editable: false },
        // // os: { title: "OS", editable: false },
        // checkTime: { title: "Update Time", editable: false, width: "160px" }

        serverName: { title: "Server", editable: false },
        sid: { title: "SID", editable: false },
        instanceNum: { title: "Inst. Num", editable: false },
        revision: { title: "Revision", editable: false },
        host: { title:"Host", editable: false, width: "250px" },
        edition: { title: "Edition", editable: false },
        employeeName: { title: "Name", editable: false, width: "168px" },
        memUsageGB: { title: "MEM (GB)", editable: false },
        memUsageRank: { title: "MEM Rank", editable: false },
        diskUsageGB: { title: "Disk (GB)", editable: false },
        diskUsageRank: { title: "Disk Rank", editable: false },
        cpuUsagePCT: { title: "CPU (%)", editable: false },
        // cpuUsageRank: { title: "CPU Usage Rank", editable: false },
        // os: { title: "OS", editable: false },
        checkTime: { title: "Update", editable: false, width: "130px" }
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
