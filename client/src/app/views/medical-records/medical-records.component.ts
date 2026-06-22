import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../components/layout.component';
import { MedicalRecordService } from '../../services/medical-record.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>Medical Records</h1>
        <p>View your medical history and records</p>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div class="records-list" *ngIf="!loading">
        <div class="record-card card" *ngFor="let record of records">
          <div class="record-header">
            <div>
              <h3>{{ record.title }}</h3>
              <p class="type">{{ record.type | titlecase }}</p>
            </div>
            <span class="badge badge-info">{{ record.record_id }}</span>
          </div>
          <p class="description" *ngIf="record.description">{{ record.description }}</p>
          <div class="record-meta">
            <span>📅 {{ record.created_at | date:'medium' }}</span>
            <span *ngIf="record.is_confidential">🔒 Confidential</span>
          </div>
          <div class="diagnosis" *ngIf="record.diagnosis?.length">
            <strong>Diagnosis:</strong>
            <span *ngFor="let d of record.diagnosis" class="tag">{{ d.name || d }}</span>
          </div>
          <div class="symptoms" *ngIf="record.symptoms?.length">
            <strong>Symptoms:</strong>
            <span *ngFor="let s of record.symptoms" class="tag">{{ s }}</span>
          </div>
        </div>

        <div class="empty-state" *ngIf="records.length === 0">
          <h3>No medical records yet</h3>
          <p>Your medical records will appear here after your visits</p>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 4px; }
    .page-header p { color: var(--text-light); font-size: 14px; }
    .records-list { display: flex; flex-direction: column; gap: 12px; }
    .record-card { display: flex; flex-direction: column; gap: 10px; }
    .record-header { display: flex; justify-content: space-between; align-items: start; }
    .record-header h3 { font-size: 16px; }
    .record-header .type { font-size: 13px; color: var(--primary); }
    .description { font-size: 13px; color: var(--text-light); }
    .record-meta { font-size: 12px; color: var(--text-light); display: flex; gap: 16px; }
    .diagnosis, .symptoms { font-size: 13px; }
    .diagnosis strong, .symptoms strong { color: var(--text); }
    .tag { background: var(--bg); padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 4px; }
  `]
})
export class MedicalRecordsComponent implements OnInit {
  records: any[] = [];
  loading = true;

  constructor(private medicalRecordService: MedicalRecordService, public auth: AuthService) {}

  ngOnInit() { this.loadRecords(); }

  loadRecords() {
    const req = this.auth.isDoctor()
      ? this.medicalRecordService.listDoctorRecords()
      : this.medicalRecordService.listPatientRecords();
    req.subscribe({
      next: (res) => { this.records = res.records; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
