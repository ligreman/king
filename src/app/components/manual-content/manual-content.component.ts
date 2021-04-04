import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-manual-content',
    templateUrl: './manual-content.component.html',
    styleUrls: ['./manual-content.component.scss']
})
export class ManualContentComponent implements OnInit {
    @Input() summary;
    @Input() language;

    constructor() {
    }

    ngOnInit(): void {
    }

    isEN() {
        return this.language.value === 'en';
    }

    isES() {
        return this.language.value === 'es';
    }

}
