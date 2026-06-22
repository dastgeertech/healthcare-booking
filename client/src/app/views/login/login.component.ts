import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="logo">🏥</div>
          <h1>HealthCare Plus</h1>
          <p>Sign in to your account</p>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="input-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" required>
          </div>
          <div class="input-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required>
          </div>
          <div class="error" *ngIf="error">{{ error }}</div>
          <button class="btn btn-primary full-width" type="submit" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Register</a>
        </div>
        <div class="demo-accounts">
          <p><strong>Demo Accounts (click to auto-fill):</strong></p>
          <div class="demo-buttons">
            <button class="btn btn-sm btn-demo btn-patient" (click)="fillDemo('patient1@example.com', 'password123')">
              <span class="demo-icon">🧑</span>
              <div>
                <strong>Patient</strong>
                <small>patient1&#64;example.com</small>
              </div>
            </button>
            <button class="btn btn-sm btn-demo btn-doctor" (click)="fillDemo('dr.smith@healthcare.com', 'password123')">
              <span class="demo-icon">👨‍⚕️</span>
              <div>
                <strong>Doctor</strong>
                <small>dr.smith&#64;healthcare.com</small>
              </div>
            </button>
            <button class="btn btn-sm btn-demo btn-admin" (click)="fillDemo('admin@healthcare.com', 'admin123')">
              <span class="demo-icon">👑</span>
              <div>
                <strong>Admin</strong>
                <small>admin&#64;healthcare.com</small>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .auth-card { width: 100%; max-width: 440px; padding: 40px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-header .logo { font-size: 48px; margin-bottom: 8px; }
    .auth-header h1 { font-size: 24px; margin-bottom: 4px; }
    .auth-header p { color: var(--text-light); font-size: 14px; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .full-width { width: 100%; justify-content: center; }
    .error { color: var(--danger); font-size: 13px; text-align: center; }
    .auth-footer { text-align: center; margin-top: 20px; font-size: 14px; color: var(--text-light); }
    .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 500; }
    .demo-accounts { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
    .demo-accounts > p { font-size: 12px; color: var(--text-light); margin-bottom: 12px; text-align: center; }
    .demo-buttons { display: flex; flex-direction: column; gap: 8px; }
    .btn-demo { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid var(--border); background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s; text-align: left; width: 100%; }
    .btn-demo:hover { border-color: var(--primary); background: #f8fafc; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .demo-icon { font-size: 24px; }
    .btn-demo strong { font-size: 13px; display: block; }
    .btn-demo small { font-size: 11px; color: var(--text-light); }
    .btn-patient:hover { border-color: #2563eb; }
    .btn-doctor:hover { border-color: #16a34a; }
    .btn-admin:hover { border-color: #f59e0b; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) {
      this.redirectByRole();
    }
  }

  fillDemo(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.redirectByRole();
      },
      error: (err) => { this.error = err.error?.detail || 'Login failed'; this.loading = false; }
    });
  }

  private redirectByRole() {
    const role = this.auth.currentUser()?.role;
    if (role === 'admin') this.router.navigate(['/admin']);
    else if (role === 'doctor') this.router.navigate(['/dashboard']);
    else this.router.navigate(['/dashboard']);
  }
}
