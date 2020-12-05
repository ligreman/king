import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementUpstreamComponent } from './element-upstream.component';

describe('ElementUpstreamComponent', () => {
  let component: ElementUpstreamComponent;
  let fixture: ComponentFixture<ElementUpstreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElementUpstreamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementUpstreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
