import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HospitalService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/hospitals/`, { params });
  }

  get(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hospitals/${id}`);
  }

  getDepartments(hospitalId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/hospitals/${hospitalId}/departments`);
  }
}
