import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewCacertComponent } from './dialog-new-cacert.component';

describe('DialogNewCacertComponent', () => {
  let component: DialogNewCacertComponent;
  let fixture: ComponentFixture<DialogNewCacertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewCacertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNewCacertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
