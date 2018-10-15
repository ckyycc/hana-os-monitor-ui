import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
  }

  onAboutClick() {
    this.dialog.open(HelpDialog, {
      width: '638px'
    });
  }

}

@Component({
  template: `
    <div mat-dialog-title>
      <img src = "../assets/logo.png" alt="SAP HANA OS Monitor" style="height:58px">
      <div style="margin-top: -68px; text-align: right"><b>HANA Server Operating System Monitoring Tool</b><br>
        <span style="font-size: 16px; color: #575757; margin-right:133px;">Edition for HANA Development Support Team</span>
      </div>
    </div>

    <div mat-dialog-content>
      <p>Version: 1.00.01 (2018.11)</p>
      <p>Cheng, Kuang@SAP</p>
    </div>
    <mat-divider></mat-divider>
    <div mat-dialog-actions>
      <button mat-raised-button (click)="onOKClick()">OK</button>
    </div>
  `
})
export class HelpDialog {
  constructor( public dialogRef: MatDialogRef<HelpDialog>) {}

  onOKClick(): void {
    this.dialogRef.close();
  }
}
