import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewCertComponent } from './dialog-new-cert.component';

describe('DialogNewCertComponent', () => {
  let component: DialogNewCertComponent;
  let fixture: ComponentFixture<DialogNewCertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewCertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNewCertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
