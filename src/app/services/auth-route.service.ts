import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class RequireAuthenticated implements CanActivate, CanActivateChild {
    constructor(protected auth: AuthService, protected router: Router) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.auth.token) {
            return true;
        } else {
            this.auth.redirectUrl = state.url;
            this.router.navigate(['/login'], { queryParams: route.queryParams });

            return false;
        }
    }

    canActivateChild(route, state) {
        return this.canActivate(route, state);
    }
}

@Injectable()
export class RequireFeaturePermission extends RequireAuthenticated {
    constructor(auth: AuthService, router: Router) {
        super(auth, router);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (!super.canActivate(route, state)) {
            return false;
        }

        const features = route.data.features || [];

        for (const feature of features) {
            if (!this.auth.canUseFeature(feature)) {
                return false;
            }
        }

        return true;
    }
}
