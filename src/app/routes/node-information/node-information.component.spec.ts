import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from '../../app-routing.module';

import { NodeInformationComponent } from './node-information.component';

describe('NodeInformationComponent', () => {
    let component: NodeInformationComponent;
    let fixture: ComponentFixture<NodeInformationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    declarations: [NodeInformationComponent],
    imports: [CommonModule,
        FormsModule,
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
        fixture = TestBed.createComponent(NodeInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*
it('should create', () => {
        expect(component).toBeTruthy();
    });
*/
});
