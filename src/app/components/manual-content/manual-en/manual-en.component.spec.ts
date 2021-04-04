import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEnComponent } from './manual-en.component';

describe('ManualEnComponent', () => {
    let component: ManualEnComponent;
    let fixture: ComponentFixture<ManualEnComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ManualEnComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ManualEnComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*it('should create', () => {
      expect(component).toBeTruthy();
    });*/
});
