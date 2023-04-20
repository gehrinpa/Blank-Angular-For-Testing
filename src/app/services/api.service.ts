import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FeatureCollection, Polygon } from 'geojson';

import { nutsToAdzunaLocation, sectorToAdzunaCategory } from './adzuna-mapping';

import { environment as env } from '../../environments/environment';

interface ProfileMarkerResult {
    numFound: number;
    NUTS_code: string;
    solrquery: string;
    service: string;
    status: number;

    current_company: string[];
    jobtitle: string[];
    latlngs: [number, number][];
    name: string[];
    profile_picture_url: string[];

    maxrows: number;
    sector: string;
    mergedsector: string;
    numResults: number;
    sourcetype: string;
}

@Injectable()
export class ApiService {
    constructor(private http: HttpClient) { }
    private checkNuts(nutsId) {
        return nutsId || "UK";
    }

    private isCompanyField(mode, itemNo) {
        // company comparison or company vs sector left
        return mode == "company" || (mode == "company_sector" && itemNo == 1);
    }

    private isSectorField(mode, itemNo) {
        // sector comparison or company vs sector right
        return mode == "sector" || (mode == "company_sector" && itemNo == 2);
    }

    private getQueryField(mode, queryno: number) {
        if (this.isCompanyField(mode, queryno)) {
            return "+current_company_l";
        }
        if (this.isSectorField(mode, queryno)) {
            return "+merged_sector_l";
        }
    }

    getProfileMarkers(query: string, mode: string, itemNo: number) {
        const params = new HttpParams()
            .set('query', `${this.getQueryField(mode, itemNo)}:"${query}"`)
            .set('maxrows', '20000')
            .set('nuts', 'UK');

        console.log(`${env.analyticsUrl}/profilelatlngs?` + params.toString());
        return this.http.get<ProfileMarkerResult>(`${env.analyticsUrl}/profilelatlngs`, {
            params
        }).toPromise();
    }

    getSectorMappingTypeahead(query: string) {
        return this.http.get('/assets/sectorsMappings.json').pipe(
            map(s => {
                return s['sectors'].filter((sector: string) => sector.toLowerCase().indexOf(query.toLowerCase()) > -1);
            })
        );
    }

    getSectorLimitedTypeahead(query: string) {
        return this.http.get('/assets/sectorsLimited.json').pipe(
            map(s => {
                return s['sectors'].filter((sector: string) => sector.toLowerCase().indexOf(query.toLowerCase()) > -1);
            })
        );
    }

    getSectorTypeahead(query: string) {
        return this.http.get('/assets/sectors.json').pipe(
            map(s => {
                return s['sectors'].filter((sector: string) => sector.toLowerCase().indexOf(query.toLowerCase()) > -1);
            })
        );
    }

    getExperienceBarChartData(item1: string, item2: string, mode: string, nutsCode: string) {
        const params = new HttpParams()
            .set('rank', 'rawfreq')
            .set('q', `${this.getQueryField(mode, 1)}:"${item1}"`)
            .set('nuts', this.checkNuts(nutsCode));
        const url1 = this.http.get(`${env.analyticsUrl}/totalexp`, { params });

        const params2 = params.set('q', `${this.getQueryField(mode, 2)}:"${item2}"`);
        const url2 = this.http.get(`${env.analyticsUrl}/totalexp`, { params: params2 });

        return new Promise((resolve, reject) => {
            url1.toPromise().then((data) => {
                url2.toPromise().then((data2) => {
                    resolve([data, data2]);
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    getStaffAttritionData(item1: string, item2: string, mode: string, nutsCode: string) {
        const params = new HttpParams()
            .set('rank', 'rawfreq')
            .set('q', `${this.getQueryField(mode, 1)}:"${item1}"`)
            .set('nuts', this.checkNuts(nutsCode));
        const url1 = this.http.get(`${env.analyticsUrl}/joiningrate`, { params });

        const params2 = params.set('q', `${this.getQueryField(mode, 2)}:"${item2}"`);
        const url2 = this.http.get(`${env.analyticsUrl}/joiningrate`, { params: params2 });

        return new Promise((resolve, reject) => {
            url1.toPromise().then((data) => {
                url2.toPromise().then((data2) => {
                    resolve([data, data2]);
                }).catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    // Company news
    getCompanyNews(item: string) {         
        if(item){
            let params = new HttpParams();
            params = params.set("company", item);

            return this.http.get(`${env.localJobsApiUrl}/worldnews/`, { params });
        }

        return null;
    }

    // Adzuna jobs
    getJobPostings(query: string, mode: string, nutsCode: string, itemNo: number, page: number = 1, title: string = ""
        , skill: string = "") {
        let params = new HttpParams();

        const loc = nutsToAdzunaLocation(nutsCode);
        loc.forEach((value, index) => params = params.set(`location${index}`, value));

        if (this.isCompanyField(mode, itemNo)) {
            params = params.set("company", query);
        } else if (this.isSectorField(mode, itemNo)) {
            const cat = sectorToAdzunaCategory(query);
            if (cat) {
                params = params.set("category", cat);
            } else {
                params = params.set("what", query);
            }
        }

        if (title != "") {
            params = params.set("title_only", title);
        }
        if (skill != "") {
            params = params.set("what", skill);
        }

        return this.http.get(`${env.apiUrl}/api/jobs/gb/search/${page}/`, { params });
    }

    getJobHistogram(query: string, mode: string, nutsCode: string, itemNo: number, jobQuery: string, jobQueryType: string = "title"):
        Observable<any> {

        let params = new HttpParams();

        const loc = nutsToAdzunaLocation(nutsCode);
        loc.forEach((value, index) => params = params.set(`location${index}`, value));

        if (this.isCompanyField(mode, itemNo)) {
            // no company parameter
        } else if (this.isSectorField(mode, itemNo)) {
            const cat = sectorToAdzunaCategory(query);
            if (cat) {
                params = params.set("category", cat);
            } else if (!jobQuery) {
                params = params.set("what", query);
            } else {
                // We're already using "what" for the title search
                return observableThrowError("Can't filter by unmapped sector and job title");
            }
        }

        if (jobQuery) {
            if (jobQueryType == "title") {
                // histogram endpoint does not have a "title_only" parameter
                params = params.set("what", jobQuery);
            } else if (jobQueryType == "skill") {
                // ... or a "what_phrase" parameter
                params = params.set("what", jobQuery);
            }
        }

        return this.http.get<any>(`${env.apiUrl}/api/jobs/gb/histogram/`, { params });
    }
}
