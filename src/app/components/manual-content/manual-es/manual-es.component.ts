import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-manual-es',
    templateUrl: './manual-es.component.html',
    styleUrls: ['../manual-content.component.scss'],
    standalone: false
})
export class ManualEsComponent implements OnInit {
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
