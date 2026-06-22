import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LayoutComponent } from '../../components/layout.component';
import { HospitalService } from '../../services/hospital.service';

@Component({
  selector: 'app-hospital-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="loading-spinner" *ngIf="!hospital"></div>

      <div *ngIf="hospital">
        <div class="detail-header card">
          <div class="hospital-profile">
            <div class="hospital-icon">🏥</div>
            <div>
              <h1>{{ hospital.name }}</h1>
              <p class="address">{{ hospital.address_street }}, {{ hospital.address_city }}, {{ hospital.address_state }} {{ hospital.address_zip }}</p>
              <div class="meta">
                <span class="badge badge-info" *ngIf="hospital.emergency_services">🚨 Emergency Services</span>
                <span class="badge badge-success" *ngIf="hospital.is_verified">✅ Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-body">
          <div class="info-section card">
            <h3>About</h3>
            <p>{{ hospital.description }}</p>
            <div class="contact" *ngIf="hospital.phone || hospital.email">
              <p *ngIf="hospital.phone">📞 {{ hospital.phone }}</p>
              <p *ngIf="hospital.email">✉️ {{ hospital.email }}</p>
            </div>
          </div>

          <div class="departments-section card">
            <h3>Departments ({{ departments.length }})</h3>
            <div class="department-list">
              <div class="department-item" *ngFor="let dept of departments">
                <h4>{{ dept.name }}</h4>
                <p>{{ dept.description }}</p>
                <div class="services" *ngIf="dept.services?.length">
                  <span class="service-tag" *ngFor="let s of dept.services">{{ s.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .detail-header { margin-bottom: 24px; }
    .hospital-profile { display: flex; align-items: center; gap: 20px; }
    .hospital-icon { font-size: 48px; }
    .hospital-profile h1 { font-size: 22px; margin-bottom: 4px; }
    .hospital-profile .address { color: var(--text-light); font-size: 14px; }
    .meta { display: flex; gap: 8px; margin-top: 8px; }
    .detail-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .info-section p { color: var(--text-light); line-height: 1.6; margin-top: 12px; }
    .contact { margin-top: 16px; }
    .contact p { font-size: 14px; margin-bottom: 4px; }
    .departments-section h3 { margin-bottom: 16px; }
    .department-item { padding: 12px 0; border-bottom: 1px solid var(--border); }
    .department-item:last-child { border-bottom: none; }
    .department-item h4 { font-size: 15px; margin-bottom: 4px; }
    .department-item p { font-size: 13px; color: var(--text-light); }
    .services { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .service-tag { background: var(--bg); padding: 4px 10px; border-radius: 6px; font-size: 12px; color: var(--text-light); }
  `]
})
export class HospitalDetailComponent implements OnInit {
  hospital: any = null;
  departments: any[] = [];

  constructor(private route: ActivatedRoute, private hospitalService: HospitalService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.hospitalService.get(id).subscribe({
      next: (res) => { this.hospital = res.hospital; this.departments = res.departments; },
      error: () => {}
    });
  }
}
