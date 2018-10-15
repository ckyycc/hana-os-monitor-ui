import { TestBed, inject } from '@angular/core/testing';

import { InMemoryServerService } from './in-memory-server.service';

describe('InMemoryServerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InMemoryServerService]
    });
  });

  it('should be created', inject([InMemoryServerService], (service: InMemoryServerService) => {
    expect(service).toBeTruthy();
  }));
});
