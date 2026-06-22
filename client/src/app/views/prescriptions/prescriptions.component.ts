import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout.component';

@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>Prescriptions</h1>
        <p>View your prescriptions and medication history</p>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div class="prescriptions-list" *ngIf="!loading">
        <div class="prescription-card card" *ngFor="let rx of prescriptions">
          <div class="rx-header">
            <div>
              <h3>Prescription #{{ rx.id }}</h3>
              <p class="date">{{ rx.created_at | date:'medium' }}</p>
            </div>
            <span class="badge badge-info" *ngIf="rx.valid_until">Valid until {{ rx.valid_until }}</span>
          </div>
          <div class="rx-body">
            <div class="rx-section">
              <strong>Diagnosis:</strong>
              <p>{{ rx.diagnosis }}</p>
            </div>
            <div class="rx-section">
              <strong>Medications:</strong>
              <p>{{ rx.medications }}</p>
            </div>
            <div class="rx-section" *ngIf="rx.notes">
              <strong>Notes:</strong>
              <p>{{ rx.notes }}</p>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="prescriptions.length === 0">
          <h3>No prescriptions yet</h3>
          <p>Your prescriptions will appear here after your doctor visits</p>
          <a routerLink="/doctors" class="btn btn-primary" style="margin-top: 12px;">Find Doctors</a>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 4px; }
    .page-header p { color: var(--text-light); font-size: 14px; }
    .prescriptions-list { display: flex; flex-direction: column; gap: 12px; }
    .prescription-card { display: flex; flex-direction: column; gap: 12px; }
    .rx-header { display: flex; justify-content: space-between; align-items: start; }
    .rx-header h3 { font-size: 16px; }
    .rx-header .date { font-size: 13px; color: var(--text-light); }
    .rx-body { display: flex; flex-direction: column; gap: 10px; }
    .rx-section strong { font-size: 13px; color: var(--text); }
    .rx-section p { font-size: 13px; color: var(--text-light); margin-top: 2px; }
  `]
})
export class PrescriptionsComponent implements OnInit {
  prescriptions: any[] = [];
  loading = true;

  constructor(private appointmentService: AppointmentService, public auth: AuthService) {}

  ngOnInit() { this.loadPrescriptions(); }

  loadPrescriptions() {
    this.appointmentService.listPrescriptions().subscribe({
      next: (res) => { this.prescriptions = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
