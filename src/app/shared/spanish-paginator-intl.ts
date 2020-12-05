/**
 * Sobrescribo la clase original para añadir los textos en español
 */
import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

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

        this.itemsPerPageLabel = this.translate.instant('pagination.itemsPerPageLabel');
        this.nextPageLabel = this.translate.instant('pagination.nextPageLabel');
        this.previousPageLabel = this.translate.instant('pagination.previousPageLabel');
        this.firstPageLabel = this.translate.instant('pagination.firstPageLabel');
        this.lastPageLabel = this.translate.instant('pagination.lastPageLabel');
        this.ofLabel = this.translate.instant('pagination.ofLabel');
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
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex: number =
            startIndex < length
                ? Math.min(startIndex + pageSize, length)
                : startIndex + pageSize;
        return startIndex + 1 + ' - ' + endIndex + this.ofLabel + length;
    };
}
