import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEsComponent } from './manual-es.component';

describe('ManualEsComponent', () => {
    let component: ManualEsComponent;
    let fixture: ComponentFixture<ManualEsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ManualEsComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ManualEsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*it('should create', () => {
      expect(component).toBeTruthy();
    });*/
});
