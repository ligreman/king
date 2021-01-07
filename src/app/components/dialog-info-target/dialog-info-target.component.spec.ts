import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoTargetComponent } from './dialog-info-target.component';

describe('DialogInfoTargetComponent', () => {
  let component: DialogInfoTargetComponent;
  let fixture: ComponentFixture<DialogInfoTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInfoTargetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInfoTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
