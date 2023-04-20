import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, Subject, ReplaySubject, BehaviorSubject } from 'rxjs';
import { share } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { SearchParameters, RegionType } from '../shared';

export interface SearchOptions {
    singleSearch?: boolean; // display only one search box
    reqMapping?: boolean; // only sector lists with mappings
    forceMode?: string; // override mode
}

export interface SearchItems {
    // search terms
    item1: string;
    item2: string;
    mode: string;

    // mapped search terms + additional filters
    params: [SearchParameters, SearchParameters];
}

@Injectable()
export class SharedService {
    private item1: string;
    private item2: string;
    private _mode: string;
    public nutsRegion: string = "UK";
    public nutsLevel: number = 1;
    public nutsName: string;
    private component: string;
    private itemsSource = new ReplaySubject<SearchItems>(1);
    public items$ = this.itemsSource.asObservable();

    private _searchOptions: SearchOptions = {};

    private requestsSubject = new Subject<Number>();

    private searchVisibleSubject = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
    }

    public setItems(c1, c2, mode) {
        this.item1 = c1;
        this.item2 = c2;
        this._mode = mode;
        this.updateSearchData();
    }

    public setRegion(code: string, name: string, type: RegionType) {
        this.nutsRegion = code;
        this.nutsName = name;
        this.nutsLevel = type;
        this.updateSearchData();
    }

    public getItems() {
        return [this.item1, this.item2];
    }

    public checkSearchValid() {
        return (this.item1 != undefined) && (this.item2 || this._searchOptions.singleSearch);
    }

    public get mode() {
        return this._searchOptions.forceMode || this._mode;
    }

    public set searchOptions(opts: SearchOptions) {
        this._searchOptions = opts;
        this.updateSearchData();
    }

    public getSearchParams(itemNo: Number, params?: SearchParameters) {
        params = params || {};

        const query = itemNo == 1 ? this.item1 : this.item2;

        if (this.isCompanyField(itemNo)) {
            params.company = query;
        } else if (this.isSectorField(itemNo)) {
            params.sector = query;
        }

        if (!params.regionCode) {
            params.regionCode = this.nutsRegion;
        }

        if (params.regionType === undefined) {
            params.regionType = this.nutsLevel;
        }

        return params;
    }

    public saveLog(): void {
        if (environment.production) {
            const data = {
                "Component": this.component,
                "Mode": this.mode,
                "NutsLevel": this.nutsLevel,
                "NutsId": this.nutsRegion,
                "NutsName": this.nutsName,
                "Term1": this.item1,
                "Term2": this.item2
            };
            this.http.post(`${environment.apiUrl}/api/searchlogs`, data).subscribe();
        }
    }

    public logNewComponent(componentName: string) {
        this.component = componentName;
        if (this.checkSearchValid()) {
            this.saveLog();
        }
    }

    private isCompanyField(itemNo) {
        // company comparison or company vs sector left
        return this.mode == "company" || (this.mode == "company_sector" && itemNo == 1);
    }

    private isSectorField(itemNo) {
        // sector comparison or company vs sector right
        return this.mode == "sector" || (this.mode == "company_sector" && itemNo == 2);
    }

    private updateSearchData() {
        if (this.checkSearchValid()) {
            this.saveLog();
            this.itemsSource.next({
                "item1": this.item1,
                "item2": this.item2,
                "mode": this.mode,
                "params": [
                    this.getSearchParams(1),
                    this.getSearchParams(2)
                ]
            });
        }
    }

    public updateRequestsInProgress(requests) {
        this.requestsSubject.next(requests);
    }

    public getRequestsInProgress() {
        return this.requestsSubject.asObservable();
    }

    // mobile search visibility
    public setSearchVisible(visible) {
        this.searchVisibleSubject.next(visible);
    }

    public toggleSearchVisible() {
        this.searchVisibleSubject.next(!this.searchVisibleSubject.value);
    }

    public getSearchVisible() {
        return this.searchVisibleSubject.asObservable();
    }
}
