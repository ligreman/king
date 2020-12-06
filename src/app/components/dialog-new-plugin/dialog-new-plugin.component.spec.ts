import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNewPluginComponent } from './dialog-new-plugin.component';

describe('DialogNewPluginComponent', () => {
  let component: DialogNewPluginComponent;
  let fixture: ComponentFixture<DialogNewPluginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNewPluginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNewPluginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
