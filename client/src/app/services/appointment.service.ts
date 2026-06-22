import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  book(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/`, data);
  }

  list(): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${id}/status?status=${status}`, {});
  }

  addPrescription(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/${data.appointment_id}/prescription`, data);
  }

  listPrescriptions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/prescriptions`);
  }

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/patient`);
  }

  getDoctorDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/doctor`);
  }
}
