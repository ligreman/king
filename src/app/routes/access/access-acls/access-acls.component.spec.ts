import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessAclsComponent } from './access-acls.component';

describe('AccessAclsComponent', () => {
  let component: AccessAclsComponent;
  let fixture: ComponentFixture<AccessAclsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessAclsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessAclsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
