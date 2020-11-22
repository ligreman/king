/**
 * Sobrescribo la clase original para añadir los textos en español
 */
import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable({
    providedIn: 'root'
})
export class MatPaginatorIntlSpanish extends MatPaginatorIntl {
    itemsPerPageLabel = 'Elementos por página:';
    nextPageLabel = 'Página siguiente';
    previousPageLabel = 'Página anterior';

    getRangeLabel: any = function (
        page: number,
        pageSize: number,
        length: number
    ): string {
        if (length === 0 || pageSize === 0) {
            return '0 de ' + length;
        }
        length = Math.max(length, 0);
        const startIndex: number = page * pageSize;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex: number =
            startIndex < length
                ? Math.min(startIndex + pageSize, length)
                : startIndex + pageSize;
        return startIndex + 1 + ' - ' + endIndex + ' de ' + length;
    };
}
