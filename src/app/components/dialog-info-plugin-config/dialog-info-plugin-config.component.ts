import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-info-plugin-config',
    templateUrl: './dialog-info-plugin-config.component.html',
    styleUrls: ['./dialog-info-plugin-config.component.scss']
})
export class DialogInfoPluginConfigComponent implements OnInit {

    constructor(@Inject(MAT_DIALOG_DATA) public plugin: string) { }

    ngOnInit(): void {
    }

    isEmpty() {
        return JSON.stringify(this.plugin['config']) === '{}';
    }
}
