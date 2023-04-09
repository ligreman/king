import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoOauth2Component } from './dialog-info-oauth2.component';

describe('DialogInfoOauth2Component', () => {
  let component: DialogInfoOauth2Component;
  let fixture: ComponentFixture<DialogInfoOauth2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInfoOauth2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogInfoOauth2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
