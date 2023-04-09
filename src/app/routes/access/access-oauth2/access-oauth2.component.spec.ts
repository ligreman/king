import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessOauth2Component } from './access-oauth2.component';

describe('AccessOauth2Component', () => {
  let component: AccessOauth2Component;
  let fixture: ComponentFixture<AccessOauth2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessOauth2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessOauth2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
