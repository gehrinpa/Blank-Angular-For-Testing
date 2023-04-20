import { TestBed } from '@angular/core/testing';

import { ManageUsersService } from './manage-users.service';

describe('ManageUsersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManageUsersService = TestBed.get(ManageUsersService);
    expect(service).toBeTruthy();
  });
});
