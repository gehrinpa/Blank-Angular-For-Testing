import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

interface ResultT<T> {
    data: T;
}

export interface SectorResult {
    id: number;
    name: string;
}

export interface SectorSearchResult {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class SectorService {

    constructor(private http: HttpClient) { }

    list() {
        return this.http.get<ResultT<SectorSearchResult[]>>(`${environment.apiUrl}/api/sector/`).pipe(
            map(r => r.data)
        );
    }

    search(text: string) {
        let params = new HttpParams();
        params = params.set('text', text);

        return this.http.get<ResultT<SectorSearchResult[]>>(`${environment.apiUrl}/api/sector/search`, {params}).pipe(
            map(r => r.data)
        );
    }

    create(plan: Partial<SectorResult>) {
        return this.http.post<ResultT<SectorResult>>(`${environment.apiUrl}/api/sector`, plan).pipe(
            map(r => r.data)
        );
    }
}
