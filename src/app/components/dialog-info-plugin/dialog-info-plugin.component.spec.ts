import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoPluginComponent } from './dialog-info-plugin.component';

describe('DialogInfoPluginComponent', () => {
  let component: DialogInfoPluginComponent;
  let fixture: ComponentFixture<DialogInfoPluginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInfoPluginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInfoPluginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
