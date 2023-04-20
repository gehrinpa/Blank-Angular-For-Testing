import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of as observableOf, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SearchParameters, RegionType } from '../shared';
import { buildSolrQuery, buildSolrJobAndQuery, buildSolrJobOrQuery } from './solr-utils';
import { sectorToAdzunaCategory } from './adzuna-mapping';

import { environment as env } from '../../environments/environment';
import moment from 'moment';
import { AuthService } from './auth.service';


interface Description {
    approved?: string;
    match_count: number;
    name: string;
    short_text?: string;
    text: string;
    url: string;
}

interface DescriptionResult {
    results: Description[];
}

interface SkillCloudResult {
    numFound: number;
    nutscode: string;
    solrquery: string;
    service: string;
    status: number;

    num_skills_returned: number;
    skill_counts: number[];
    skillmax: number;
    skill_names: string[];
    skill_tfidf: number[];
    skillthresh: number;

    rank_method: string;
    sector: string;
    merged_sector: string;
    source: number;
}

export interface JobSkillResult {
    skill_names: string[];
    skill_tfidf: number[];
    Esco_Skill_URLs?: {
        [key: string]: string;
    };
}

export interface SkillDnaResult {
    x: string[];
    y: string[];
    z: number[][];
    market: string[][];
    market_skills: {
        [key: string]: {
            [key: string]: number;
        }
    };
    unique_skills: {
        [key: string]: {
            [key: string]: number;
        }
    };
}

@Injectable()
export class SkillsService {

    constructor(private http: HttpClient, private authService: AuthService) { }

    private checkNuts(nutsId: string) {
        return nutsId || "UK";
    }

    getSkillCloud(searchParams: SearchParameters) {
        const params = new HttpParams()
            .set('query', buildSolrQuery(searchParams))
            .set('nuts', this.checkNuts(searchParams.regionCode));

        return this.http.get<SkillCloudResult>(`${env.analyticsUrl}/skillcloud`, { params });
    }

    getRegionalAvailability(searchParams: SearchParameters) {
        const params = new HttpParams()
            .set('query', buildSolrQuery(searchParams))
            .set('nuts', this.checkNuts(undefined));

        return this.http.get<SkillCloudResult>(`${env.analyticsUrl}/regionquantity`, { params });
    }

    getJobCloud(searchParams: SearchParameters, andOr: boolean) {
        let params = new HttpParams();
        if (andOr) {
            params = new HttpParams().set('query', buildSolrJobAndQuery(searchParams)).set('nuts', this.checkNuts(undefined));
        } else {
            params = new HttpParams().set('query', buildSolrJobOrQuery(searchParams)).set('nuts', this.checkNuts(undefined));
        }
        return this.http.get<SkillCloudResult>(`${env.analyticsUrl}/jobcloud`, { params });
    }

    getSkillDescriptions(skills: string[]): Observable<Description[]> {
        if (!skills.length) {
            return observableOf([]);
        }

        let params = new HttpParams().set('type', 'skill');
        for (const skill of skills) {
            params = params.append('q', skill);
        }

        return this.http.get<DescriptionResult>(env.descriptionsUrl, { params }).pipe(
            map(s => s.results.filter(a => a.approved))
        );
    }

    getSkillsBarChartData(searchParams: SearchParameters) {
        const params = new HttpParams()
            .set('query', buildSolrQuery(searchParams))
            .set('nuts', this.checkNuts(searchParams.regionCode));
        // .set('rank', 'rawfreq');

        return this.http.get<SkillCloudResult>(`${env.analyticsUrl}/skillcloud`, { params });
    }

    getJobSkills(searchParams: SearchParameters) {
        let regionTypeStr = RegionType[searchParams.regionType].toLowerCase();

        if (regionTypeStr == 'lau') {
            regionTypeStr = 'la';
        }

        let params = new HttpParams()
            .set('region', searchParams.regionCode)
            .set('region_type', regionTypeStr);

        if (searchParams.jobTitle) {
            params = params.set('mergedtitle', searchParams.jobTitle);
        }

        if(searchParams.sicCode){
            params = params.set('sicCode', searchParams.sicCode.toString());
        }

        // sector/category
        if (searchParams.sector) {
            params = params.set('category', sectorToAdzunaCategory(searchParams.sector));
        }
        if (searchParams.categories && searchParams.categories.length) {
            searchParams.categories.forEach(c => params = params.append('categories', c));
        }

        if (searchParams.startDate) {
            params = params.set('start_date', this.formatDate(searchParams.startDate));
        }
        if (searchParams.endDate) {
            params = params.set('end_date', this.formatDate(searchParams.endDate));
        }

        return this.http.get(`${env.localJobsApiUrl}/merged-title-skills/`, { params }).pipe(
            map(r => r['results'] as JobSkillResult)
        );
    }

    private formatDate(date: Date) {
        const pad = num => num < 10 ? '0' + num : num;

        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    }

    public getAnalysisCategories(): Observable<string[]> {

        const params = new HttpParams()
            .set('email', this.authService.getEmailAddress());

        return this.http.get(`${env.localJobsApiUrl}/analysis-categories/`, { params }).pipe(
            map((r: any) => r.categories)
        );
    }

    public getSkillDna(category: string, titleField: string,
        minCount?: number, maxCount?: number, dateRange?: Date[]): Observable<SkillDnaResult> {

        let params = new HttpParams()
            .set('category', category)
            .set('titleField', titleField);

        if (minCount > 0) {
            params = params.set('minCount', String(minCount));
        }

        if (maxCount > 0) {
            params = params.set('maxCount', String(maxCount));
        }

        if (dateRange) {
            const [startDate, endDate] = dateRange;
            params = params
                .set('startDate', moment(startDate).format('DD-MM-YYYY'))
                .set('endDate', moment(endDate).format('DD-MM-YYYY'));
        }

        return this.http.get<SkillDnaResult>(`${env.localJobsApiUrl}/skill-dna/`, { params });
    }
}
