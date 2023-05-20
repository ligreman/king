import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DialogInfoBasicComponent} from './dialog-info-basic.component';

describe('DialogInfoKeyComponent', () => {
    let component: DialogInfoBasicComponent;
    let fixture: ComponentFixture<DialogInfoBasicComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogInfoBasicComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogInfoBasicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*it('should create', () => {
      expect(component).toBeTruthy();
    });*/
});
