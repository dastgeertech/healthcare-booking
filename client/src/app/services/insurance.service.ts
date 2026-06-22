import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InsuranceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listPatientInsurance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/insurance/patient`);
  }

  add(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/insurance/`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/insurance/${id}`, data);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/insurance/${id}`);
  }
}
