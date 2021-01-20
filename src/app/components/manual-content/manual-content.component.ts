import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-manual-content',
    templateUrl: './manual-content.component.html',
    styleUrls: ['./manual-content.component.scss']
})
export class ManualContentComponent implements OnInit {
    @Input() summary;

    constructor() { }

    ngOnInit(): void {
    }

    /*
          Scroll hacia un elemento
       */
    scrollTo(element) {
        element.scrollIntoView();
    }
}
