import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoJwtComponent } from './dialog-info-jwt.component';

describe('DialogInfoJwtComponent', () => {
    let component: DialogInfoJwtComponent;
    let fixture: ComponentFixture<DialogInfoJwtComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogInfoJwtComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogInfoJwtComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*it('should create', () => {
      expect(component).toBeTruthy();
    });*/
});
