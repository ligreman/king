import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-manual-en',
    templateUrl: './manual-en.component.html',
    styleUrls: ['../manual-content.component.scss']
})
export class ManualEnComponent implements OnInit {
    @Input() summary;

    constructor() { }

    ngOnInit(): void {
    }

    /**
     * Scroll hacia un elemento
     */
    scrollTo(element) {
        element.scrollIntoView();
    }

}
