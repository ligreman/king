import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateCertComponent } from './certificate-cert.component';

describe('CertificateCertComponent', () => {
  let component: CertificateCertComponent;
  let fixture: ComponentFixture<CertificateCertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateCertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateCertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
