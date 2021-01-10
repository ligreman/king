import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogInfoPluginConfigComponent } from './dialog-info-plugin-config.component';

describe('DialogInfoPluginConfigComponent', () => {
  let component: DialogInfoPluginConfigComponent;
  let fixture: ComponentFixture<DialogInfoPluginConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogInfoPluginConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogInfoPluginConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
