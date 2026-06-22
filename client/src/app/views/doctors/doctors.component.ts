import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout.component';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>Find Doctors</h1>
        <p>Search and book appointments with verified doctors</p>
      </div>

      <div class="filters card">
        <div class="filter-row">
          <div class="input-group">
            <input type="text" [(ngModel)]="search" placeholder="Search by name..." (keyup.enter)="loadDoctors()">
          </div>
          <div class="input-group">
            <select [(ngModel)]="specialty" (change)="loadDoctors()">
              <option value="">All Specialties</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="General Practice">General Practice</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
          </div>
          <button class="btn btn-primary" (click)="loadDoctors()">Search</button>
        </div>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div class="doctors-grid" *ngIf="!loading">
        <div class="doctor-card card" *ngFor="let doc of doctors">
          <div class="doctor-header">
            <div class="avatar" style="background: var(--primary);">{{ doc.first_name[0] }}{{ doc.last_name[0] }}</div>
            <div class="doctor-info">
              <h3>Dr. {{ doc.first_name }} {{ doc.last_name }}</h3>
              <p class="specialty">{{ doc.specialty }}</p>
            </div>
          </div>
          <div class="doctor-meta">
            <div class="meta-item">
              <span class="star-rating">★</span>
              <span>{{ doc.rating }}/5 ({{ doc.total_ratings }} reviews)</span>
            </div>
            <div class="meta-item">
              <span>⏱️ {{ doc.experience_years }} years exp</span>
            </div>
            <div class="meta-item">
              <span>💰 \${{ doc.consultation_fee }}</span>
            </div>
          </div>
          <p class="bio" *ngIf="doc.bio">{{ doc.bio }}</p>
          <div class="doctor-actions">
            <a [routerLink]="['/doctors', doc.id]" class="btn btn-primary">View & Book</a>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && doctors.length === 0">
        <h3>No doctors found</h3>
        <p>Try adjusting your search filters</p>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 4px; }
    .page-header p { color: var(--text-light); font-size: 14px; }
    .filters { margin-bottom: 24px; }
    .filter-row { display: flex; gap: 12px; align-items: end; }
    .filter-row .input-group { flex: 1; }
    .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .doctor-card { display: flex; flex-direction: column; gap: 16px; }
    .doctor-header { display: flex; align-items: center; gap: 14px; }
    .doctor-header h3 { font-size: 16px; }
    .doctor-header .specialty { font-size: 13px; color: var(--primary); }
    .doctor-meta { display: flex; flex-direction: column; gap: 6px; }
    .meta-item { font-size: 13px; color: var(--text-light); display: flex; align-items: center; gap: 6px; }
    .bio { font-size: 13px; color: var(--text-light); line-height: 1.5; }
    .doctor-actions { padding-top: 8px; }
  `]
})
export class DoctorsComponent implements OnInit {
  doctors: any[] = [];
  loading = true;
  search = '';
  specialty = '';

  constructor(private doctorService: DoctorService, public auth: AuthService) {}

  ngOnInit() { this.loadDoctors(); }

  loadDoctors() {
    this.loading = true;
    const params: any = {};
    if (this.search) params.search = this.search;
    if (this.specialty) params.specialty = this.specialty;
    this.doctorService.listDoctors(params).subscribe({
      next: (res) => { this.doctors = res.doctors; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
