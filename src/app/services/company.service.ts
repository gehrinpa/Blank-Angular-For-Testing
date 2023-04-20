import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

interface ResultT<T> {
    data: T;
}

export interface CompanyResult {
    id: number;
    name: string;
    companyRef: string;
    sectorId: number;
    sector: string;

    address1: string;
    address2: string;
    county: string;
    postcode: string;
    town: string;
    latitude: number;
    longitude: number;

    contactName: string;
    contactEmail: string;
    contactPhone: string;
}

export interface CompanyUpdate {
    name: string;
    companyRef: string;
    sectorId: number;

    address1: string;
    address2: string;
    county: string;
    postcode: string;
    town: string;

    contactName: string;
    contactEmail: string;
    contactPhone: string;
}

export interface CompanySearchResult {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class CompanyService {

    constructor(private http: HttpClient) { }

    list() {
        return this.http.get<ResultT<CompanyResult[]>>(`${environment.apiUrl}/api/company/`).pipe(
            map(r => r.data)
        );
    }

    search(text: string, sectorId?: number) {
        let params = new HttpParams();
        params = params.set('text', text);

        if (sectorId) {
            params = params.set('sector', '' + sectorId);
        }

        return this.http.get<ResultT<CompanySearchResult[]>>(`${environment.apiUrl}/api/company/search`, {params}).pipe(
            map(r => r.data)
        );
    }

    create(plan: Partial<CompanyUpdate>) {
        return this.http.post<ResultT<CompanyResult>>(`${environment.apiUrl}/api/company`, plan).pipe(
            map(r => r.data)
        );
    }
}
