import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <nav class="sidebar">
        <div class="sidebar-header">
          <span class="logo-icon">🏥</span>
          <span class="logo-text">HealthCare Plus</span>
        </div>
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">📊 Dashboard</a>
          <a routerLink="/notifications" routerLinkActive="active" class="nav-link">
            🔔 Notifications
            <span class="badge-count" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </a>

          <ng-container *ngIf="role === 'patient'">
            <a routerLink="/hospitals" routerLinkActive="active" class="nav-link">🏨 Hospitals</a>
            <a routerLink="/doctors" routerLinkActive="active" class="nav-link">👨‍⚕️ Find Doctors</a>
            <a routerLink="/appointments" routerLinkActive="active" class="nav-link">📅 My Appointments</a>
            <a routerLink="/prescriptions" routerLinkActive="active" class="nav-link">💊 Prescriptions</a>
            <a routerLink="/medical-records" routerLinkActive="active" class="nav-link">📋 Medical Records</a>
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">👤 My Profile</a>
          </ng-container>

          <ng-container *ngIf="role === 'doctor'">
            <a routerLink="/appointments" routerLinkActive="active" class="nav-link">📅 Appointments</a>
            <a routerLink="/patients" routerLinkActive="active" class="nav-link">🧑 My Patients</a>
            <a routerLink="/prescriptions" routerLinkActive="active" class="nav-link">💊 Prescriptions</a>
            <a routerLink="/medical-records" routerLinkActive="active" class="nav-link">📋 Medical Records</a>
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">👤 My Profile</a>
          </ng-container>

          <ng-container *ngIf="role === 'admin'">
            <div class="nav-divider">Admin Panel</div>
            <a routerLink="/admin" routerLinkActive="active" class="nav-link">📊 Overview</a>
            <a routerLink="/admin/hospitals" routerLinkActive="active" class="nav-link">🏨 Hospitals</a>
            <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">👥 Users</a>
          </ng-container>
        </div>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="avatar" [style.background]="getAvatarColor()">{{ getInitials() }}</div>
            <div>
              <div class="user-name">{{ userName }}</div>
              <div class="user-role">{{ role | titlecase }}</div>
            </div>
          </div>
          <button class="btn btn-sm btn-secondary" (click)="logout()">Logout</button>
        </div>
      </nav>
      <main class="main-content">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .sidebar { width: 260px; background: white; border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; height: 100vh; }
    .sidebar-header { padding: 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); }
    .sidebar-header .logo-icon { font-size: 28px; }
    .sidebar-header .logo-text { font-size: 18px; font-weight: 700; color: var(--primary); }
    .nav-links { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
    .nav-link { padding: 10px 16px; border-radius: 8px; text-decoration: none; color: var(--text); font-size: 14px; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
    .nav-link:hover { background: var(--bg); }
    .nav-link.active { background: #eff6ff; color: var(--primary); font-weight: 500; }
    .nav-divider { font-size: 11px; text-transform: uppercase; color: var(--text-light); padding: 12px 16px 4px; font-weight: 600; letter-spacing: 0.5px; }
    .badge-count { background: var(--danger); color: white; font-size: 11px; padding: 2px 6px; border-radius: 10px; margin-left: auto; }
    .sidebar-footer { padding: 16px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .user-info { display: flex; align-items: center; gap: 10px; }
    .user-name { font-size: 13px; font-weight: 600; }
    .user-role { font-size: 11px; color: var(--text-light); }
    .main-content { flex: 1; margin-left: 260px; padding: 32px; }
  `]
})
export class LayoutComponent implements OnInit {
  unreadCount = 0;
  role = '';
  userName = '';

  constructor(public auth: AuthService, private notificationService: NotificationService, private router: Router) {}

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.role = this.auth.currentUser()?.role || '';
    this.userName = this.auth.currentUser() ? `${this.auth.currentUser()!.first_name} ${this.auth.currentUser()!.last_name}` : '';
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => this.unreadCount = res.count,
      error: () => {}
    });
  }

  getInitials() {
    const u = this.auth.currentUser();
    return u ? u.first_name[0] + u.last_name[0] : '?';
  }

  getAvatarColor() {
    if (this.role === 'admin') return '#f59e0b';
    if (this.role === 'doctor') return '#16a34a';
    return '#2563eb';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
