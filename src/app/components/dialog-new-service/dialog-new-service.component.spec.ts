import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewServiceComponent } from './dialog-new-service.component';

describe('DialogNewServiceComponent', () => {
  let component: DialogNewServiceComponent;
  let fixture: ComponentFixture<DialogNewServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNewServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
