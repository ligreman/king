import {CommonModule} from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FormBuilder, FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {ToastrModule} from 'ngx-toastr';
import {AppRoutingModule} from '../../app-routing.module';

import {DialogNewRouteNoexpressionsComponent} from './dialog-new-route-noexpressions.component';

describe('DialogNewRouteNoexpressionsComponent', () => {
    let component: DialogNewRouteNoexpressionsComponent;
    let fixture: ComponentFixture<DialogNewRouteNoexpressionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    declarations: [DialogNewRouteNoexpressionsComponent],
    imports: [CommonModule,
        MatDialogModule,
        FormsModule,
        AppRoutingModule,
        TranslateModule.forRoot(),
        ToastrModule.forRoot()],
    providers: [
        { provide: Router, useValue: {} },
        { provide: FormBuilder, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogNewRouteNoexpressionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*
it('should create', () => {
        expect(component).toBeTruthy();
    });
*/
});
