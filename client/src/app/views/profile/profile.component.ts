import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div class="profile-grid">
        <div class="card profile-card">
          <div class="profile-header">
            <div class="avatar large" [style.background]="getAvatarColor()">
              {{ getInitials() }}
            </div>
            <div>
              <h2>{{ user?.first_name }} {{ user?.last_name }}</h2>
              <p class="role-badge">{{ user?.role | titlecase }}</p>
            </div>
          </div>
          <div class="profile-details">
            <div class="detail-row">
              <span class="label">Email</span>
              <span>{{ user?.email }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone</span>
              <span>{{ user?.phone || 'Not set' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status</span>
              <span class="badge" [ngClass]="user?.is_active ? 'badge-success' : 'badge-danger'">
                {{ user?.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>

        <div class="card form-card">
          <h3>Update Profile</h3>
          <form (ngSubmit)="updateProfile()">
            <div class="input-group">
              <label>First Name</label>
              <input type="text" [(ngModel)]="form.first_name" name="first_name">
            </div>
            <div class="input-group">
              <label>Last Name</label>
              <input type="text" [(ngModel)]="form.last_name" name="last_name">
            </div>
            <div class="input-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="form.phone" name="phone">
            </div>
            <div class="success" *ngIf="success">{{ success }}</div>
            <div class="error" *ngIf="error">{{ error }}</div>
            <button class="btn btn-primary" type="submit" [disabled]="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </form>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 24px; margin-bottom: 4px; }
    .page-header p { color: var(--text-light); font-size: 14px; }
    .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
    .profile-header h2 { font-size: 20px; }
    .role-badge { color: var(--primary); font-weight: 500; font-size: 14px; }
    .avatar.large { width: 80px; height: 80px; font-size: 28px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .detail-row:last-child { border-bottom: none; }
    .detail-row .label { font-weight: 500; color: var(--text-light); font-size: 14px; }
    .form-card h3 { margin-bottom: 20px; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .success { color: var(--success); font-size: 13px; text-align: center; }
    .error { color: var(--danger); font-size: 13px; text-align: center; }
  `]
})
export class ProfileComponent implements OnInit {
  user: any = null;
  form = { first_name: '', last_name: '', phone: '' };
  saving = false;
  success = '';
  error = '';

  constructor(public auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.currentUser();
    if (this.user) {
      this.form = {
        first_name: this.user.first_name,
        last_name: this.user.last_name,
        phone: this.user.phone || '',
      };
    }
  }

  getInitials() {
    return this.user ? this.user.first_name[0] + this.user.last_name[0] : '?';
  }

  getAvatarColor() {
    const role = this.user?.role;
    if (role === 'admin') return '#f59e0b';
    if (role === 'doctor') return '#16a34a';
    return '#2563eb';
  }

  updateProfile() {
    this.saving = true;
    this.success = '';
    this.error = '';
    // In a real app, this would call an API
    setTimeout(() => {
      this.user = { ...this.user, ...this.form };
      localStorage.setItem('user', JSON.stringify(this.user));
      this.success = 'Profile updated successfully!';
      this.saving = false;
    }, 500);
  }
}
