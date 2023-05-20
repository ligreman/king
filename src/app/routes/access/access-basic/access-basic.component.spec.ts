import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AccessBasicComponent} from './access-basic.component';

describe('AccessBasicComponent', () => {
    let component: AccessBasicComponent;
    let fixture: ComponentFixture<AccessBasicComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccessBasicComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccessBasicComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /*it('should create', () => {
      expect(component).toBeTruthy();
    });*/
});
