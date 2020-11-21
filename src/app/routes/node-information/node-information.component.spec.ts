import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeInformationComponent } from './node-information.component';

describe('NodeInformationComponent', () => {
  let component: NodeInformationComponent;
  let fixture: ComponentFixture<NodeInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NodeInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
