import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { of as observableOf, Observable, Subscription } from 'rxjs';
import { debounceTime, mergeMap } from 'rxjs/operators';

import { MdcDrawer } from '@angular-mdc/web';

import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { SharedService } from './services/shared.service';
import { AuthHttpInterceptor } from './http-interceptor';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    public dataMenuOpen = false;
    public dataEntryMenuOpen = false;
    public dashboardMenuOpen = false;
    public adminMenuOpen = false;

    @ViewChild('tempDrawer') temporaryDrawer: MdcDrawer;

    constructor(private sharedService: SharedService,
        private apiService: ApiService,
        public authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef) {

        if (window.location.pathname.startsWith('/data/')) {
            this.dataMenuOpen = true;
        }
        if (window.location.pathname.startsWith('/admin/')) {
            this.adminMenuOpen = true;
        }
        if (window.location.pathname.startsWith('/data-entry/')) {
            this.dataEntryMenuOpen = true;
        }
        if (window.location.pathname.startsWith('/reports/')) {
            this.dashboardMenuOpen = true;
        }
    }

    ngOnInit() {
        this.sharedService.items$.subscribe(query => {
            // add search params to url
            this.router.navigate([], {
                queryParams: {
                    m: query.mode,
                    i1: query.item1,
                    i2: query.item2
                },
                queryParamsHandling: 'merge'
            });

            // redirect on search
            if (this.router.url.startsWith("/home")) {
                this.router.navigate(['/map/compare']);
            }

        });

        // handle search from url
        this.route.queryParamMap.subscribe(params => {
            const item1 = params.get('i1');
            const item2 = params.get('i2');
            let mode;
            if (params.has('m')) {
                mode = params.get('m');
            }

            this.sharedService.setItems(item1, item2, mode);
        });
    }


    ngOnDestroy() {
    }


    openDrawer() {
        this.temporaryDrawer.open = true;
    }

    toggleSearchCollapsed() {
        this.sharedService.toggleSearchVisible();
    }
}
