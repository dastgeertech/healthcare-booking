import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { NotificationService } from '../../services/notification.service';
import { LayoutComponent } from '../../components/layout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>{{ getGreeting() }}</h1>
        <p>{{ getSubGreeting() }}</p>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div *ngIf="!loading">
        <!-- Stats -->
        <div class="stats-grid" *ngIf="stats">
          <div class="stat-card card">
            <div class="stat-icon" style="background: #dbeafe;">📅</div>
            <div>
              <div class="stat-value">{{ stats.total_appointments }}</div>
              <div class="stat-label">Total Appointments</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background: #fef3c7;">⏳</div>
            <div>
              <div class="stat-value">{{ stats.upcoming }}</div>
              <div class="stat-label">Upcoming</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background: #dcfce7;">✅</div>
            <div>
              <div class="stat-value">{{ stats.completed }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon" style="background: #f3e8ff;">💊</div>
            <div>
              <div class="stat-value">{{ auth.isDoctor() ? stats.prescriptions_written : stats.prescriptions }}</div>
              <div class="stat-label">{{ auth.isDoctor() ? 'Prescriptions Written' : 'Prescriptions' }}</div>
            </div>
          </div>
        </div>

        <!-- Patient Quick Actions -->
        <div class="quick-actions card" *ngIf="auth.isPatient()">
          <h3>Quick Actions</h3>
          <div class="actions-grid">
            <a routerLink="/hospitals" class="action-btn patient-action">
              <span class="action-icon">🏨</span>
              <span>Find Hospital</span>
            </a>
            <a routerLink="/doctors" class="action-btn patient-action">
              <span class="action-icon">👨‍⚕️</span>
              <span>Find a Doctor</span>
            </a>
            <a routerLink="/appointments" class="action-btn patient-action">
              <span class="action-icon">📅</span>
              <span>My Appointments</span>
            </a>
            <a routerLink="/prescriptions" class="action-btn patient-action">
              <span class="action-icon">💊</span>
              <span>Prescriptions</span>
            </a>
            <a routerLink="/medical-records" class="action-btn patient-action">
              <span class="action-icon">📋</span>
              <span>Medical Records</span>
            </a>
            <a routerLink="/profile" class="action-btn patient-action">
              <span class="action-icon">👤</span>
              <span>My Profile</span>
            </a>
          </div>
        </div>

        <!-- Doctor Quick Actions -->
        <div class="quick-actions card" *ngIf="auth.isDoctor()">
          <h3>Doctor Tools</h3>
          <div class="actions-grid">
            <a routerLink="/appointments" class="action-btn doctor-action">
              <span class="action-icon">📅</span>
              <span>Appointments</span>
            </a>
            <a routerLink="/patients" class="action-btn doctor-action">
              <span class="action-icon">🧑</span>
              <span>My Patients</span>
            </a>
            <a routerLink="/prescriptions" class="action-btn doctor-action">
              <span class="action-icon">💊</span>
              <span>Prescriptions</span>
            </a>
            <a routerLink="/medical-records" class="action-btn doctor-action">
              <span class="action-icon">📋</span>
              <span>Medical Records</span>
            </a>
          </div>
        </div>

        <!-- Admin Quick Actions -->
        <div class="quick-actions card" *ngIf="auth.isAdmin()">
          <h3>Admin Tools</h3>
          <div class="actions-grid">
            <a routerLink="/admin" class="action-btn admin-action">
              <span class="action-icon">📊</span>
              <span>Platform Stats</span>
            </a>
            <a routerLink="/admin/hospitals" class="action-btn admin-action">
              <span class="action-icon">🏨</span>
              <span>Manage Hospitals</span>
            </a>
            <a routerLink="/admin/users" class="action-btn admin-action">
              <span class="action-icon">👥</span>
              <span>Manage Users</span>
            </a>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="activity card" *ngIf="recentAppointments.length > 0">
          <h3>Recent Appointments</h3>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let apt of recentAppointments">
              <div class="activity-icon" [ngClass]="{
                'icon-pending': apt.status === 'pending',
                'icon-confirmed': apt.status === 'confirmed',
                'icon-completed': apt.status === 'completed',
                'icon-cancelled': apt.status === 'cancelled'
              }">
                {{ apt.status === 'completed' ? '✅' : apt.status === 'cancelled' ? '❌' : apt.status === 'confirmed' ? '🟢' : '🟡' }}
              </div>
              <div class="activity-content">
                <strong>{{ auth.isDoctor() ? (apt.patient_name || 'Patient') : apt.doctor_name }}</strong>
                <p>{{ apt.appointment_date }} at {{ apt.appointment_time }} · {{ apt.type }}</p>
              </div>
              <span class="badge" [ngClass]="{
                'badge-warning': apt.status === 'pending',
                'badge-success': apt.status === 'confirmed' || apt.status === 'completed',
                'badge-danger': apt.status === 'cancelled'
              }">{{ apt.status | titlecase }}</span>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="notifications card" *ngIf="notifications.length > 0">
          <div class="section-header">
            <h3>Recent Notifications</h3>
            <a routerLink="/notifications" class="link">View All</a>
          </div>
          <div class="notif-list">
            <div class="notif-item" *ngFor="let n of notifications" [class.unread]="!n.is_read">
              <span class="notif-icon">{{ n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : 'ℹ️' }}</span>
              <div class="notif-content">
                <strong>{{ n.title }}</strong>
                <p>{{ n.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 4px; }
    .page-header p { color: var(--text-light); font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { display: flex; align-items: center; gap: 16px; }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { font-size: 13px; color: var(--text-light); }
    .quick-actions { margin-bottom: 24px; }
    .quick-actions h3 { margin-bottom: 16px; }
    .actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .action-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; border: 1px solid var(--border); border-radius: 12px; text-decoration: none; color: var(--text); transition: all 0.2s; }
    .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .patient-action:hover { border-color: #2563eb; background: #eff6ff; }
    .doctor-action:hover { border-color: #16a34a; background: #f0fdf4; }
    .admin-action:hover { border-color: #f59e0b; background: #fffbeb; }
    .action-icon { font-size: 32px; }
    .activity, .notifications { margin-bottom: 24px; }
    .activity h3, .notifications h3 { margin-bottom: 16px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h3 { margin: 0; }
    .link { color: var(--primary); text-decoration: none; font-size: 13px; font-weight: 500; }
    .activity-list { display: flex; flex-direction: column; gap: 10px; }
    .activity-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px; background: var(--bg); }
    .activity-icon { font-size: 20px; }
    .activity-content { flex: 1; }
    .activity-content strong { font-size: 14px; }
    .activity-content p { font-size: 12px; color: var(--text-light); margin: 2px 0 0; }
    .notif-list { display: flex; flex-direction: column; gap: 8px; }
    .notif-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px; border-radius: 8px; }
    .notif-item.unread { background: #f0f7ff; }
    .notif-icon { font-size: 18px; }
    .notif-content strong { font-size: 13px; display: block; }
    .notif-content p { font-size: 12px; color: var(--text-light); margin: 2px 0 0; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = null;
  recentAppointments: any[] = [];
  notifications: any[] = [];
  loading = true;

  constructor(
    public auth: AuthService,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/login']); return; }
    this.loadDashboard();
  }

  getGreeting() {
    const role = this.auth.currentUser()?.role;
    const name = this.auth.currentUser()?.first_name;
    if (role === 'admin') return `Admin Dashboard`;
    if (role === 'doctor') return `Dr. ${name}'s Dashboard`;
    return `Welcome back, ${name}!`;
  }

  getSubGreeting() {
    const role = this.auth.currentUser()?.role;
    if (role === 'admin') return 'Platform overview and management';
    if (role === 'doctor') return 'Manage your patients and appointments';
    return 'What would you like to do today?';
  }

  loadDashboard() {
    this.loading = true;
    const req = this.auth.isDoctor() ? this.appointmentService.getDoctorDashboard() : this.appointmentService.getDashboard();
    req.subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.appointmentService.list().subscribe({
      next: (res) => { this.recentAppointments = (res || []).slice(0, 5); },
      error: () => {}
    });

    this.notificationService.list().subscribe({
      next: (res) => { this.notifications = (res.notifications || []).slice(0, 3); },
      error: () => {}
    });
  }
}
