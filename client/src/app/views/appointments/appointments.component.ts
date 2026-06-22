import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>{{ auth.isDoctor() ? 'Patient Appointments' : 'My Appointments' }}</h1>
        <p>{{ auth.isDoctor() ? 'Manage appointments with your patients' : 'View and manage your appointments' }}</p>
      </div>

      <div class="filters card">
        <div class="filter-row">
          <select [(ngModel)]="filterStatus" (change)="applyFilter()">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select [(ngModel)]="filterType" (change)="applyFilter()">
            <option value="">All Types</option>
            <option value="in_person">In-Person</option>
            <option value="video">Video</option>
            <option value="phone">Phone</option>
          </select>
        </div>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div class="appointments-list" *ngIf="!loading">
        <div class="appointment-card card" *ngFor="let apt of filteredAppointments">
          <div class="apt-header">
            <div class="apt-info">
              <h3>{{ auth.isDoctor() ? (apt.patient_name || 'Patient #' + apt.patient_id) : apt.doctor_name }}</h3>
              <p class="specialty" *ngIf="!auth.isDoctor()">{{ apt.specialty }}</p>
              <p class="reason" *ngIf="apt.reason">Reason: {{ apt.reason }}</p>
            </div>
            <span class="badge" [ngClass]="{
              'badge-warning': apt.status === 'pending',
              'badge-success': apt.status === 'confirmed',
              'badge-info': apt.status === 'completed',
              'badge-danger': apt.status === 'cancelled'
            }">{{ apt.status | titlecase }}</span>
          </div>
          <div class="apt-details">
            <div class="detail">📅 {{ apt.appointment_date }}</div>
            <div class="detail">🕐 {{ apt.appointment_time }}</div>
            <div class="detail">📍 {{ apt.type === 'video' ? '📹 Video Call' : apt.type === 'phone' ? '📞 Phone' : '🏥 In-Person' }}</div>
            <div class="detail">💰 \${{ apt.consultation_fee }}</div>
          </div>
          <div class="apt-actions" *ngIf="apt.status === 'pending' || apt.status === 'confirmed'">
            <button class="btn btn-sm btn-success" *ngIf="auth.isDoctor() && apt.status === 'pending'"
              (click)="updateStatus(apt.id, 'confirmed')">✅ Confirm</button>
            <button class="btn btn-sm btn-success" *ngIf="auth.isDoctor() && apt.status === 'confirmed'"
              (click)="updateStatus(apt.id, 'completed')">✔️ Complete</button>
            <button class="btn btn-sm btn-danger" *ngIf="apt.status !== 'cancelled'"
              (click)="updateStatus(apt.id, 'cancelled')">❌ Cancel</button>
          </div>
        </div>

        <div class="empty-state" *ngIf="filteredAppointments.length === 0">
          <h3>No {{ filterStatus || '' }} appointments</h3>
          <p>{{ auth.isPatient() ? 'Find a doctor to book your first appointment' : 'No appointments match your filters' }}</p>
          <a routerLink="/doctors" class="btn btn-primary" style="margin-top: 12px;" *ngIf="auth.isPatient()">Find Doctors</a>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 4px; }
    .page-header p { color: var(--text-light); font-size: 14px; }
    .filters { margin-bottom: 20px; }
    .filter-row { display: flex; gap: 12px; }
    .filter-row select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; min-width: 150px; }
    .appointments-list { display: flex; flex-direction: column; gap: 12px; }
    .appointment-card { display: flex; flex-direction: column; gap: 12px; padding: 20px; }
    .apt-header { display: flex; justify-content: space-between; align-items: start; }
    .apt-info h3 { font-size: 16px; margin-bottom: 2px; }
    .apt-info .specialty { font-size: 13px; color: var(--primary); }
    .apt-info .reason { font-size: 13px; color: var(--text-light); margin-top: 4px; }
    .apt-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .detail { font-size: 13px; color: var(--text-light); }
    .apt-actions { display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
  `]
})
export class AppointmentsComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  loading = true;
  filterStatus = '';
  filterType = '';

  constructor(private appointmentService: AppointmentService, public auth: AuthService) {}

  ngOnInit() { this.loadAppointments(); }

  loadAppointments() {
    this.appointmentService.list().subscribe({
      next: (res) => {
        this.appointments = res || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter() {
    this.filteredAppointments = this.appointments.filter(apt => {
      if (this.filterStatus && apt.status !== this.filterStatus) return false;
      if (this.filterType && apt.type !== this.filterType) return false;
      return true;
    });
  }

  updateStatus(id: number, status: string) {
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => { this.loadAppointments(); }
    });
  }
}
