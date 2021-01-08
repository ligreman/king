import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewSniComponent } from './dialog-new-sni.component';

describe('DialogNewSniComponent', () => {
  let component: DialogNewSniComponent;
  let fixture: ComponentFixture<DialogNewSniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewSniComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNewSniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
