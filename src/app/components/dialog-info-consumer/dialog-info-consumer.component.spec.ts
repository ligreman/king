import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoConsumerComponent } from './dialog-info-consumer.component';

describe('DialogInfoConsumerComponent', () => {
  let component: DialogInfoConsumerComponent;
  let fixture: ComponentFixture<DialogInfoConsumerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInfoConsumerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInfoConsumerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
