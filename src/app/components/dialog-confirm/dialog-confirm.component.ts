import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    title: '';
    content: '';
    id: '';
    name: '';
    delete: false;
}

@Component({
    selector: 'app-dialog-confirm',
    templateUrl: './dialog-confirm.component.html',
    styleUrls: ['./dialog-confirm.component.scss'],
    standalone: false
})
export class DialogConfirmComponent implements OnInit {

    constructor(@Inject(MAT_DIALOG_DATA) public texts: DialogData) {
    }

    ngOnInit(): void {
    }
}
