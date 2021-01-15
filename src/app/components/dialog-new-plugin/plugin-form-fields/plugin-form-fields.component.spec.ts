import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginFormFieldsComponent } from './plugin-form-fields.component';

describe('PluginFormFieldsComponent', () => {
  let component: PluginFormFieldsComponent;
  let fixture: ComponentFixture<PluginFormFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginFormFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginFormFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
