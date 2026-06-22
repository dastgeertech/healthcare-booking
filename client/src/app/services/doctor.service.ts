import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listDoctors(params: any = {}): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/`, { params });
  }

  getDoctor(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/${id}`);
  }

  getSlots(doctorId: number, date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/${doctorId}/slots`, { params: { date } });
  }
}
