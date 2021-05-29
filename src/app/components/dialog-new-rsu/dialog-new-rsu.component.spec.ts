import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewRsuComponent } from './dialog-new-rsu.component';

describe('DialogNewRsuComponent', () => {
    let component: DialogNewRsuComponent;
    let fixture: ComponentFixture<DialogNewRsuComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DialogNewRsuComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogNewRsuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*it('should create', () => {
      expect(component).toBeTruthy();
    });*/
});
