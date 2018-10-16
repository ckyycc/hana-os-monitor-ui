import {OnDestroy, OnInit} from "@angular/core";
import {LocalDataSource} from "ng2-smart-table";
import {ConfirmationDialog} from "../util/confirmation-dialog";
import {STATUS} from "../util/consts-classes";
import {MatDialog, MatDialogRef, MatSnackBar} from "@angular/material";
import {TranslateService} from '@ngx-translate/core';
import {Util} from "../util/util";

export abstract class AdminTemplate4Table implements OnInit, OnDestroy {
  private _showIndicator: boolean = false;
  private _snackBar: MatSnackBar;
  private _dialogRef: MatDialogRef<any>;
  private _dialog: MatDialog;
  protected subscribeList = [];
  protected constructor(translate, matSnackBar, matDialogRef, matDialog=null) {
    this._snackBar = matSnackBar;
    this._dialogRef = matDialogRef;
    this._dialog = matDialog;
    this.translate = translate;
    this._dialogRef.disableClose = true;
  }
  public readonly translate: TranslateService;
  public tableSettings: any = {};
  public tableSource: LocalDataSource;
  public generatingSIDFlag: boolean = false;

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.subscribeList.forEach(subscribeItem => subscribeItem.unsubscribe());
  }

  abstract loadData(): void;

  abstract onCreateConfirm(event): void;

  abstract onEditConfirm(event): void;

  abstract onDeleteConfirm(event): void;

  abstract onRowSelect(event): void;

  protected onGenerateSidClick(): void {};

  protected loadDataAndSettings(data) {
    this.tableSource = new LocalDataSource(data);
    this.loadSettings();
  }

  protected getFlagSelectList(): any {
    return [ {value: 'X', title: this.getTranslatedText("ADMIN.TABLE_SELECT_YES")}, {value: ' ', title: this.getTranslatedText("ADMIN.TABLE_SELECT_NO")} ];
  }

  public onBackHomeClick(): void {
    this.setMessage();
    this._dialogRef.close();
  }
  protected loadSettings(actionAdd=true, actionEdit=true, actionDelete=true, confirmEdit=true, confirmCreate=true, confirmDelete=true, columns={}): void {
    this.tableSettings = {
      actions: {
        // columnTitle: 'test',
        add: actionAdd,
        edit: actionEdit,
        delete: actionDelete,
      },
      edit: {
        editButtonContent: this.getTranslatedText('ADMIN.TABLE_EDIT'),
        saveButtonContent: this.getTranslatedText('ADMIN.TABLE_EDIT_UPDATE'),
        cancelButtonContent: this.getTranslatedText('ADMIN.TABLE_CANCEL'),
        confirmSave: confirmEdit
      },
      add: {
        // addButtonContent: 'add_test',
        createButtonContent: this.getTranslatedText('ADMIN.TABLE_ADD_CREATE'),
        cancelButtonContent: this.getTranslatedText('ADMIN.TABLE_CANCEL'),
        confirmCreate: confirmCreate
      },
      delete: {
        deleteButtonContent: this.getTranslatedText('ADMIN.TABLE_DELETE'),
        confirmDelete: confirmDelete
      },
      columns: columns
    };
    AdminTemplate4Table._setAddNewText(this.getTranslatedText('ADMIN.TABLE_ADD'));
    AdminTemplate4Table._setActionsText(this.getTranslatedText('ADMIN.TABLE_ACTIONS'));

    if (!actionAdd) {
      AdminTemplate4Table._hideAddNew();
    }
  }

  protected confirm(messageKey, messageParameter=null, messageDialog=null) : any {
    let dialogConfirmRef = null;
    if (messageDialog) {
      dialogConfirmRef = messageDialog.open(ConfirmationDialog);
    } else {
      dialogConfirmRef = this._dialog.open(ConfirmationDialog);
    }
    dialogConfirmRef.componentInstance.confirmMessage = this.getTranslatedText(messageKey, messageParameter);
    return dialogConfirmRef;
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

      this.translate.get(messageKey, Util.getMsgParameters(messageParameter)).subscribe((message: string) => {
        this._snackBar.open(message, '', {duration: 25000, panelClass: [snackClass]});
      });
    } else {
      this._snackBar.dismiss();
    }
    if (type == STATUS.WARN && error) {
      console.error(error);
    }
  }

  public get indicator(): boolean {
    return this._showIndicator;
  }

  protected beforeCallBackend() {
    this._showIndicator = true;
  }
  protected afterCallBackend(type=STATUS.PRIMARY, messageKey=null, messageParameter=null, error=null): void {
    this._showIndicator = false;
    this.setMessage(type, messageKey, messageParameter, error);
  }

  private static _compareValues(a1, a2) : number {
    return a1.value == a2.value? 0: a1.value > a2.value ? 1: -1;
  }
  protected getEmployeeIds(allData): any {
    //remove duplicates
    return allData.filter(
      (employee, index, self) => self.findIndex(t => t.employeeId && t.employeeId == employee.employeeId) === index
    ).map(employee => ({value: employee.employeeId, title: `${employee.employeeId} - ${employee.employeeName}`}))
      .sort((obj1, obj2) => AdminTemplate4Table._compareValues(obj1, obj2));
  }

  protected getLocations(allData): any {
    //remove duplicates
    return allData.filter(
      (employee, index, self) => self.findIndex(t => t.locationId && t.locationId == employee.locationId) === index
    ).map(employee => ({value: employee.locationName, title: employee.locationName}))
      .sort((obj1, obj2) => AdminTemplate4Table._compareValues(obj1, obj2));
  }

  protected getServerNames(allData): any {
    //remove duplicates
    return allData.filter(
      (employee, index, self) => self.findIndex(t => t.serverId && t.serverName == employee.serverName) === index
    ).map(employee => ({value: employee.serverName, title: employee.serverName}))
      .sort((obj1, obj2) => AdminTemplate4Table._compareValues(obj1, obj2));
  }

  protected getTranslatedText(key, parameters=null) {
    return Util.getTranslatedText(this.translate, key, parameters);
  }

  private static _getElementsByClassName(className): any {
    let item = document.getElementsByClassName(className) as HTMLCollectionOf<HTMLElement>;
    if (item && item.length > 0) {
      return item[0];
    }
    return null;
}
  private static _hideAddNew() {
    let item = AdminTemplate4Table._getElementsByClassName('ng2-smart-action-add-add');
    if (item) {
      item.style.display = 'none';
    }
  }

  private static _setAddNewText(text) {
    let item = AdminTemplate4Table._getElementsByClassName('ng2-smart-action-add-add');
    if (item) {
      item.textContent = text;
    }
  }

  private static _setActionsText(text) {
    let item = AdminTemplate4Table._getElementsByClassName('ng2-smart-actions');
    if (item) {
      item.textContent = text;
    }
  }
}



