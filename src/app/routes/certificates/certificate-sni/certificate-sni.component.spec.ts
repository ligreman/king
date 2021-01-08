import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateSniComponent } from './certificate-sni.component';

describe('CertificateSniComponent', () => {
  let component: CertificateSniComponent;
  let fixture: ComponentFixture<CertificateSniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateSniComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateSniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
