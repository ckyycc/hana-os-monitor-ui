import { Component } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { UserAdminService } from "./user-admin.service";
import { AdminTemplate4Table } from "../table-template";
import { EmployeeLocation, STATUS } from "../../util/consts-classes";
import { MatSnackBar } from "@angular/material";
import { TranslateService } from "@ngx-translate/core";
import {Util} from "../../util/util";

@Component({
  selector: 'app-user-location-admin',
  templateUrl: '../table-template.html',
  styleUrls: ['../admin.component.css'],
  providers: [UserAdminService]

})
export class UserLocationAdminComponent extends AdminTemplate4Table {
  /**
   * Contains all the data returns from Database, including those empty fields
   * Use it only for retrieving the complete employees and locations list.
   * @type {EmployeeLocation[]}
   * @private
   */
  private _data: Array<EmployeeLocation> = [];

  constructor(private translateService: TranslateService,
              private matSnackBar: MatSnackBar,
              private userAdminService: UserAdminService,
              private matDialog: MatDialog,
              private matDialogRef: MatDialogRef<UserLocationAdminComponent>) {
    super(translateService, matSnackBar, matDialogRef, matDialog);
  }

  loadData(): void {
    this.beforeCallBackend();
    this.subscribeList.push(this.userAdminService.getEmployeesLocationInfo().subscribe(
      employeesLocation => {
        this._data = employeesLocation;
        this.loadDataAndSettings(this._data.filter(data => data.employeeId && data.locationId));
        this.afterCallBackend();
        },
        error => this.afterCallBackend(STATUS.WARN, 'ADMIN.LOADING_ERROR', null, error)
    ));
  }

  onRowSelect(event): void { }

  private _checkValidity(allData, data): boolean {
    if (!data.employeeId || !data.employeeId.trim() || !data.locationName || !data.locationName.trim()) {
      return false;
    } else {
      let index = allData.findIndex((employee) => employee.locationName == data.locationName && employee.employeeId == data.employeeId);
      return index < 0? true : index;
    }
  }

  private _setEmployeeLocationInfo(allData, newData) {
    let employeeLocation = allData.find(t => t.employeeId == newData.employeeId);
    if (employeeLocation != null) {
      newData.employeeName = employeeLocation.employeeName;
      newData.email = employeeLocation.email;
      newData.isAdmin = employeeLocation.isAdmin;
    }
  }
  onCreateConfirm(event) {
    let newData = event.newData;
    event.source.getAll().then(allData => {
      let checkResult = this._checkValidity(allData, newData);
      if (checkResult === true) {
        this._setEmployeeLocationInfo(this._data, newData);
        this.beforeCallBackend();
        this.subscribeList.push(this.userAdminService.addEmployeeLocation(newData).subscribe(
          () => {
            event.confirm.resolve(newData);
            // this.tableSource.refresh();
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.CREATION_SUCCESS', `(${newData.employeeId}, ${newData.locationName})`);
          },
          error => this.afterCallBackend(STATUS.WARN, 'ADMIN.CREATION_ERROR',`(${newData.employeeId}, ${newData.locationName})`, error)
        ));
      } else if (checkResult === false) {
        this.setMessage(STATUS.ACCENT, 'ADMIN.USER_ADMIN.USER_LOCATION_EMPTY_WARNING');
      } else {
        this.setMessage(STATUS.ACCENT, 'ADMIN.USER_ADMIN.USER_LOCATION_EXIST',
          [`(${allData[checkResult].employeeId} - ${allData[checkResult].employeeName})`, allData[checkResult].locationName]);
        event.confirm.reject();
      }
    });
  }

  onEditConfirm(event) {
    let originalData = event.data;
    let newData = event.newData;
    if (originalData.employeeId == newData.employeeId && originalData.locationName == newData.locationName) {
      //do not change anything
      event.confirm.resolve(newData);
      return;
    }
    event.source.getAll().then(allData => {
      let checkResult = this._checkValidity(allData, newData);
      if (checkResult === true) {
        this._setEmployeeLocationInfo(this._data, newData);
        newData.oldLocationName = originalData.locationName;
        this.beforeCallBackend();
        this.subscribeList.push(this.userAdminService.updateEmployeeLocation(newData).subscribe(
          () => {
            event.confirm.resolve(newData);
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.UPDATE_SUCCESS', `(${newData.employeeId}, ${newData.locationName})`);
          },
          error => this.afterCallBackend(STATUS.WARN, 'ADMIN.UPDATE_ERROR', `(${newData.employeeId}, ${newData.locationName})`, error)
        ));
      } else if (checkResult === false) {
        this.setMessage(STATUS.ACCENT,'ADMIN.USER_ADMIN.USER_LOCATION_EMPTY_WARNING');
      } else {
        this.setMessage(STATUS.ACCENT, 'ADMIN.USER_ADMIN.USER_LOCATION_EXIST',
          [`(${allData[checkResult].employeeId} - ${allData[checkResult].employeeName})`, allData[checkResult].locationName]);
        event.confirm.reject();
      }
    });
   }

  onDeleteConfirm(event) {
    let data = event.data;
    let dialogConfirmRef = this.confirm('ADMIN.DELETE_CONFIRM', `(${data.employeeId}-${data.employeeName}:${data.locationName})`);
    this.subscribeList.push(dialogConfirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.beforeCallBackend();
        this.subscribeList.push(this.userAdminService.deleteEmployeeLocation(data).subscribe(
          () => {
            event.confirm.resolve();
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.DELETE_SUCCESS',`(${data.employeeId}, ${data.locationName})`);
          },
          error => this.afterCallBackend(STATUS.WARN, 'ADMIN.DELETE_ERROR',`(${data.employeeId}, ${data.locationName})`, error)
        ));
      }
    }));
  }

  loadSettings(): void {
    let selectText = this.getTranslatedText("ADMIN.TABLE_SELECT");
    let flagSelectList = this.getFlagSelectList();
    let locations = this.getLocations(this._data);
    let columns = {
      employeeId: { title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_ID"), editable: false,
        editor: { type: 'list', config: { selectText: selectText, list: this.getEmployeeIds(this._data) } }},
      employeeName: { title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_NAME"), editable: false, addable: false },
      email: { title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_EMAIL"), editable: false, addable: false },
      locationName: { title: this.getTranslatedText("ADMIN.TABLE_LOCATION"),
        editor: { type: 'list', config: { selectText: selectText, list: locations } },
        filter: { type: 'list', config: { selectText: selectText, list: locations } } },
      isAdmin: { title: this.getTranslatedText("ADMIN.TABLE_IS_ADMIN"), editable: false, addable: false,
        editor: { type: 'list', config: { selectText: selectText, list: flagSelectList } },
        filter: { type: 'list', config: { selectText: selectText, list: flagSelectList } } }
    };
    super.loadSettings(true, true, true, true, true, true, columns);
  }
}
