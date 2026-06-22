import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`);
  }

  listUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users`);
  }

  toggleUserActive(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/toggle-active`, {});
  }

  listHospitals(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hospitals/`);
  }

  verifyHospital(hospitalId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/hospitals/${hospitalId}/verify`, {});
  }
}
