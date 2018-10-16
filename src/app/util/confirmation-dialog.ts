import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";


@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h1 mat-dialog-title>{{'ROOT.CONFIRM_DIALOG_TITLE' | translate}}</h1>
    <div mat-dialog-content style="margin-bottom: 20px">{{confirmMessage}}</div>
    <div mat-dialog-actions>
      <button mat-button style="color: #fff;background-color: #153961;" (click)="dialogRef.close(true)">{{'ROOT.CONFIRM_DIALOG_CONFIRM' | translate}}</button>
      <button mat-button (click)="dialogRef.close(false)">{{'ROOT.CONFIRM_DIALOG_CANCEL' | translate}}</button>
    </div>
  `
})
export class ConfirmationDialog {
  constructor( public translate: TranslateService, public dialogRef: MatDialogRef<ConfirmationDialog>) {
    dialogRef.disableClose = true;
  }

  public confirmMessage:string;
}
