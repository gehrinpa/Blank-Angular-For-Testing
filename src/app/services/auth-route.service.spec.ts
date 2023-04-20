import { TestBed, inject, fakeAsync, async } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';

import { RequireAuthenticated, RequireFeaturePermission } from './auth-route.service';
import { AuthService } from './auth.service';
import { RouterStub } from '../testing/router-stubs';
import { RouterStateSnapshot } from '@angular/router/src/router_state';

const authServiceStub = {
  token: null,
  getToken() { return this.token; },
  canUseFeature(feature) { return feature == 'awesome-feature';}
};

const modalServiceStub = {
  show(c, opts) {}
};

const mockSnapshot = {
  fragment: null
} as ActivatedRouteSnapshot;

const mockStateSnapshot = {
  url: '/'
} as RouterStateSnapshot;

let authService;
let navigateSpy: jasmine.Spy;
let navigateByUrlSpy: jasmine.Spy;

describe('AuthRouteService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RequireAuthenticated,
        RequireFeaturePermission,
        { provide: Router, useClass: RouterStub },
        { provide: BsModalService, useValue: modalServiceStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    authService = TestBed.get(AuthService);

    const router = TestBed.get(Router);
    navigateByUrlSpy = spyOn(router, 'navigateByUrl').and.callThrough();
    navigateSpy = spyOn(router, 'navigate').and.callThrough();
  });

  it('should be created', inject([RequireAuthenticated, RequireFeaturePermission],
    (service: RequireAuthenticated, feat: RequireFeaturePermission) => {

    expect(service).toBeTruthy();
  }));

  // RequireAuthenticated
  it('should return true if authenticated', async(inject([RequireAuthenticated], (service: RequireAuthenticated) => {
    authService.token = null;
    expect(service.canActivate(mockSnapshot, mockStateSnapshot)).toBeFalsy();

    authService.token = 'TOKEN';
    expect(service.canActivate(mockSnapshot, mockStateSnapshot)).toBeTruthy();
  })));

  it('should redirect to login page if unauthenticated', async(inject([RequireAuthenticated], (service: RequireAuthenticated) => {
    authService.token = null;
    service.canActivate(mockSnapshot, mockStateSnapshot);

    expect(navigateSpy.calls.any()).toBe(true, 'called navigate');
    expect(navigateSpy.calls.argsFor(0)[0][0]).toBe('/login');
  })));

  it('should not redirect if authenticated', async(inject([RequireAuthenticated], (service: RequireAuthenticated) => {
    authService.token = 'TOKEN';
    service.canActivate(mockSnapshot, mockStateSnapshot);

    expect(navigateByUrlSpy.calls.any()).toBe(false);
  })));


  // RequireFeaturePermission
  it('should return true if user is allowed to use feature', async(inject([RequireFeaturePermission], (service: RequireAuthenticated) => {
    authService.token = null;
    const route = {
      data: {
        features: ['non-awesome-feature']
      }
    } as any;

    expect(service.canActivate(route, mockStateSnapshot)).toBeFalsy();

    authService.token = 'TOKEN';
    expect(service.canActivate(route, mockStateSnapshot)).toBeFalsy();

    route.data.features = [ 'awesome-feature' ];
    expect(service.canActivate(route, mockStateSnapshot)).toBeTruthy();
  })));
});
