import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoUpstreamComponent } from './dialog-info-upstream.component';

describe('DialogInfoUpstreamComponent', () => {
  let component: DialogInfoUpstreamComponent;
  let fixture: ComponentFixture<DialogInfoUpstreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInfoUpstreamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInfoUpstreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
