import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export interface ResultT<T> {
    data: T;
}

export enum StudentCategory {
    Age16To18 = 'Age16To18',
    Age19Plus = 'Age19Plus'
}

export interface CourseResult {
    aLevelKey?: string;
    awardingOrgName?: string;
    capacity: number;
    courseId: number;
    dateImported: string; // timestamp
    dateUpdated?: string; // timestamp
    durationWeeks: number;
    enrollment: number;
    entryRequirements?: string;
    id: number;
    level: number;
    personas: string[];
    providerCourseId?: string;
    providerId: number;
    qualificationTitle?: string;
    retention: number;
    roles: string[];
    skills: string[];
    studentCategory?: StudentCategory;
    success: number;
    summary?: string;
    title: string;
    tLevelCategory?: string;
    tLevelKey?: string;
    url?: string;
}

export interface CourseSkillResult {
    id: number;
    name: string;
}

export interface CourseRoleResult {
    id: number;
    name: string;
}

export interface CourseSearchResult {
    id: number;
    providerId: number;
    title: string;
}

export interface ProviderSearchResult {
    id: number;
    name: string;
}

export interface EnrollemntByLevelResult {
    [level: number]: number;
}

@Injectable({
    providedIn: 'root'
})
export class CourseService {

    constructor(private http: HttpClient) { }

    get(id: number) {
        return this.http.get<ResultT<CourseResult>>(`${environment.apiUrl}/api/course/${id}`).pipe(
            map(r => r.data)
        );
    }

    search(text: string, providerId?: number) {
        let params = new HttpParams();
        params = params.set('text', text);
        if (providerId) {
            params = params.set('providerId', '' + providerId);
        }

        return this.http.get<ResultT<CourseSearchResult[]>>(`${environment.apiUrl}/api/course/search`, {params}).pipe(
            map(r => r.data)
        );
    }

    searchProviders(text: string) {
        let params = new HttpParams();
        params = params.set('text', text);

        return this.http.get<ResultT<ProviderSearchResult[]>>(`${environment.apiUrl}/api/courseProvider/search`, {params}).pipe(
            map(r => r.data)
        );
    }

    searchCourseSkills(text: string, limit = 0) {
        let params = new HttpParams();
        params = params.set('text', text);

        if (limit > 0) {
            params = params.set('limit', '' + limit);
        }

        return this.http.get<ResultT<CourseSkillResult[]>>(`${environment.apiUrl}/api/skill/search`, {params}).pipe(
            map(r => r.data)
        );
    }

    listCoursePersonas(key: string) {
        let params = new HttpParams();
        params = params.set('courseTypeKey', key);

        return this.http.get<ResultT<CourseRoleResult[]>>(`${environment.apiUrl}/api/coursePersona`, {params}).pipe(
            map(r => r.data)
        );
    }

    listCourseRoles(key: string) {
        let params = new HttpParams();
        params = params.set('courseTypeKey', key);

        return this.http.get<ResultT<CourseRoleResult[]>>(`${environment.apiUrl}/api/courseRole`, {params}).pipe(
            map(r => r.data)
        );
    }

    listAtProvider(providerId: number) {
        return this.http.get<ResultT<CourseResult[]>>(`${environment.apiUrl}/api/course/atProvider/${providerId}`).pipe(
            map(r => r.data)
        );
    }

    listDefaultGroupContentsAtProvider(providerId: number) {
        return this.http.get<ResultT<CourseResult[]>>(`${environment.apiUrl}/api/course/atProviderInDefaultGroup/${providerId}`).pipe(
            map(r => r.data)
        );
    }

    getEnrollmentByLevel() {
        return this.http.get<ResultT<EnrollemntByLevelResult>>(`${environment.apiUrl}/api/course/enrollmentByLevel`).pipe(
            map(r => r.data)
        );
    }

    create(course: Partial<CourseResult>) {
        return this.http.post<ResultT<CourseResult>>(`${environment.apiUrl}/api/course`, course).pipe(
            map(r => r.data)
        );
    }

    update(id: number, course: Partial<CourseResult>) {
        const body = [];
        for (const k of Object.keys(course)) {
            body.push({op: 'replace', path: `/${k}`, value: course[k]});
        }
        return this.http.patch<ResultT<CourseResult>>(`${environment.apiUrl}/api/course/${id}`, body).pipe(
            map(r => r.data)
        );
    }
}
