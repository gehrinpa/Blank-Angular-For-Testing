import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment as env } from '../../environments/environment';
import { SearchParameters } from '../shared';
import { buildSolrQuery } from './solr-utils';

interface CareerCloudResult {
    numFound: number;
    nuts: string;
    query: string;
    service: string;
    status: number;

    title_counts: number[];
    title_max: number;
    title_names: string[];
}

interface ResultT<T> {
    data: T;
}

export interface CareerResult {
    id: number;
    sectorId: number;
    title: string;
}

@Injectable()
export class CareersService {

    constructor(private http: HttpClient) { }

    list(sectorId?: number) {
        let params = new HttpParams();
        if (sectorId) {
            params = params.set('sector', '' + sectorId);
        }
        // console.log(params);
        return this.http.get<ResultT<CareerResult[]>>(`${env.apiUrl}/api/career/`, { params }).pipe(
            map(r => r.data)
        );
    }

    getCareerCloud(searchParams: SearchParameters) {
        const params = new HttpParams()
            .set('query', buildSolrQuery(searchParams))
            .set('titlemax', '25')
            .set('nuts', this.checkNuts(searchParams.regionCode));

        return this.http.get<CareerCloudResult>(`${env.analyticsUrl}/careercloud`, { params });
    }

    getCareersBarChartData(searchParams: SearchParameters) {
        const params = new HttpParams()
            .set('query', buildSolrQuery(searchParams))
            .set('nuts', this.checkNuts(searchParams.regionCode));
            // .set('rank', 'rawfreq');

        return this.http.get<CareerCloudResult>(`${env.analyticsUrl}/careercloud`, { params });
    }

    private checkNuts(nutsId: string) {
        return nutsId || "UK";
    }
}
