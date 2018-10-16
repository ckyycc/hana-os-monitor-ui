import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { SIDAdminService } from "./sid-admin.service";
import { AdminTemplate4Table } from "../table-template";
import { SIDMapping, STATUS } from "../../util/consts-classes";
import { Util } from "../../util/util";
import {MatSnackBar} from "@angular/material";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-sid-mapping-admin',
  templateUrl: '../table-template.html',
  styleUrls: ['../admin.component.css'],
  providers: [SIDAdminService]
})


export class SidMappingAdminComponent extends AdminTemplate4Table {
  /**
   * Contains all the data returns from Database, including those empty fields
   * Use it only for retrieving the complete employees list.
   * @type {SIDMapping[]}
   * @private
   */
  private _data: Array<SIDMapping> = [];
  private _EMPTY_LOCATION = ['N/A'];
  constructor(private translateService: TranslateService,
              private matSnackBar: MatSnackBar,
              private sidAdminService: SIDAdminService,
              private matDialog: MatDialog,
              private matDialogRef: MatDialogRef<SidMappingAdminComponent>) {
    super(translateService, matSnackBar, matDialogRef, matDialog);
    this.generatingSIDFlag = true;
  }

  onGenerateSidClick(): void {
    let dialogConfirmRef = this.confirm('ADMIN.SID_ADMIN.SID_GENERATE_CONFIRM');
    this.subscribeList.push(dialogConfirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.beforeCallBackend();
        this.subscribeList.push(this.sidAdminService.generateSIDByMapping().subscribe(
          () => {
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.SID_ADMIN.SID_GENERATE_SUCCESS');
          },
          error => this.afterCallBackend(STATUS.WARN, 'ADMIN.SID_ADMIN.SID_GENERATE_ERROR', error)
        ));
      }
    }));
  }

  lastClickTime: number = 0;
  lastSelectedRow: any;
  onRowSelect(event): void {
    // simulate double click, base on: https://github.com/akveo/ng2-smart-table/issues/513
    if (!this.lastSelectedRow) {
      this.lastSelectedRow = event.data;
    }
    if (this.lastClickTime === 0) {
      this.lastClickTime = new Date().getTime();
    } else {
      const change = (new Date().getTime()) - this.lastClickTime;
      if (change < 400 && this.lastSelectedRow === event.data) {
        this.onDoubleClick(event.data);
      }
      this.lastClickTime = 0;
      this.lastSelectedRow = null;
    }
  }

  onDoubleClick(data): void {
    let sidStart = data.sidStart;
    let sidEnd = data.sidEnd;
    let employeeId = data.employeeId;
    console.log(sidStart, sidEnd, employeeId);
  }

  loadData(): void {
    this.beforeCallBackend();
    this.subscribeList.push(this.sidAdminService.getSIDMappings().subscribe(
      sidMapping => {
        this._data = sidMapping;
        this.loadDataAndSettings(this._data.filter(data => data.employeeId && data.sidStart && data.sidEnd)
          .map(sidMap=> ({
            sidStart: sidMap.sidStart,
            sidEnd: sidMap.sidEnd,
            employeeId: sidMap.employeeId,
            employeeName: sidMap.employeeName,
            locations: sidMap.locations ? sidMap.locations.split(",").filter(location=>location) : this._EMPTY_LOCATION
          }))
        );
        this.afterCallBackend();
        },
        error => this.afterCallBackend(STATUS.WARN, 'ADMIN.LOADING_ERROR', null, error)
    ));
  }

  onCreateConfirm(event) {
    let newData = event.newData;
    newData.sidStart = newData.sidStart.toUpperCase();
    newData.sidEnd = newData.sidEnd.toUpperCase();
    newData.employeeId = newData.employeeId.toUpperCase();
    event.source.getAll().then( allData => {
      this._setMappingInfo(this._data, newData);
      let checkResult = this._checkValidity(allData, newData);
      if (checkResult === true) {
        this.beforeCallBackend();
        this.subscribeList.push(this.sidAdminService.addSIDMapping(newData).subscribe(
          () => {
            event.confirm.resolve(newData);
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.CREATION_SUCCESS', `(${newData.sidStart}-${newData.sidEnd}:${newData.employeeId})`);
            },
          error => this.afterCallBackend(STATUS.WARN, 'ADMIN.CREATION_ERROR', `(${newData.sidStart}-${newData.sidEnd}:${newData.employeeId})`, error)
        ));
      } else {
        if (checkResult === false) {
          this.setMessage(STATUS.ACCENT, 'ADMIN.SID_ADMIN.SID_USER_NOT_CORRECT');
        } else {
          this.setMessage(STATUS.ACCENT, 'ADMIN.SID_ADMIN.SID_MAPPING_CONFLICT',
            `(${allData[checkResult].sidStart}-${allData[checkResult].sidEnd}):(${allData[checkResult].employeeId}-${allData[checkResult].employeeName})`);
        }
        event.confirm.reject();
      }
    });
  }

  onEditConfirm(event) {
    let newData = event.newData;
    newData.sidStart = newData.sidStart.toUpperCase();
    newData.sidEnd = newData.sidEnd.toUpperCase();
    let originalData = event.data;
    event.source.getAll().then(allData => {
      this._setMappingInfo(this._data, newData);
      let checkResult = this._checkValidity(allData, newData, originalData);
      if (checkResult === true) {
        newData.oldSidStart = originalData.sidStart;
        newData.oldSidEnd = originalData.sidEnd;
        newData.oldEmployeeId = originalData.employeeId;
        this.beforeCallBackend();
        this.subscribeList.push(this.sidAdminService.updateSIDMapping(newData).subscribe(
          () => {
            event.confirm.resolve(newData);
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.UPDATE_SUCCESS', `(${newData.sidStart}-${newData.sidEnd}:${newData.employeeId})`);
          },
          error =>  this.afterCallBackend(STATUS.WARN, 'ADMIN.UPDATE_ERROR', `(${newData.sidStart}-${newData.sidEnd}:${newData.employeeId})`, error)
        ));
      } else {
        if (checkResult === false) {
          this.setMessage(STATUS.ACCENT, 'ADMIN.SID_ADMIN.SID_USER_NOT_CORRECT');
        } else {
          this.setMessage(STATUS.ACCENT, 'ADMIN.SID_ADMIN.SID_MAPPING_CONFLICT',
            `(${allData[checkResult].sidStart}-${allData[checkResult].sidEnd}):(${allData[checkResult].employeeId}-${allData[checkResult].employeeName})`);
        }
        event.confirm.reject();
      }
    });
  }

  onDeleteConfirm(event) {
    let data = event.data;

    let dialogConfirmRef = this.confirm('ADMIN.DELETE_CONFIRM', `(${data.sidStart}:${data.sidEnd})~(${data.employeeId}:${data.employeeName})`);
    this.subscribeList.push(dialogConfirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.beforeCallBackend();
        this.subscribeList.push(this.sidAdminService.deleteSIDMapping(data).subscribe(
          () => {
            event.confirm.resolve();
            this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.DELETE_SUCCESS', `(${data.sidStart}-${data.sidEnd}:${data.employeeId})`);
          },
          error => this.afterCallBackend(STATUS.WARN, 'ADMIN.DELETE_ERROR', `(${data.sidStart}-${data.sidEnd}:${data.employeeId})`, error)
        ));
      }
    }));
  }

  private _setMappingInfo(allData, newMapping) {
    let mapping = allData.find(mapping => Util.upper(mapping.employeeId) == Util.upper(newMapping.employeeId));
    if (!mapping) {
      //employee doesn't exist
      return;
    }
    newMapping.locations =
      mapping.locations ? mapping.locations.split(",").filter(location=>location) : this._EMPTY_LOCATION;

    newMapping.employeeName = mapping.employeeName;
  }
  private _checkValidity(allData, newMapping, oldMapping=null): any {
    // if (!newMapping.sidStart || newMapping.sidStart.length != 3 || !newMapping.sidEnd || newMapping.sidEnd.length != 3) {
    //   //length is not 3
    //   return false;
    // }

    if (!newMapping.employeeId || newMapping.employeeId.length <= 0 || !this._validateSidString(newMapping.sidStart, newMapping.sidEnd)) {
      return false;
    }

    let index = allData.findIndex(sidMapping => {
      let employeeId = Util.upper(sidMapping.employeeId);
      let newEmployeeId = Util.upper(newMapping.employeeId);
      let sidStart = Util.upper(sidMapping.sidStart);
      let newSidStart = Util.upper(newMapping.sidStart);
      let sidEnd = Util.upper(sidMapping.sidEnd);
      let newSidEnd = Util.upper(newMapping.sidEnd);

      return (sidMapping !== oldMapping &&
      (employeeId != newEmployeeId) && (
        (sidStart >= newSidStart && sidStart <= newSidEnd) || (sidEnd >= newSidStart && sidEnd <= newSidEnd) ||
        (newSidStart >= sidStart && newSidStart <= sidEnd) || (newSidEnd >= sidStart && newSidEnd <= sidEnd)
      ) && (
        this._sidOverlap(sidMapping.locations, newMapping.locations)
      ))
    });

    if (index < 0) {
      //check successfully
      return true;
    } else {
      return index;
    }
  }


  private _sidOverlap(locations1, locations2): boolean {
    if (locations1 && locations2) {
      if (locations1.findIndex(location => locations2.includes(location)) >=0) {
        return true;
      }
    }
    return false;
  }

  loadSettings(): void {
    let columns = {
      sidStart: {title: this.getTranslatedText("ADMIN.TABLE_SID_START")},
      sidEnd: {title: this.getTranslatedText("ADMIN.TABLE_SID_END")},
      employeeId: { title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_ID"), editable: true,
        editor: { type: 'list', config: { selectText: 'Select...', list: this.getEmployeeIds(this._data) }},
      },
      employeeName: {title: this.getTranslatedText("ADMIN.TABLE_EMPLOYEE_NAME"), editable: false, addable: false },
      locations: {title: this.getTranslatedText("ADMIN.TABLE_LOCATIONS"), editable: false, addable: false}
    };
    super.loadSettings(true, true, true, true, true, true, columns);
  }

  private _getSidPart1Part2(sid): any {
    //Get the part1 and part 2 of the given SID
    if (sid != null && sid.length === 3) {
      sid = sid.toUpperCase();
      //1 char + 2 number
      let re=/[A-Z][0-9][0-9]/;
      if (sid.match(re)) {
        return {type: 0, part1: sid.substr(0,1), part2:Number(sid.substr(1,2))};
      }
      //2 chars + 1 number
      re=/[A-Z][A-Z][0-9]/;
      if (sid.match(re)) {
        return {type: 1, part1: sid.substr(0,2), part2:Number(sid.substr(2,1))};
      }
      //(1 char + 1 number/char) + 1 char
      re=/[A-Z][A-Z0-9][A-Z]/;

      if (sid.match(re)) {
        return {type: 2, part1: sid.substr(0,2), part2:sid.substr(2,1)};
      }
    }
    return null
  }

  private _validateSidString(sidStart, sidEnd): boolean {
    // SID mapping only supports following patterns:
    // [A-Z][A-Z][A-Z] ~ [A-Z][A-Z][A-Z]:first two chars should be identical, eg: CKA ~ CKW
    // [A-Z][0-9][A-Z] ~ [A-Z][0-9][A-Z]:first two chars should be identical, eg: C3A ~ C3W
    // [A-Z][A-Z][0-9] ~ [A-Z][A-Z][0-9]:first two chars should be identical, eg: CK2 ~ CK8
    // [A-Z][0-9][0-9] ~ [A-Z][0-9][0-9]:first char should be identical, eg: C02 ~ C68

    let start = this._getSidPart1Part2(sidStart);
    let end = this._getSidPart1Part2(sidEnd);

    if (!start || !end) {
      return false;
    }
    let sidStartPart1 = start.part1;
    let sidStartPart2 = start.part2;
    let sidStartType = start.type;
    let sidEndPart1 = end.part1;
    let sidEndPart2 = end.part2;
    let sidEndType = end.type;
    if ((sidStartType === 0 && sidEndType === 0) || (sidStartType === 1 && sidEndType === 1)) {
      //type 0: C01~C88 or type 1: CK1 ~ CK9
      return !(sidStartPart1 !== sidEndPart1 || sidStartPart2 > sidEndPart2);
    }

    if (sidStartType === 2 && sidEndType === 2) {
      //CKA ~ CKZ or C0A ~ C0Y
      //type 0: C01~C88 or type 1: CK1 ~ CK9
      return !(sidStartPart1 !== sidEndPart1 || sidStartPart2 > sidEndPart2);
    }

    return false;
  }
}
