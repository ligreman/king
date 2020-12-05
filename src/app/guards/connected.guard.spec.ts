import { TestBed } from '@angular/core/testing';

import { ConnectedGuard } from './connected.guard';

describe('ConnectedGuard', () => {
  let guard: ConnectedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ConnectedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
