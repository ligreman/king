import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementRouteComponent } from './element-route.component';

describe('ElementRouteComponent', () => {
  let component: ElementRouteComponent;
  let fixture: ComponentFixture<ElementRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElementRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
