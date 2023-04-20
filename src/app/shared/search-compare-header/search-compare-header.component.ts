import { Component, ChangeDetectorRef, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, of as observableOf, Subscription } from 'rxjs';
import { debounceTime, mergeMap } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { SharedService, SearchOptions } from '../../services/shared.service';

@Component({
    selector: 'app-search-compare-header',
    templateUrl: './search-compare-header.component.html',
    styleUrls: ['./search-compare-header.component.scss']
})
export class SearchCompareHeaderComponent implements OnInit, OnDestroy {
    @Input() searchOptions: SearchOptions = {};

    @Input() hideSearchButton: boolean;

    @Input() theme: string;

    // search inputs
    private itemsSub: Subscription;
    public item1: string;
    public item2: string;
    public placeholder1: string;
    public placeholder2: string;
    public typeahead1: Observable<string>;
    public typeahead2: Observable<string>;

    private collapsedSub: Subscription;
    public searchCollapsed = true;

    // mode/options
    private _mode: string;
    public set mode(value) {
        if (value == "company_sector") {
            this.placeholder1 = "sector";
            this.placeholder2 = "company";
        } else {
            this.placeholder1 = `${value} one`;
            this.placeholder2 = `${value} two`;
        }
        this._mode = value;
    }
    public get mode() {
        return this._mode;
    }

    constructor(private cd: ChangeDetectorRef, private apiService: ApiService,
        private authService: AuthService, private sharedService: SharedService) {
    }

    ngOnInit() {
        this.hideSearchButton = this.hideSearchButton !== undefined;
        this.mode = this.searchOptions.forceMode || 'sector';
        this.sharedService.searchOptions = this.searchOptions;

        // setup typeaheads
        this.typeahead1 = Observable.create((observer: any) => {
            observer.next(this.item1);
        }).pipe(
            mergeMap((token: string) => {
                if (this.mode == "sector") {
                    if(this.searchOptions.reqMapping){
                        return this.apiService.getSectorMappingTypeahead(token);
                    } else {
                        return this.apiService.getSectorTypeahead(token);
                    }
                } else {
                    return observableOf([]);
                }
            })
        );

        this.typeahead2 = Observable.create((observer: any) => {
            observer.next(this.item2);
        }).pipe(
            mergeMap((token: string) => {
                if (this.mode == "sector" || this.mode == "company_sector") {
                    return this.apiService.getSectorTypeahead(token);
                } else {
                    return observableOf([]);
                }
            })
        );

        // collapsed
        this.collapsedSub = this.sharedService.getSearchVisible().subscribe(visible => this.searchCollapsed = !visible);

        this.itemsSub = this.sharedService.items$.subscribe(query => {
            // sync
            this.item1 = query.item1;
            this.item2 = query.item2;
            this.mode = query.mode;
        });
    }

    ngOnDestroy() {
        this.itemsSub.unsubscribe();
    }

    search() {
        if(this.item1 == undefined)
            this.item1='';
        this.sharedService.setItems(this.item1, this.item2, this.mode);

        // close search on mobile
        if (screen.width < 768) {
            this.sharedService.setSearchVisible(false);
        }
    }
    clearItems() {
        this.item1 = "";
        this.item2 = "";
    }
}
