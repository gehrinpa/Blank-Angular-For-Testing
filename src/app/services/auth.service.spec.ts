/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { Observable, of as observableOf } from 'rxjs';

import { AuthService } from './auth.service';
import { RegionType } from '../shared';
import { environment } from '../../environments/environment';

describe('Service: Auth', () => {
  beforeEach(() => {
    const activatedRouteStub = {
      queryParams: observableOf({})
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));

  const username = 'user@example.com';
  const password = 'correcthorsebatterystaple';
  const tokenResponse = {
    access_token: 'A_TOKEN',
    token_type: '',
    expires_in: 10
  };

  // login
  it('should send oauth request for login', inject([AuthService, HttpTestingController],
    (service: AuthService, httpMock: HttpTestingController) => {

    service.login(username, password).subscribe(data => {
      expect(data).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/token`);

    expect(req.request.method).toEqual('POST');

    // check params
    expect(req.request.body instanceof HttpParams).toBeTruthy();
    expect(req.request.body.get('grant_type')).toBe('password');
    expect(req.request.body.get('username')).toBe(username);
    expect(req.request.body.get('password')).toBe(password);

    req.flush(tokenResponse);

    httpMock.verify();
  }));

  // logout
  it('should remove token from localStorage on logout', inject([AuthService], (service: AuthService) => {
    localStorage.setItem('authToken', 'TEST_TOKEN');

    service.logout();
    expect(localStorage.getItem('authToken')).toBeNull();
  }));

  // canViewRegionData
  it('should allow LEP regions in allowed list', inject([AuthService], (service: AuthService) => {
    const testData = {
      allowedLEPs: [
        'region a'
      ]
    };
    service.token = `TEST.${btoa(JSON.stringify(testData))}.TEST`;

    expect(service.canViewRegionData(RegionType.LEP, 'region a')).toBeTruthy('valid LEP');
    expect(service.canViewRegionData(RegionType.LEP, 'region b')).toBeFalsy('invalid LEP');
  }));

  it('should allow NUTS regions in allowed list', inject([AuthService], (service: AuthService) => {
    const testData = {
      allowedNUTSPrefixes: 'zz0'
    };
    service.token = `TEST.${btoa(JSON.stringify(testData))}.TEST`;

    expect(service.canViewRegionData(RegionType.NUTS1, 'zz0')).toBeTruthy('valid NUTS1');
    expect(service.canViewRegionData(RegionType.NUTS2, 'zz00')).toBeTruthy('valid NUTS2');
    expect(service.canViewRegionData(RegionType.NUTS1, 'zz1')).toBeFalsy('invalid NUTS1');
  }));

  // canViewAnyRegionData
  it('should return true if allowed list is non-empty', inject([AuthService], (service: AuthService) => {
    const testData = {
      allowedLEPs: [
        'region a'
      ]
    };
    service.token = `TEST.${btoa(JSON.stringify(testData))}.TEST`;

    expect(service.canViewAnyRegionData(RegionType.LEP)).toBeTruthy();
    expect(service.canViewAnyRegionData(RegionType.NUTS1)).toBeFalsy();
  }));

  // canViewSector
  it('should allow sectors in allowed list', inject([AuthService], (service: AuthService) => {
    const testData = {
      allowedSectors: [
        'good sector'
      ]
    };
    service.token = `TEST.${btoa(JSON.stringify(testData))}.TEST`;

    expect(service.canViewSector('good sector')).toBeTruthy();
    expect(service.canViewSector('bad sector')).toBeFalsy();
  }));

  // canUseFeature
  it('should allow features in enabled list', inject([AuthService], (service: AuthService) => {
    const testData = {
      enabledFeatures: [
        'useful-feature'
      ]
    };
    service.token = `TEST.${btoa(JSON.stringify(testData))}.TEST`;

    expect(service.canUseFeature('useful-feature')).toBeTruthy();
    expect(service.canUseFeature('useless-feature')).toBeFalsy();
  }));
});
