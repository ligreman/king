import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateCacertComponent } from './certificate-cacert.component';

describe('CertificateCacertComponent', () => {
  let component: CertificateCacertComponent;
  let fixture: ComponentFixture<CertificateCacertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateCacertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateCacertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
