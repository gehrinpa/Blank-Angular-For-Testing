/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthHttpInterceptor } from './http-interceptor';

import { AuthService } from './services/auth.service';
import { SharedService } from './services/shared.service';

import { RouterStub } from './testing/router-stubs';

import { environment } from '../environments/environment';

describe('HttpInterceptor', () => {
    beforeEach(() => {
        const authServiceStub = {
            isLoggedIn: true,
            token: 'A_TOKEN'
        };
        const sharedServiceStub = {
            updateRequestsInProgress: r => {}
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: Router, useClass: RouterStub },
                { provide: AuthService, useValue: authServiceStub },
                { provide: SharedService, useValue: sharedServiceStub },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthHttpInterceptor,
                    multi: true,
                }
            ]
        });
    });

    it('should add auth header', inject([HttpClient, HttpTestingController],
        (http: HttpClient, httpMock: HttpTestingController) => {

        http.get(environment.apiUrl).subscribe();

        const req = httpMock.expectOne(environment.apiUrl);
        expect(req.request.headers.has('Authorization'));

        req.flush({});

        httpMock.verify();
    }));
});
