import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';

import { getHttpParams } from './job-post-params';

import { environment } from '../../environments/environment';
import { SearchParameters } from '../shared';

// GeodataService.getJobGeoData, SkillsService.getJobSkills and SalaryService.getJobSalaries also use this API

export enum JobPostGroupPeriod {
    None,
    Month = 'month',
    Quarter = 'quarter',
}

export interface JobHistoryResult {
    count: number;

    merged_title: string;

    // if grouping by date
    month_quarter?: number;
    year?: number;
}

@Injectable({
    providedIn: 'root'
})
export class JobPostService {

    constructor(private http: HttpClient, private authService: AuthService) { }

    getValidDateRange(searchParams: SearchParameters = null) {
        let params = new HttpParams();
        if (searchParams != null) {
            params = getHttpParams(this.authService, searchParams);
        }

        return this.http.get(`${environment.localJobsApiUrl}/valid-dates/`, {params}).pipe(
            map(r => ({
                min: new Date(r['results']['min']),
                max: new Date(r['results']['max'])
            }))
        );
    }

    getValidQuarterRange(searchParams: SearchParameters = null) {
        return this.getValidDateRange(searchParams).pipe(
            map(({min, max}) => {
                let minYear = min.getFullYear();
                let minQuarter = Math.floor((min.getUTCMonth() + 2) / 3) + 1;

                if (minQuarter == 5) {
                    minYear++;
                    minQuarter = 1;
                }

                let maxYear = max.getFullYear();
                // if we have the last month in the quarter, we should have the entire quarter
                let maxQuarter = Math.floor((max.getUTCMonth() + 1) / 3);

                // jan-feb will wrap back to last year
                if (maxQuarter == 0) {
                    maxYear--;
                    maxQuarter = 4;
                }

                // if the min is after the max, then there is no valid quarter
                if (minYear > maxYear || (minYear == maxYear && minQuarter > maxQuarter)) {
                    return {min: null, max: null};
                }

                return {min: [minYear, minQuarter], max: [maxYear, maxQuarter]};
            })
        );
    }

    getCountHistory(searchParams: SearchParameters, titles?: string[], dateGroupPeriod: JobPostGroupPeriod = JobPostGroupPeriod.None) {
        let params = getHttpParams(this.authService, searchParams, titles);

        if (!params) {
            return observableOf<JobHistoryResult[]>([]);
        }

        if (searchParams.regionType) {
            params = params.set('region', searchParams.regionCode);
        }

        if (dateGroupPeriod != JobPostGroupPeriod.None) {
            params = params.set('group_period', dateGroupPeriod);
        }

        return this.http.get(`${environment.localJobsApiUrl}/history/`, {params}).pipe(map(r => r['results'] as JobHistoryResult[]));
    }
}
