import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementServiceComponent } from './element-service.component';

describe('ElementServiceComponent', () => {
  let component: ElementServiceComponent;
  let fixture: ComponentFixture<ElementServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElementServiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
