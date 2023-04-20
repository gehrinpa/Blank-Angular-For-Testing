import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
interface ResultT<T> {
  data: T;
}

export interface UserResult {
  id: number;
  userId: string;
  userEmail: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  userRole: string;
  createdDate: string;
  modifiedDate: string;
}

@Injectable({
  providedIn: 'root'
})

export class ManageUsersService {

  constructor(private http: HttpClient) { }

  usersList() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.get<ResultT<UserResult[]>>(`${environment.apiUrl}/api/Admin/GetAllUsers`, httpOptions).pipe(
      map(r => r)
    );
  }
  rolesList() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.get<ResultT<UserResult[]>>(`${environment.apiUrl}/api/Admin/GetAllRoles`, httpOptions).pipe(
      map(r => r)
    );
  }
  create(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<ResultT<any>>(`${environment.apiUrl}/api/Account/Register`, data, httpOptions).pipe(
      map(r => r.data)
    );
  }

  delete(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<ResultT<any>>(`${environment.apiUrl}/api/Admin/DeleteUser?userId=` + data, httpOptions).pipe(
      map(r => r.data)
    );
  }
  createUserRole(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<ResultT<any>>(`${environment.apiUrl}/api/Admin/AddUserRole?role=` + data, httpOptions).pipe(
      map(r => r.data)
    );
  }

}
