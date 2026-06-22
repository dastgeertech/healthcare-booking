import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout.component';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>Manage Users</h1>
        <p>View and manage all platform users</p>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div class="card" *ngIf="!loading">
        <div class="filters">
          <div class="input-group">
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
                  <div class="avatar small" [ngClass]="{
                    'bg-patient': u.role === 'patient',
                    'bg-doctor': u.role === 'doctor',
                    'bg-admin': u.role === 'admin'
                  }">{{ u.first_name[0] }}{{ u.last_name[0] }}</div>
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
    </app-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 4px; }
    .page-header p { color: var(--text-light); font-size: 14px; }
    .filters { margin-bottom: 16px; }
    .filters .input-group { max-width: 200px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid var(--border); font-size: 13px; }
    .data-table th { font-weight: 600; color: var(--text-light); background: var(--bg); }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .avatar.small { width: 32px; height: 32px; font-size: 12px; }
    .bg-patient { background: #2563eb; }
    .bg-doctor { background: #16a34a; }
    .bg-admin { background: #f59e0b; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = true;
  filterRole = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.adminService.listUsers().subscribe({
      next: (res) => { this.users = res; this.filteredUsers = res; this.loading = false; },
      error: () => { this.loading = false; }
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
}
