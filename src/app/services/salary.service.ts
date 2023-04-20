import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

import { SearchParameters } from '../shared';
import { getHttpParams } from './job-post-params';
import { AuthService } from './auth.service';

import { environment } from '../../environments/environment';

export interface TopAdvertiserResult {
  count: number;
  company: string;
}

export enum SalaryPeriod {
    Hour = 'hour',
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Year = 'year'
}

export enum SalaryGroupPeriod {
    None,
    Month = 'month',
    Quarter = 'quarter',
}

export interface JobSalaryResult {
    count: number;
    max: number;
    max_avg: number;
    min: number;
    min_avg: number;

    merged_title: string;
    period: string;

    // if grouping by date
    month_quarter?: number;
    year?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SalaryService {

    constructor(private http: HttpClient, private authService: AuthService) { }

    getSalaryChartList(searchParams: SearchParameters, period?: SalaryPeriod, titles?: string[],
        dateGroupPeriod: SalaryGroupPeriod = SalaryGroupPeriod.None) {

        let params = getHttpParams(this.authService, searchParams, titles);

        if (!params) {
            return observableOf<JobSalaryResult[]>([]);
       }

        if (searchParams.regionType) {
            params = params.set('region', searchParams.regionCode);
        }

        if (period) {
            params = params.set('period', period);
        }

        if (dateGroupPeriod != SalaryGroupPeriod.None) {
            params = params.set('group_period', dateGroupPeriod);
        }

        return this.http.get(`${environment.localJobsApiUrl}/all-salaries/`, {params}).pipe(
            map(r => r['results'] as JobSalaryResult[])
        );

    }

    getSalaryChartListBySkills(searchParams: SearchParameters, skills?: string[], andOr?: string) {

        let params = getHttpParams(this.authService, searchParams);

        if (!params) {
            return observableOf<JobSalaryResult[]>([]);
        }

        if (searchParams.regionType) {
            params = params.set('region', searchParams.regionCode);
        }

        if (skills) {
            skills.forEach(function (value) {
                params = params.append('skill', value.toLowerCase());
            });
        }

        if (andOr) {
            params = params.set('and_or', andOr);
        }

        params = params.delete('end_date');
        params = params.delete('start_date');
        params = params.delete('title');

        return this.http.get(`${environment.localJobsApiUrl}/all-salaries-by-skills/`, {params}).pipe(
            map(r => r['results'] as JobSalaryResult[])
        );
    }

    public async getTopAdvertisers(searchParams: SearchParameters, period?: SalaryPeriod, titles?: string[],
        dateGroupPeriod: SalaryGroupPeriod = SalaryGroupPeriod.None, titleField?: string): Promise<TopAdvertiserResult[]> {

        // console.log('TF Before Params: '+titleField);
        // console.log(searchParams);
        let params = getHttpParams(this.authService, searchParams, titles);
        // console.log('TF After Params: '+titleField);

        if (!params) {
            return [];
        }

        if (searchParams.regionCode) {
            params = params.set('region', searchParams.regionCode);
        }

        if (period) {
            params = params.set('period', period);
        }

        if (dateGroupPeriod != null && dateGroupPeriod != SalaryGroupPeriod.None) {
            params = params.set('group_period', dateGroupPeriod);
        }

        if(titleField) {
            params = params.set('title_field', titleField);
        }

        try {
          const result = await this.http.get(`${environment.localJobsApiUrl}/top-advertisers/`, {params}).toPromise<any>();
          if (result.status === "OK") {
            const results = result.results as TopAdvertiserResult[];
            const sortedResults = results.sort((a: any, b: any) => {
              return b.count - a.count;
            });
            return sortedResults;
          } else {
            throw new Error("Invalid response. Status: " + result.status);
          }
        } catch (exception) {
          throw new Error(exception);
        }
    }

    getJobSalaries(searchParams: SearchParameters, period?: SalaryPeriod, titles?: string[],
        dateGroupPeriod: SalaryGroupPeriod = SalaryGroupPeriod.None) {

        let params = getHttpParams(this.authService, searchParams, titles);

        if (!params) {
            return observableOf<JobSalaryResult[]>([]);
        }

        if (searchParams.regionType) {
            params = params.set('region', searchParams.regionCode);
        }
        if (searchParams.categories && searchParams.categories.length) {
            searchParams.categories.forEach(c => params = params.append('categories', c));
        }

        if (period) {
            params = params.set('period', period);
        }

        if (dateGroupPeriod != SalaryGroupPeriod.None) {
            params = params.set('group_period', dateGroupPeriod);
        }

        if(searchParams.sicCode){
            params = params.set('sicCode', searchParams.sicCode.toString());
        }

        return this.http.get(`${environment.localJobsApiUrl}/salaries/`, {params}).pipe(
            map(r => r['results'] as JobSalaryResult[])
        );
    }
}
