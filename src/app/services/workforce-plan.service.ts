import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

interface ResultT<T> {
    data: T;
}

export enum WorkforcePlanStatus {
    Live = 'Live',
    Draft = 'Draft',
    Archived = 'Archived'
}

export enum WorkforcePlanType {
    Plan = 'Plan',
    Scenario = 'Scenario',
    Enquiry = 'Enquiry'
}

export interface WorkforcePlanResult {
    id: number;
    name: string;
    description?: string;
    status: WorkforcePlanStatus;
    type: WorkforcePlanType;

    companyId?: number;
    sectorId: number;

    companyName?: string;
    sectorName: string;

    dateCreated: string; // timestamp
    dateUpdated?: string; // timestamp
    targetDate?: string; // timestamp
}

export interface WorkforcePlanRoleResult {
    id: number;
    planId: number;
    functionalArea: string;
    title: string;
    jobSpec?: string;
    jobFamily?: string;

    currentHeadcount: number;
    year1Headcount: number;
    year2Headcount: number;
    year3Headcount: number;
    forecastAttrition: number;

    internal: number;
    apprentice: number;
    graduate: number;
    experienced: number;
    contract: number;

    dateCreated: string; // timestamp
    dateUpdated?: string; // timestamp

    skills: string[];
}

export interface JobFamilyMappingResult {
    id: number;
    jobFamily: string;

    careerId: number;
    careerTitle: string;

    companyId?: number;
    sectorId: number;
}

@Injectable({
    providedIn: 'root'
})
export class WorkforcePlanService {

    constructor(private http: HttpClient) { }

    get(id: number) {
        return this.http.get<ResultT<WorkforcePlanResult>>(`${environment.apiUrl}/api/workforcePlan/${id}`).pipe(
            map(r => r.data)
        );
    }

    getRole(id: number) {
        return this.http.get<ResultT<WorkforcePlanRoleResult>>(`${environment.apiUrl}/api/workforcePlanRole/${id}`).pipe(
            map(r => r.data)
        );
    }

    list(sectorId?: number, companyId?: number) {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('company', '' + companyId);
        }
        if (sectorId) {
            params = params.set('sector', '' + sectorId);
        }
        return this.http.get<ResultT<WorkforcePlanResult[]>>(`${environment.apiUrl}/api/workforcePlan/`, {params}).pipe(
            map(r => r.data)
        );
    }

    listRolesForPlan(planId: number) {
        return this.http.get<ResultT<WorkforcePlanRoleResult[]>>(`${environment.apiUrl}/api/workforcePlan/${planId}/roles`).pipe(
            map(r => r.data)
        );
    }

    listJobFamilyMappings(sectorId?: number, companyId?: number, jobFamilies?: string[]) {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('company', '' + companyId);
        }
        if (sectorId) {
            params = params.set('sector', '' + sectorId);
        }
        if (jobFamilies) {

            if (jobFamilies.length == 0) {
                return observableOf<JobFamilyMappingResult[]>([]);
            }
            for (const jobFamily of jobFamilies) {
                params = params.append('families', jobFamily);
            }
        }
        return this.http.get<ResultT<JobFamilyMappingResult[]>>(`${environment.apiUrl}/api/jobFamilyMapping/`, {params}).pipe(
            map(r => r.data)
        );
    }

    listDistinctJobFamilies(sectorId?: number, companyId?: number) {
        let params = new HttpParams();
        if (companyId) {
            params = params.set('company', '' + companyId);
        }
        if (sectorId) {
            params = params.set('sector', '' + sectorId);
        }
        return this.http.get<ResultT<string[]>>(`${environment.apiUrl}/api/workforcePlanRole/jobFamilies/`, {params}).pipe(
            map(r => r.data)
        );
    }

    create(plan: Partial<WorkforcePlanResult>, useTemplate = false) {
        let params = new HttpParams();

        if (useTemplate) {
            params = params.set('copyTemplate', 'true');
        }

        return this.http.post<ResultT<WorkforcePlanResult>>(`${environment.apiUrl}/api/workforcePlan`, plan, {params}).pipe(
            map(r => r.data)
        );
    }

    createRole(role: Partial<WorkforcePlanRoleResult>) {
        return this.http.post<ResultT<WorkforcePlanRoleResult>>(`${environment.apiUrl}/api/workforcePlanRole`, role).pipe(
            map(r => r.data)
        );
    }

    createJobFamilyMapping(role: Partial<JobFamilyMappingResult>) {
        return this.http.post<ResultT<JobFamilyMappingResult>>(`${environment.apiUrl}/api/jobFamilyMapping`, role).pipe(
            map(r => r.data)
        );
    }

    update(id: number, plan: Partial<WorkforcePlanResult>) {
        const body = [];
        for (const k of Object.keys(plan)) {
            body.push({op: 'replace', path: `/${k}`, value: plan[k]});
        }
        return this.http.patch<ResultT<WorkforcePlanResult>>(`${environment.apiUrl}/api/workforcePlan/${id}`, body).pipe(
            map(r => r.data)
        );
    }

    updateRole(id: number, role: Partial<WorkforcePlanRoleResult>) {
        const body = [];
        for (const k of Object.keys(role)) {
            body.push({op: 'replace', path: `/${k}`, value: role[k]});
        }
        return this.http.patch<ResultT<WorkforcePlanRoleResult>>(`${environment.apiUrl}/api/workforcePlanRole/${id}`, body).pipe(
            map(r => r.data)
        );
    }

    updateJobFamilyMapping(id: number, role: Partial<JobFamilyMappingResult>) {
        const body = [];
        for (const k of Object.keys(role)) {
            body.push({op: 'replace', path: `/${k}`, value: role[k]});
        }
        return this.http.patch<ResultT<JobFamilyMappingResult>>(`${environment.apiUrl}/api/jobFamilyMapping/${id}`, body).pipe(
            map(r => r.data)
        );
    }

    deleteRole(id: number) {
        return this.http.delete(`${environment.apiUrl}/api/workforcePlanRole/${id}`);
    }

    copyFromCompany(srcCompanyId: number, dstCompanyId: number) {
        let params = new HttpParams();
        params = params.set('fromCompany', '' + srcCompanyId);
        params = params.set('toCompany', '' + dstCompanyId);

        return this.http.post(`${environment.apiUrl}/api/workforcePlan/copy`, {}, {params});
    }

    getPlanYears(plan: WorkforcePlanResult) {
        // TODO: actually implement this
        return [2018, 2019, 2020, 2021];
    }
}
