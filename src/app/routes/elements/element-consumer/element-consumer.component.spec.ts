import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementConsumerComponent } from './element-consumer.component';

describe('ElementConsumerComponent', () => {
  let component: ElementConsumerComponent;
  let fixture: ComponentFixture<ElementConsumerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElementConsumerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementConsumerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
