import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from '../../app-routing.module';

import { DialogNewServiceComponent } from './dialog-new-service.component';

describe('DialogNewServiceComponent', () => {
    let component: DialogNewServiceComponent;
    let fixture: ComponentFixture<DialogNewServiceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogNewServiceComponent],
            providers: [
                {provide: Router, useValue: {}},
                {provide: FormBuilder, useValue: {}},
                {provide: MatDialogRef, useValue: {}},
                {provide: MAT_DIALOG_DATA, useValue: {}}
            ], imports: [
                CommonModule,
                FormsModule,
                MatDialogModule,
                HttpClientModule,
                AppRoutingModule,
                TranslateModule.forRoot(),
                ToastrModule.forRoot()
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogNewServiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });


});
