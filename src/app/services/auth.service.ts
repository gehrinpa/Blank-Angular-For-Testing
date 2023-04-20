import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment as env } from '../../environments/environment';
import { RegionType } from '../shared';
import { JwtHelperService } from '@auth0/angular-jwt';

const helper = new JwtHelperService();

@Injectable()
export class AuthService {
    public redirectUrl: string;
    public token: any;
    private decodedToken: any = null;
    private isGuestToken = false;
    public userRole: any = "";
    public get isLoggedIn() {
         return this.token != null;
    };

    public get userRoll() {
        this.userRole = localStorage.getItem('userRole');
        return  this.userRole;
    };

    constructor(private _http: HttpClient, private route: ActivatedRoute) {
        route.queryParams.subscribe(params => {

            if (params.token !== undefined) {
                localStorage.setItem('authToken', params.token);
                localStorage.setItem('authTokenGuest', 'true');
                this.token = params.token;
                // console.log(params.token);
                this.decodedToken = null;
            }
        });

        const existingToken = localStorage.getItem('authToken');
        this.isGuestToken = localStorage.getItem('authTokenGuest') == 'true';
        if (existingToken) {
            const now = new Date().getTime();
            const expiry = +localStorage.getItem('authTokenExpiry');
            const isJWT = existingToken.split('.').length == 3;

            if ((now < expiry || this.isGuestToken) && isJWT) {
                this.token = existingToken;
            } else {
                this.token = null;
                localStorage.removeItem('authToken');
            }
        }
    }
    login(username: string, password: string): Observable<boolean> {
        console.log(`${env.apiUrl}/token`);
        const body = new HttpParams()
            .set('grant_type', 'password')
            .set('username', username)
            .set('password', password);

        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');

        return this._http.post(`${env.apiUrl}/token`, body).pipe(
            map(s => {

                // console.log(s);
                localStorage.setItem('authToken', s['access_token']);

                const expiry = +new Date(s['.expires']);
                localStorage.setItem('authTokenExpiry', expiry.toString());

                localStorage.removeItem('authTokenGuest');
                this.token = s['access_token'];
                localStorage.setItem('userRole', s['userRole']);
                this.decodedToken = null;
                return this.isLoggedIn;
            })
        );
    }
    logout(): any {
        
        this.token = this.decodedToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        return true
    }

    canViewRegionData(regionType: RegionType, regionKey: string) {
        if (regionType == RegionType.NUTS1 || regionType == RegionType.NUTS2 || regionType == RegionType.NUTS3) {
            const nutsPrefixes = this.getClaimArray('allowedNUTSPrefixes');
            if (nutsPrefixes.includes('*')) {
                return true;
            }

            return nutsPrefixes.find(prefix => regionKey.toLowerCase().startsWith(prefix)) !== undefined;
        }

        if (regionType == RegionType.LEP) {
            const leps = this.getClaimArray('allowedLEPs');
            return leps.includes(regionKey.toLowerCase()) || leps.includes('*');
        }

        return true;
    }

    canViewAnyRegionData(regionType: RegionType) {
        if (regionType == RegionType.NUTS1 || regionType == RegionType.NUTS2 || regionType == RegionType.NUTS3) {
            return this.getClaimArray('allowedNUTSPrefixes').length != 0;
        }

        if (regionType == RegionType.LEP) {
            return this.getClaimArray('allowedLEPs').length != 0;
        }

        return true;
    }

    canViewSector(sectorName: string) {
        const sectors = this.getClaimArray('allowedSectors');
        return sectors.includes(sectorName.toLowerCase()) || sectors.includes('*');
    }

    canUseFeature(featureName: string) {
        const features = this.getClaimArray('enabledFeatures');
        return features.includes(featureName.toLowerCase()) || features.includes('*');
    }

    getEmailAddress() {
        if (this.isLoggedIn) {
            const decodedToken = this.decodeToken();

            return decodedToken ? decodedToken.unique_name : null;
        } else {
            return null;
        }
    }

    isGuest() {
        return this.isGuestToken;
    }

    private decodeToken() {
        if (!this.token) {
            return null;
        }

        if (!this.decodedToken) {
            this.decodedToken = JSON.parse(atob(this.token.split('.')[1]));
        }
        return this.decodedToken;
    }

    // Deal with how ASP.NET encodes arrays
    private getClaimArray(claimName) {
        const tokenData = this.decodeToken();
        if (!tokenData) {
            return [];
        }

        const claim = tokenData[claimName];

        // Missing
        if (claim === undefined) {
            return [];
        }

        // Already an array
        if (Array.isArray(claim)) {
            return claim;
        }

        // A single entry is encoded without an array
        return [claim];
    }
}
