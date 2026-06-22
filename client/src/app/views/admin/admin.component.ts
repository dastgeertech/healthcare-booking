import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LayoutComponent } from '../../components/layout.component';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { HospitalService } from '../../services/hospital.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent, RouterLink],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and management</p>
      </div>

      <div class="error-card card" *ngIf="error">
        <h3>⚠️ {{ error }}</h3>
        <a routerLink="/dashboard" class="btn btn-primary" style="margin-top: 12px;">Go to Dashboard</a>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div *ngIf="!loading && !error">
        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon" style="background: #dbeafe;">👥</div>
            <div>
              <div class="stat-value">{{ stats?.total_users || 0 }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background: #dcfce7;">🧑‍⚕️</div>
            <div>
              <div class="stat-value">{{ stats?.total_patients || 0 }}</div>
              <div class="stat-label">Patients</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background: #f3e8ff;">👨‍⚕️</div>
            <div>
              <div class="stat-value">{{ stats?.total_doctors || 0 }}</div>
              <div class="stat-label">Doctors</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background: #fef3c7;">📅</div>
            <div>
              <div class="stat-value">{{ stats?.total_appointments || 0 }}</div>
              <div class="stat-label">Appointments</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background: #fee2e2;">⏳</div>
            <div>
              <div class="stat-value">{{ stats?.pending_appointments || 0 }}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">👥 Users</button>
          <button class="tab" [class.active]="activeTab === 'hospitals'" (click)="activeTab = 'hospitals'">🏨 Hospitals</button>
        </div>

        <!-- Users Tab -->
        <div class="card" *ngIf="activeTab === 'users'">
          <div class="section-header">
            <h3>All Users ({{ users.length }})</h3>
            <div class="filters">
              <select [(ngModel)]="filterRole" (change)="applyFilter()">
                <option value="">All Roles</option>
                <option value="patient">Patients</option>
                <option value="doctor">Doctors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of filteredUsers">
                <td>
                  <div class="user-cell">
                    <div class="avatar small" [ngClass]="u.role">{{ u.first_name[0] }}{{ u.last_name[0] }}</div>
                    <span>{{ u.first_name }} {{ u.last_name }}</span>
                  </div>
                </td>
                <td>{{ u.email }}</td>
                <td>{{ u.phone || '-' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-info': u.role === 'patient',
                    'badge-success': u.role === 'doctor',
                    'badge-warning': u.role === 'admin'
                  }">{{ u.role | titlecase }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="u.is_active ? 'badge-success' : 'badge-danger'">
                    {{ u.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm" [ngClass]="u.is_active ? 'btn-danger' : 'btn-success'"
                    (click)="toggleUser(u)">
                    {{ u.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Hospitals Tab -->
        <div class="card" *ngIf="activeTab === 'hospitals'">
          <div class="section-header">
            <h3>Hospitals ({{ hospitals.length }})</h3>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Phone</th>
                <th>Emergency</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of hospitals">
                <td><strong>{{ h.name }}</strong></td>
                <td>{{ h.address_city || '-' }}</td>
                <td>{{ h.phone || '-' }}</td>
                <td>{{ h.emergency_services ? '✅ Yes' : '❌ No' }}</td>
                <td>
                  <span class="badge" [ngClass]="h.is_verified ? 'badge-success' : 'badge-warning'">
                    {{ h.is_verified ? 'Verified' : 'Pending' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-success" *ngIf="!h.is_verified"
                    (click)="verifyHospital(h)">Verify</button>
                  <span *ngIf="h.is_verified" class="text-muted">✓</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 4px; }
    .page-header p { color: var(--text-light); font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { display: flex; align-items: center; gap: 16px; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { font-size: 13px; color: var(--text-light); }
    .tabs { display: flex; gap: 4px; margin-bottom: 20px; }
    .tab { padding: 10px 20px; border: none; background: white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; border: 1px solid var(--border); }
    .tab:hover { background: var(--bg); }
    .tab.active { background: var(--primary); color: white; border-color: var(--primary); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h3 { margin: 0; }
    .filters select { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--border); font-size: 13px; }
    .data-table th { font-weight: 600; color: var(--text-light); background: var(--bg); }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .avatar.small { width: 32px; height: 32px; font-size: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
    .avatar.patient { background: #2563eb; }
    .avatar.doctor { background: #16a34a; }
    .avatar.admin { background: #f59e0b; }
    .error-card { text-align: center; padding: 40px; }
    .error-card h3 { margin-bottom: 8px; }
    .text-muted { color: var(--text-light); }
  `]
})
export class AdminComponent implements OnInit {
  stats: any = null;
  users: any[] = [];
  filteredUsers: any[] = [];
  hospitals: any[] = [];
  loading = true;
  error = '';
  activeTab = 'users';
  filterRole = '';

  constructor(
    private adminService: AdminService,
    private hospitalService: HospitalService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isAdmin()) {
      this.error = 'You don\'t have admin privileges';
      this.loading = false;
      return;
    }
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.adminService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Failed to load admin data';
        this.loading = false;
      }
    });

    this.adminService.listUsers().subscribe({
      next: (res) => { this.users = res; this.filteredUsers = res; },
      error: () => {}
    });

    this.hospitalService.list().subscribe({
      next: (res) => { this.hospitals = res.hospitals || []; },
      error: () => {}
    });
  }

  applyFilter() {
    this.filteredUsers = this.filterRole
      ? this.users.filter(u => u.role === this.filterRole)
      : this.users;
  }

  toggleUser(u: any) {
    this.adminService.toggleUserActive(u.id).subscribe({
      next: () => { u.is_active = !u.is_active; }
    });
  }

  verifyHospital(h: any) {
    this.adminService.verifyHospital(h.id).subscribe({
      next: () => { h.is_verified = true; }
    });
  }
}
