import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewRouteComponent } from './dialog-new-route.component';

describe('DialogNewRouteComponent', () => {
  let component: DialogNewRouteComponent;
  let fixture: ComponentFixture<DialogNewRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNewRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
