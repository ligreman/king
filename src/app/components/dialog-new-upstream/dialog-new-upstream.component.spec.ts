import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewUpstreamComponent } from './dialog-new-upstream.component';

describe('DialogNewUpstreamComponent', () => {
  let component: DialogNewUpstreamComponent;
  let fixture: ComponentFixture<DialogNewUpstreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewUpstreamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNewUpstreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
