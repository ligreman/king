import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from '../../../app-routing.module';

import { ElementConsumerComponent } from './element-consumer.component';

describe('ElementConsumerComponent', () => {
    let component: ElementConsumerComponent;
    let fixture: ComponentFixture<ElementConsumerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    declarations: [ElementConsumerComponent],
    imports: [CommonModule,
        AppRoutingModule,
        TranslateModule.forRoot(),
        ToastrModule.forRoot()],
    providers: [
        { provide: Router, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ElementConsumerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*
it('should create', () => {
        expect(component).toBeTruthy();
    });
*/
});
