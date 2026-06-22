import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="logo">🏥</div>
          <h1>Create Account</h1>
          <p>Join HealthCare Plus</p>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="row">
            <div class="input-group">
              <label>First Name</label>
              <input type="text" [(ngModel)]="form.first_name" name="first_name" required>
            </div>
            <div class="input-group">
              <label>Last Name</label>
              <input type="text" [(ngModel)]="form.last_name" name="last_name" required>
            </div>
          </div>
          <div class="input-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="form.email" name="email" required>
          </div>
          <div class="input-group">
            <label>Phone</label>
            <input type="tel" [(ngModel)]="form.phone" name="phone">
          </div>
          <div class="input-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="form.password" name="password" required>
          </div>
          <div class="input-group">
            <label>Account Type</label>
            <select [(ngModel)]="form.role" name="role">
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button class="btn btn-primary full-width" type="submit" [disabled]="loading">
            {{ loading ? 'Creating...' : 'Create Account' }}
          </button>
        </form>
        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .auth-card { width: 100%; max-width: 480px; padding: 40px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-header .logo { font-size: 48px; margin-bottom: 8px; }
    .auth-header h1 { font-size: 24px; margin-bottom: 4px; }
    .auth-header p { color: var(--text-light); font-size: 14px; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .full-width { width: 100%; justify-content: center; }
    .error { color: var(--danger); font-size: 13px; text-align: center; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-light); }
    .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 500; }
  `]
})
export class RegisterComponent {
  form = { first_name: '', last_name: '', email: '', phone: '', password: '', role: 'patient' };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.auth.register(this.form).subscribe({
      next: () => { this.router.navigate(['/dashboard']); this.loading = false; },
      error: (err) => { this.error = err.error?.detail || 'Registration failed'; this.loading = false; }
    });
  }
}
