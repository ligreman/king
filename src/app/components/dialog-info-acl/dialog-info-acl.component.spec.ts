import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoAclComponent } from './dialog-info-acl.component';

describe('DialogInfoAclComponent', () => {
  let component: DialogInfoAclComponent;
  let fixture: ComponentFixture<DialogInfoAclComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInfoAclComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInfoAclComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
