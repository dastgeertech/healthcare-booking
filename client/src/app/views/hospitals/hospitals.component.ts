import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from '../../components/layout.component';
import { HospitalService } from '../../services/hospital.service';

@Component({
  selector: 'app-hospitals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>Hospitals</h1>
        <p>Find hospitals and healthcare facilities near you</p>
      </div>

      <div class="filters card">
        <div class="filter-row">
          <div class="input-group">
            <input type="text" [(ngModel)]="search" placeholder="Search hospitals..." (keyup.enter)="loadHospitals()">
          </div>
          <div class="input-group">
            <input type="text" [(ngModel)]="city" placeholder="City..." (keyup.enter)="loadHospitals()">
          </div>
          <button class="btn btn-primary" (click)="loadHospitals()">Search</button>
        </div>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div class="hospitals-grid" *ngIf="!loading">
        <div class="hospital-card card" *ngFor="let h of hospitals">
          <div class="hospital-header">
            <div class="hospital-icon">🏥</div>
            <div>
              <h3>{{ h.name }}</h3>
              <p class="address">{{ h.address_city }}, {{ h.address_state }}</p>
            </div>
          </div>
          <p class="description" *ngIf="h.description">{{ h.description }}</p>
          <div class="hospital-meta">
            <span class="badge badge-info" *ngIf="h.emergency_services">🚨 Emergency</span>
            <span class="badge badge-success" *ngIf="h.is_verified">✅ Verified</span>
          </div>
          <div class="contact-info" *ngIf="h.phone || h.email">
            <span *ngIf="h.phone">📞 {{ h.phone }}</span>
            <span *ngIf="h.email">✉️ {{ h.email }}</span>
          </div>
          <a [routerLink]="['/hospitals', h.id]" class="btn btn-primary">View Details</a>
        </div>
      </div>

      <div class="empty-state" *ngIf="!loading && hospitals.length === 0">
        <h3>No hospitals found</h3>
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
    .hospitals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .hospital-card { display: flex; flex-direction: column; gap: 12px; }
    .hospital-header { display: flex; align-items: center; gap: 14px; }
    .hospital-icon { font-size: 36px; }
    .hospital-header h3 { font-size: 16px; }
    .hospital-header .address { font-size: 13px; color: var(--text-light); }
    .description { font-size: 13px; color: var(--text-light); line-height: 1.5; }
    .hospital-meta { display: flex; gap: 8px; }
    .contact-info { font-size: 13px; color: var(--text-light); display: flex; flex-direction: column; gap: 4px; }
  `]
})
export class HospitalsComponent implements OnInit {
  hospitals: any[] = [];
  loading = true;
  search = '';
  city = '';

  constructor(private hospitalService: HospitalService) {}

  ngOnInit() { this.loadHospitals(); }

  loadHospitals() {
    this.loading = true;
    const params: any = {};
    if (this.search) params.search = this.search;
    if (this.city) params.city = this.city;
    this.hospitalService.list(params).subscribe({
      next: (res) => { this.hospitals = res.hospitals; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
