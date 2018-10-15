import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { UserAdminService } from "./user-admin.service";
import { AdminTemplate4Table } from "../table-template";
import { STATUS } from "../../util/consts-classes";
import { Util } from "../../util/util";
import {MatSnackBar} from "@angular/material";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-admin',
  templateUrl: '../table-template.html',
  styleUrls: ['../admin.component.css'],
  providers: [UserAdminService]
})

export class UserAdminComponent extends AdminTemplate4Table {

  constructor(private translateService: TranslateService,
              private matSnackBar: MatSnackBar,
              private userAdminService: UserAdminService,
              private matDialog: MatDialog,
              private matDialogRef: MatDialogRef<UserAdminComponent>) {
    super(translateService, matSnackBar, matDialogRef, matDialog);
  }

  onRowSelect(event): void { }

  loadData(): void {
    this.beforeCallBackend();
    this.subscribeList.push(this.userAdminService.getEmployees().subscribe(
      employees => {
        this.loadDataAndSettings(employees);
        this.afterCallBackend();
      },
      error => this.afterCallBackend(STATUS.WARN, 'ADMIN.LOADING_ERROR', null, error)
    ));
  }

  private static checkValidity(employee): boolean {
    return employee.employeeId && employee.employeeId.trim() &&
           employee.employeeName && employee.employeeName.trim() &&
           employee.email && employee.email.trim();
  }

  private static checkAuthorization(employee): boolean {
    let currentUser = Util.getCurrentUser();
    let isAdmin = Util.isCurrentUserAdmin(currentUser);
    let isSuperAdmin = Util.isCurrentUserSuperAdmin(currentUser);
    if (!isAdmin && !isSuperAdmin) {
      return false;
    }
    if (employee.isSuperAdmin == 'X') {
      return isSuperAdmin;
    } else {
      return (isAdmin || isSuperAdmin);
    }
  }

  onCreateConfirm(event) {
    let newData = event.newData;
    if (!UserAdminComponent.checkValidity(newData)) {
      event.confirm.reject();
      this.setMessage(STATUS.ACCENT, 'ADMIN.USER_ADMIN.USER_EMAIL_EMPTY_WARNING');
      return;
    }

    if (!UserAdminComponent.checkAuthorization(newData)) {
      event.confirm.reject();
      this.setMessage(STATUS.ACCENT, 'ADMIN.USER_ADMIN.NO_AUTH_WARNING');
      return;
    }

    event.source.getAll().then(allData => {
    if (allData.findIndex(employee => employee.employeeId == newData.employeeId || employee.email == newData.email) < 0) {
      this.beforeCallBackend();
      this.subscribeList.push(this.userAdminService.addEmployee(newData).subscribe(
        () => {
          event.confirm.resolve(newData);
          this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.CREATION_SUCCESS', newData.employeeId);
        },
        error => this.afterCallBackend(STATUS.WARN, 'ADMIN.CREATION_ERROR', newData.employeeId, error)
        ));
      } else {
        //already exists
        event.confirm.reject();
        this.setMessage(STATUS.ACCENT, 'ADMIN.USER_ADMIN.USER_EMAIL_EXIST', [newData.employeeId, newData.email]);
      }
    });
  }

  onEditConfirm(event) {
    let newData = event.newData;
    if (!UserAdminComponent.checkValidity(newData)) {
      event.confirm.reject();
      this.setMessage(STATUS.ACCENT, 'ADMIN.USER_ADMIN.USER_EMAIL_EMPTY_WARNING');
      return;
    }
    if (!UserAdminComponent.checkAuthorization(newData)) {
      event.confirm.reject();
      this.setMessage(STATUS.ACCENT, 'ADMIN.NO_AUTH_WARNING');
      return;
    }
    event.source.getAll().then(allData => {
      // console.error(updated_employee.locationId + updated_employee.employeeId + updated_employee.location);
      if (allData.findIndex((employee) => employee.employeeId != newData.employeeId && employee.email == newData.email) < 0 ) {
        this.beforeCallBackend();
        this.subscribeList.push(this.userAdminService.updateEmployee(newData).subscribe(
          () => {
            event.confirm.resolve(newData);
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.UPDATE_SUCCESS', newData.employeeId);
          },
          error => this.afterCallBackend(STATUS.WARN, 'ADMIN.UPDATE_ERROR', newData.employeeId, error)
        ));
      } else {
        //already exists, print message
        event.confirm.reject();
        this.setMessage(STATUS.ACCENT, 'ADMIN.USER_ADMIN.USER_EMAIL_EXIST', [newData.employeeId, newData.email]);
      }
    });
  }

  onDeleteConfirm(event) {
    let data = event.data;
    if (!UserAdminComponent.checkAuthorization(data)) {
      event.confirm.reject();
      this.setMessage(STATUS.ACCENT, 'ADMIN.NO_AUTH_WARNING');
      return;
    }

    let dialogConfirmRef = this.confirm('ADMIN.DELETE_CONFIRM', `(${data.employeeId}:${data.employeeName})`);
    this.subscribeList.push(dialogConfirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.beforeCallBackend();
        this.subscribeList.push(this.userAdminService.deleteEmployee(data).subscribe(
          () => {
            event.confirm.resolve();
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.DELETE_SUCCESS', data.employeeId);
          },
          error => this.afterCallBackend(STATUS.WARN, 'ADMIN.DELETE_ERROR', data.employeeId, error)
        ));
      }
    }));
  }

  loadSettings(): void {
    let selectText = this.getTranslatedText("ADMIN.TABLE_SELECT");
    let flagSelectList = this.getFlagSelectList();
    let columns = {
      employeeId: { title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_ID"), editable: false },
      employeeName: { title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_NAME") },
      email: { title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_EMAIL") },
      isAdmin: {
        title: this.getTranslatedText("ADMIN.TABLE_IS_ADMIN"),
        editable: Util.isCurrentUserAdmin(Util.getCurrentUser()),
        editor: { type: 'list', config: { selectText: selectText, list: flagSelectList } },
        filter: { type: 'list', config: { selectText: selectText, list: flagSelectList } }
      },
      isSuperAdmin: {
        title: this.getTranslatedText("ADMIN.TABLE_IS_SUPER_ADMIN"),
        editable: Util.isCurrentUserSuperAdmin(Util.getCurrentUser()),
        editor: { type: 'list', config: { selectText: selectText, list: flagSelectList } },
        filter: { type: 'list', config: { selectText: selectText, list: flagSelectList } }
      }
    };
    super.loadSettings(true, true, true, true, true, true, columns);
  }



}
