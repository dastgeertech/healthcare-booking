import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LabResultService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listPatientResults(): Observable<any> {
    return this.http.get(`${this.apiUrl}/lab-results/patient`);
  }

  listDoctorResults(): Observable<any> {
    return this.http.get(`${this.apiUrl}/lab-results/doctor`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/lab-results/`, data);
  }
}
