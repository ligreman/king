/**
 * Sobrescribo la clase original para añadir los textos en español
 */
import {Injectable} from '@angular/core';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class MatPaginatorIntlSpanish extends MatPaginatorIntl {
    itemsPerPageLabel = '';
    nextPageLabel = '';
    previousPageLabel = '';
    firstPageLabel = '';
    lastPageLabel = '';
    ofLabel = '';


    constructor(private translate: TranslateService) {
        super();

        translate.get('pagination.itemsPerPageLabel').subscribe((res) => this.itemsPerPageLabel = res);
        translate.get('pagination.nextPageLabel').subscribe((res) => this.nextPageLabel = res);
        translate.get('pagination.previousPageLabel').subscribe((res) => this.previousPageLabel = res);
        translate.get('pagination.firstPageLabel').subscribe((res) => this.firstPageLabel = res);
        translate.get('pagination.lastPageLabel').subscribe((res) => this.lastPageLabel = res);
        translate.get('pagination.ofLabel').subscribe((res) => this.ofLabel = res);
    }

    getRangeLabel: any = (
        page: number,
        pageSize: number,
        length: number
    ): string => {
        if (length === 0 || pageSize === 0) {
            return '0' + this.ofLabel + length;
        }
        length = Math.max(length, 0);
        const startIndex: number = page * pageSize;
        // If the start index exceeds the list length, do not try to fix the end index to the end.
        const endIndex: number =
            startIndex < length
                ? Math.min(startIndex + pageSize, length)
                : startIndex + pageSize;
        return startIndex + 1 + ' - ' + endIndex + this.ofLabel + length;
    };
}
