import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { throwError as observableThrowError, empty as observableEmpty, Observable,  Subject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { SharedService } from './services/shared.service';
import { environment as env } from '../environments/environment';

@Injectable()
export class AuthHttpInterceptor implements HttpInterceptor {
    // Avoid circular dependency
    private get _authService(): AuthService {
        return this._injector.get(AuthService);
    }
    private get _sharedService(): SharedService {
        return this._injector.get(SharedService);
    }
    private requestsInProgress = 0;

    constructor(private _router: Router, private _injector: Injector) {}

    addRequestHeaders(req: HttpRequest<any>): HttpRequest<any> {

        if (req.url == `${env.apiUrl}/token`) {
            return req.clone({setHeaders: {'Content-Type': 'application/x-www-form-urlencoded'}});
        } else if (req.url.startsWith(env.apiUrl)) {
            let headers = req.headers.set('Content-Type', 'application/json');
            if (this._authService.isLoggedIn) {
                if (this._authService.token) {
                    headers = headers.set('Authorization', `Bearer ${this._authService.token}`);
                    // console.log(this._authService.token);
                    // console.log(headers);
                }

                // console.log(req.clone({headers}));

                return req.clone({headers});
            }
        }
        return req;
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.requestsInProgress < 0) {
            this.requestsInProgress = 0;
        }

        this.requestsInProgress++;
        this._sharedService.updateRequestsInProgress(this.requestsInProgress);

        return new Observable(observer => {
            let completed = false;
            const subscription = next.handle(this.addRequestHeaders(req)).pipe(
                catchError((err, source) => {
                    if (err.status == 401 && !(err.url.indexOf('Login') > -1)) {
                        // unauthenticated
                        this._authService.logout();
                        this._router.navigate(['/login']);
                        return observableEmpty();
                    } else {
                        // rethrow other errors
                        return observableThrowError(err);
                    }
                }),
                tap(event => {
                    if (event instanceof HttpResponse) {
                        // completed
                        completed = true;
                        this.requestsInProgress--;
                        this._sharedService.updateRequestsInProgress(this.requestsInProgress);
                    }
                }, error => {
                    // failed
                    this.requestsInProgress--;
                    this._sharedService.updateRequestsInProgress(this.requestsInProgress);
                })
            ).subscribe(event => observer.next(event), err => observer.error(err), () => observer.complete());

            // handle aborted requests
            return () => {
                if (!completed) {
                    this.requestsInProgress--;
                    this._sharedService.updateRequestsInProgress(this.requestsInProgress);
                }
                subscription.unsubscribe();
            };
        });
    }
}
