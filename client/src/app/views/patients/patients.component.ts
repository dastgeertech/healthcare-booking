import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../components/layout.component';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>My Patients</h1>
        <p>Patients who have booked appointments with you</p>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div class="patients-list" *ngIf="!loading">
        <div class="patient-card card" *ngFor="let apt of appointments">
          <div class="patient-header">
            <div class="avatar" style="background: #2563eb;">
              {{ apt.patient_name ? apt.patient_name.split(' ')[0][0] + (apt.patient_name.split(' ')[1] ? apt.patient_name.split(' ')[1][0] : '') : '?' }}
            </div>
            <div class="patient-info">
              <h3>{{ apt.patient_name || 'Patient #' + apt.patient_id }}</h3>
              <p class="specialty">{{ apt.reason || 'No reason provided' }}</p>
            </div>
            <span class="badge" [ngClass]="{
              'badge-warning': apt.status === 'pending',
              'badge-success': apt.status === 'confirmed' || apt.status === 'completed',
              'badge-danger': apt.status === 'cancelled'
            }">{{ apt.status | titlecase }}</span>
          </div>
          <div class="apt-details">
            <div class="detail">📅 {{ apt.appointment_date }}</div>
            <div class="detail">🕐 {{ apt.appointment_time }}</div>
            <div class="detail">📍 {{ apt.type === 'video' ? 'Video Call' : apt.type === 'phone' ? 'Phone' : 'In-Person' }}</div>
          </div>
          <div class="patient-actions" *ngIf="apt.status === 'pending' || apt.status === 'confirmed'">
            <button class="btn btn-sm btn-success" *ngIf="apt.status === 'pending'" (click)="updateStatus(apt.id, 'confirmed')">Confirm</button>
            <button class="btn btn-sm btn-success" *ngIf="apt.status === 'confirmed'" (click)="updateStatus(apt.id, 'completed')">Complete</button>
            <button class="btn btn-sm btn-danger" (click)="updateStatus(apt.id, 'cancelled')">Cancel</button>
          </div>
        </div>

        <div class="empty-state" *ngIf="appointments.length === 0">
          <h3>No patients yet</h3>
          <p>Patients will appear here when they book appointments with you</p>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 4px; }
    .page-header p { color: var(--text-light); font-size: 14px; }
    .patients-list { display: flex; flex-direction: column; gap: 12px; }
    .patient-card { display: flex; flex-direction: column; gap: 12px; }
    .patient-header { display: flex; align-items: center; gap: 14px; }
    .patient-info { flex: 1; }
    .patient-info h3 { font-size: 16px; }
    .patient-info .specialty { font-size: 13px; color: var(--text-light); }
    .apt-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .detail { font-size: 13px; color: var(--text-light); }
    .patient-actions { display: flex; gap: 8px; }
  `]
})
export class PatientsComponent implements OnInit {
  appointments: any[] = [];
  loading = true;

  constructor(private appointmentService: AppointmentService, public auth: AuthService) {}

  ngOnInit() { this.loadPatients(); }

  loadPatients() {
    this.appointmentService.list().subscribe({
      next: (res) => { this.appointments = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  updateStatus(id: number, status: string) {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => { this.loadPatients(); }
    });
  }
}
