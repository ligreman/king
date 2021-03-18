import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from '../../app-routing.module';

import { DialogInfoRouteComponent } from './dialog-info-route.component';

describe('DialogInfoRouteComponent', () => {
    let component: DialogInfoRouteComponent;
    let fixture: ComponentFixture<DialogInfoRouteComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogInfoRouteComponent],
            providers: [
                {provide: Router, useValue: {}},
                {provide: MatDialog, useValue: {}},
                {provide: MAT_DIALOG_DATA, useValue: {}}
            ], imports: [
                CommonModule,
                FormsModule,
                HttpClientModule,
                AppRoutingModule,
                TranslateModule.forRoot(),
                ToastrModule.forRoot()
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogInfoRouteComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*
it('should create', () => {
        expect(component).toBeTruthy();
    });
*/
});
