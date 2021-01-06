import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewTargetComponent } from './dialog-new-target.component';

describe('DialogNewTargetComponent', () => {
  let component: DialogNewTargetComponent;
  let fixture: ComponentFixture<DialogNewTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewTargetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNewTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
