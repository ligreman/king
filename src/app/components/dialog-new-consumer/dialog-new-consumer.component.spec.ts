import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewConsumerComponent } from './dialog-new-consumer.component';

describe('DialogNewConsumerComponent', () => {
  let component: DialogNewConsumerComponent;
  let fixture: ComponentFixture<DialogNewConsumerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewConsumerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNewConsumerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
