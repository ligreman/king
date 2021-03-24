import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoKeyComponent } from './dialog-info-key.component';

describe('DialogInfoKeyComponent', () => {
    let component: DialogInfoKeyComponent;
    let fixture: ComponentFixture<DialogInfoKeyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogInfoKeyComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogInfoKeyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*it('should create', () => {
      expect(component).toBeTruthy();
    });*/
});
