import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from '../app-routing.module';

import { DialogHelperService } from './dialog-helper.service';

describe('DialogHelperService', () => {
    let service: DialogHelperService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [


                {provide: Router, useValue: {}},
                {provide: MatDialog, useValue: {}},
                {provide: MAT_DIALOG_DATA, useValue: {}}
            ], imports: [
                CommonModule,
                HttpClientModule,
                AppRoutingModule,
                TranslateModule.forRoot(),
                ToastrModule.forRoot()
            ]
        });
        service = TestBed.inject(DialogHelperService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
