import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoRouteComponent } from './dialog-info-route.component';

describe('DialogInfoRouteComponent', () => {
  let component: DialogInfoRouteComponent;
  let fixture: ComponentFixture<DialogInfoRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInfoRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInfoRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
