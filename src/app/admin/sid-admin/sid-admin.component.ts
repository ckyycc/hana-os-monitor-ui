import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { SIDAdminService } from "./sid-admin.service";
import { AdminTemplate4Table } from "../table-template";
import { SIDInfo, STATUS } from "../../util/consts-classes";
import { Util } from "../../util/util";
import {MatSnackBar} from "@angular/material";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-sid-admin',
  templateUrl: '../table-template.html',
  styleUrls: ['../admin.component.css'],
  providers: [SIDAdminService]
})

export class SidAdminComponent extends AdminTemplate4Table {
  /**
   * Contains all the data returns from Database, including those empty fields
   * Use it only for retrieving the complete employees and servers list.
   * @type {SIDInfo[]}
   * @private
   */
  private _data: Array<SIDInfo> = [];

  constructor(private translateService: TranslateService,
              private matSnackBar: MatSnackBar,
              private sidAdminService: SIDAdminService,
              private matDialog: MatDialog,
              private matDialogRef: MatDialogRef<SidAdminComponent>) {
    super(translateService, matSnackBar, matDialogRef, matDialog);
  }

  onRowSelect(event): void { }

  loadData(): void {
    this.beforeCallBackend();
    this.subscribeList.push(this.sidAdminService.getSIDsInfo().subscribe(
      sidInfo => {
        this._data = sidInfo;
        this.loadDataAndSettings(this._data.filter(data => data.employeeId && data.sid && data.serverId));
        this.afterCallBackend();
        },
        error => this.afterCallBackend(STATUS.WARN, 'ADMIN.LOADING_ERROR', null, error)
    ));
  }
  private _checkValidity(allData, newData): any {
    if (newData.sid == null || newData.sid.length != 3 || newData.serverName == null ||
        newData.serverName.length == 0 || newData.employeeId == null || newData.employeeId.length == 0) {
      return false;
    }
    let index = allData.findIndex(sid => Util.upper(sid.sid) == Util.upper(newData.sid) &&
                                  Util.upper(sid.serverName) == Util.upper(newData.serverName));
    if (index < 0) {
      return true;
    } else {
      return index;
    }
  }

  private _getEmployeeNameById(allData, employeeId): string {
    let sidInfo = allData.find(sid => sid.employeeId == employeeId);
    return sidInfo == null? null : sidInfo.employeeName;
  }

  private _getServerIdByName(allData, serverName): number {
    let sidInfo = allData.find(sid => sid.serverName == serverName);
    return sidInfo == null? null : sidInfo.serverId;
  }

  private _setSidInfo(allData, data) {
    data.employeeName = this._getEmployeeNameById(allData, data.employeeId);
    data.serverId = this._getServerIdByName(allData, data.serverName);
  }

  onCreateConfirm(event) {
    let newData = event.newData;
    if (newData.sid != null) {
      newData.sid = newData.sid.toUpperCase();
    }
    event.source.getAll().then(allData => {
      let checkResult = this._checkValidity(allData, newData);
      if (checkResult === true) {
        this._setSidInfo(this._data, newData);
        this.beforeCallBackend();
        this.subscribeList.push(this.sidAdminService.addSIDInfo(newData).subscribe(
          () => {
            event.confirm.resolve(newData);

            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.CREATION_SUCCESS', `(${newData.serverName}:${newData.sid}-${newData.employeeId})`);
          },
          error => {
            this.afterCallBackend(STATUS.WARN, 'ADMIN.CREATION_ERROR', `(${newData.serverName}:${newData.sid}-${newData.employeeId})`, error);
            }
        ));
      } else {
        if (checkResult === false) {
          this.setMessage( STATUS.ACCENT, 'ADMIN.SID_ADMIN.USER_SERVER_SID_EMPTY_WARNING');
          event.confirm.reject();
        } else {
          this.setMessage(STATUS.ACCENT, 'ADMIN.SID_ADMIN.USER_SID_EXIST',
            [`(${allData[checkResult].employeeId}-${allData[checkResult].employeeName})`, `${allData[checkResult].serverName}:${allData[checkResult].sid}`]);
          event.confirm.reject();
        }

      }
    });
  }

  onEditConfirm(event) {
    let newData = event.newData;
    let data = event.data;
    event.source.getAll().then(allData => {
      if (newData.serverName == data.serverName) {
        //did not change the server name
        newData.oldServerId = newData.serverId;
        if (newData.employeeId != data.employeeId) {
          // employeeId changed
          newData.employeeName = this._getEmployeeNameById(this._data, newData.employeeId);
        }
        this.beforeCallBackend();
        this.subscribeList.push(this.sidAdminService.updateSIDInfo(newData).subscribe(
          () => {
            event.confirm.resolve(newData);
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.UPDATE_SUCCESS', `(${newData.serverName}:${newData.sid}-${newData.employeeId})`);
          },
          error => {
            this.afterCallBackend(STATUS.WARN, 'ADMIN.UPDATE_ERROR', `(${newData.serverName}:${newData.sid}-${newData.employeeId})`, error);
          }
        ));
      } else {
        //server name or employee id changed, need to check validity first
        let checkResult = this._checkValidity(allData, newData);
        //get employee name and server id for the changed value
        if (checkResult === true) {
          newData.oldServerId = newData.serverId;
          this._setSidInfo(this._data, newData);
          this.beforeCallBackend();
          this.subscribeList.push(this.sidAdminService.updateSIDInfo(newData).subscribe(
            () => {
              event.confirm.resolve(newData);
              this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.UPDATE_SUCCESS', `(${newData.serverName}:${newData.sid}-${newData.employeeId})`);
            },
            error => {
              this.afterCallBackend(STATUS.WARN, 'ADMIN.UPDATE_ERROR', `(${newData.serverName}:${newData.sid}-${newData.employeeId})`, error);
            }
          ));
        } else {
          if (checkResult === false) {
            this.setMessage(STATUS.ACCENT, 'ADMIN.SID_ADMIN.USER_SERVER_SID_EMPTY_WARNING');
          } else {
            this.setMessage(STATUS.ACCENT, 'ADMIN.SID_ADMIN.USER_SID_EXIST',
              [`(${allData[checkResult].employeeId}-${allData[checkResult].employeeName})`, `${allData[checkResult].serverName}:${allData[checkResult].sid}`]);
            event.confirm.reject();
          }
        }
      }
    });
  }

  onDeleteConfirm(event) {
    let data = event.data;
    let dialogConfirmRef = this.confirm('ADMIN.DELETE_CONFIRM', `(${data.serverName}:${data.sid})~(${data.employeeId}:${data.employeeName})`);
    this.subscribeList.push(dialogConfirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.beforeCallBackend();
        this.subscribeList.push(this.sidAdminService.deleteSIDInfo(data).subscribe(
          () => {
            event.confirm.resolve();
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.DELETE_SUCCESS', `(${data.serverName}:${data.sid}-${data.employeeId})`);
          },
          error => this.afterCallBackend(STATUS.WARN, 'ADMIN.DELETE_ERROR', `(${data.serverName}:${data.sid}-${data.employeeId})`, error)
        ));
      }
    }));
  }

  loadSettings(): void {
    let selectText = this.getTranslatedText("ADMIN.TABLE_SELECT");
    let flagSelectList = this.getFlagSelectList();
    let columns = {
      serverName: { title: this.getTranslatedText("ADMIN.TABLE_SERVER_NAME"), editable: true,
        editor: { type: 'list', config: { selectText: selectText, list: this.getServerNames(this._data) } },
      },
      sid: { title: this.getTranslatedText("ADMIN.TABLE_SID"), editable: false },
      employeeId: { title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_ID"), editable: true,
        editor: { type: 'list', config: { selectText: selectText, list: this.getEmployeeIds(this._data) } },
      },
      employeeName: { title:  this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_NAME"), editable: false, addable: false },
      importantFlag: { title: this.getTranslatedText("ADMIN.TABLE_IMPORTANT"),
        editor: { type: 'list', config: { selectText: selectText, list: flagSelectList } },
        filter: { type: 'list', config: { selectText: selectText, list: flagSelectList } } },
      comment: { title: this.getTranslatedText("ADMIN.TABLE_COMMENT") }
    };
    super.loadSettings(true, true, true, true, true, true, columns);

  }
}
