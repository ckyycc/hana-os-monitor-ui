import { MatDialogRef } from "@angular/material/dialog";
import { Component } from "@angular/core";
import { ConfigAdminService } from "./config-admin.service";
import { AdminTemplate4Table } from "../table-template";
import { STATUS } from "../../util/consts-classes";
import { Util } from "../../util/util";
import {MatSnackBar} from "@angular/material";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-config-admin',
  templateUrl: '../table-template.html',
  styleUrls: ['../admin.component.css'],
  providers: [ConfigAdminService]
})

export class ConfigAdminComponent extends AdminTemplate4Table {
  constructor(private translateService: TranslateService,
              private matSnackBar: MatSnackBar,
              private configAdminService: ConfigAdminService,
              public matDialogRef: MatDialogRef<ConfigAdminComponent>) {
    super(translateService, matSnackBar, matDialogRef);
  }

  onRowSelect(event): void { }

  loadData(): void {
    this.beforeCallBackend();
    this.subscribeList.push(this.configAdminService.getConfigurations().subscribe(
      config => {
        this.loadDataAndSettings(config);
        this.afterCallBackend()
      },
        error => this.afterCallBackend(STATUS.WARN, 'ADMIN.LOADING_ERROR', null, error)
    ));
  }

  onCreateConfirm(event) {
    //workaround for Actions.add not working:
    event.confirm.reject();
    this.setMessage(STATUS.ACCENT,"ADMIN.NOT_SUPPORT");
  }

  onEditConfirm(event) {
    let newData = event.newData;
    if (newData.configuration.endsWith("_INT") &&
          (isNaN(parseFloat(newData.value)) ||
            !isFinite(newData.value) ||
            newData.value <= 0 ||
            !Number.isInteger(parseFloat(newData.value)))) {
      event.confirm.reject();
      this.setMessage(STATUS.ACCENT, 'ADMIN.CONFIG_ADMIN.VALUE_INT_WARNING');
      return;
    }
    this.beforeCallBackend();
    this.subscribeList.push(this.configAdminService.updateConfiguration(newData).subscribe(
      () => {
        event.confirm.resolve(newData);
        this.afterCallBackend(STATUS.PRIMARY, 'ADMIN.UPDATE_SUCCESS', newData.configuration);
        },
      error => {
        this.afterCallBackend(STATUS.WARN, 'ADMIN.UPDATE_ERROR', newData.configuration, error);
      }
    ));
  }
  onDeleteConfirm(event) {
    this.setMessage(STATUS.ACCENT, "ADMIN.NOT_SUPPORT");
  }

  getComponents(allData): any {
    //remove duplicates
    return allData.filter(
      (config, index, self) => self.findIndex(t => t.component == config.component) === index
    ).map(config => ({value: config.component, title: config.component}))
      .sort((obj1,obj2)=>obj1.value < obj2.value);
  }

  loadSettings(): void {
    this.tableSource.getAll().then(allData => {
      let isSuperAdmin = Util.isCurrentUserSuperAdmin(Util.getCurrentUser());
      let selectText = this.getTranslatedText("ADMIN.TABLE_SELECT");

      let columns = {
        component: {
          title: this.getTranslatedText("ADMIN.TABLE_COMPONENT"),
          editable: false,
          filter: { type: 'list', config: { selectText: selectText, list: this.getComponents(allData) }}},
        configuration: { title: this.getTranslatedText("ADMIN.TABLE_CONFIG"), editable: false },
        value: { title: this.getTranslatedText("ADMIN.TABLE_VALUE"), editable: isSuperAdmin }
      };
      super.loadSettings(false, isSuperAdmin, false, true, true, true, columns);
    });
  }
}
