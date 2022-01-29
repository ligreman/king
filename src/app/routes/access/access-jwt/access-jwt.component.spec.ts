import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessJwtComponent } from './access-jwt.component';

describe('AccessJwtComponent', () => {
    let component: AccessJwtComponent;
    let fixture: ComponentFixture<AccessJwtComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccessJwtComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccessJwtComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    /*
      it('should create', () => {
        expect(component).toBeTruthy();
      });*/
});
