import { Injectable } from '@angular/core';
import { ResultT } from './course.service';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface GroupListResult {
  id: number;
  name: string;
}

export interface Group {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<ResultT<GroupListResult[]>>(`${environment.apiUrl}/api/Group/`).pipe(
      map(r => r.data)
    );
  }

  create(group: Partial<Group>) {
    return this.http.post<ResultT<Group>>(`${environment.apiUrl}/api/Group`, group).pipe(
        map(r => r.data)
    );
  }

}
