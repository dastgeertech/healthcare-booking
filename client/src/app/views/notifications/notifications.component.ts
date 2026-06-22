import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../../components/layout.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>Notifications</h1>
        <button class="btn btn-sm btn-secondary" (click)="markAllRead()" *ngIf="unreadCount > 0">Mark all as read</button>
      </div>

      <div class="loading-spinner" *ngIf="loading"></div>

      <div class="notifications-list" *ngIf="!loading">
        <div class="notification-card card" *ngFor="let n of notifications"
          [class.unread]="!n.is_read" (click)="markRead(n)">
          <div class="notif-icon" [ngClass]="{
            'icon-info': n.type === 'info',
            'icon-success': n.type === 'success',
            'icon-warning': n.type === 'warning',
            'icon-error': n.type === 'error'
          }">
            {{ n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'error' ? '❌' : 'ℹ️' }}
          </div>
          <div class="notif-content">
            <h4>{{ n.title }}</h4>
            <p>{{ n.message }}</p>
            <span class="time">{{ n.created_at | date:'medium' }}</span>
          </div>
          <div class="unread-dot" *ngIf="!n.is_read"></div>
        </div>

        <div class="empty-state" *ngIf="notifications.length === 0">
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; }
    .notifications-list { display: flex; flex-direction: column; gap: 8px; }
    .notification-card { display: flex; align-items: flex-start; gap: 14px; cursor: pointer; transition: all 0.2s; }
    .notification-card.unread { background: #f0f7ff; border-left: 3px solid var(--primary); }
    .notif-icon { font-size: 20px; min-width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
    .notif-content { flex: 1; }
    .notif-content h4 { font-size: 14px; margin-bottom: 2px; }
    .notif-content p { font-size: 13px; color: var(--text-light); }
    .time { font-size: 11px; color: var(--text-light); }
    .unread-dot { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; margin-top: 6px; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  unreadCount = 0;
  loading = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() { this.loadNotifications(); }

  loadNotifications() {
    this.notificationService.list().subscribe({
      next: (res) => {
        this.notifications = res.notifications;
        this.unreadCount = res.unread_count;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  markRead(n: any) {
    if (!n.is_read) {
      this.notificationService.markAsRead(n.id).subscribe({
        next: () => { n.is_read = true; this.unreadCount = Math.max(0, this.unreadCount - 1); }
      });
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.is_read = true);
        this.unreadCount = 0;
      }
    });
  }
}
