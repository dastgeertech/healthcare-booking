import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DoctorService } from '../../services/doctor.service';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { LayoutComponent } from '../../components/layout.component';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LayoutComponent],
  template: `
    <app-layout>
      <div class="loading-spinner" *ngIf="!doctor"></div>

      <div *ngIf="doctor" class="doctor-detail">
        <div class="detail-header card">
          <div class="doctor-profile">
            <div class="avatar large" style="background: var(--primary);">{{ doctor.first_name[0] }}{{ doctor.last_name[0] }}</div>
            <div>
              <h1>Dr. {{ doctor.first_name }} {{ doctor.last_name }}</h1>
              <p class="specialty">{{ doctor.specialty }}</p>
              <div class="meta">
                <span class="star-rating">★ {{ doctor.rating }}/5</span>
                <span>•</span>
                <span>{{ doctor.total_ratings }} reviews</span>
                <span>•</span>
                <span>{{ doctor.experience_years }} years experience</span>
              </div>
            </div>
          </div>
          <div class="fee">\${{ doctor.consultation_fee }} <span>per consultation</span></div>
        </div>

        <div class="detail-body">
          <div class="info-section card">
            <h3>About</h3>
            <p>{{ doctor.bio }}</p>
          </div>

          <div class="booking-section card">
            <h3>Book Appointment</h3>
            <div class="booking-form">
              <div class="input-group">
                <label>Select Date</label>
                <input type="date" [(ngModel)]="selectedDate" (change)="loadSlots()" [min]="minDate">
              </div>

              <div class="slots" *ngIf="slots.length > 0">
                <label>Available Slots</label>
                <div class="slots-grid">
                  <button *ngFor="let slot of slots"
                    class="slot-btn"
                    [class.available]="slot.available"
                    [class.selected]="selectedTime === slot.time"
                    [disabled]="!slot.available"
                    (click)="selectedTime = slot.time">
                    {{ slot.time }}
                  </button>
                </div>
              </div>

              <div class="input-group">
                <label>Appointment Type</label>
                <select [(ngModel)]="appointmentType">
                  <option value="in_person">In-Person</option>
                  <option value="video">Video Call</option>
                  <option value="phone">Phone</option>
                </select>
              </div>

              <div class="input-group">
                <label>Reason for Visit</label>
                <textarea [(ngModel)]="reason" rows="3" placeholder="Describe your symptoms or reason..."></textarea>
              </div>

              <div class="error" *ngIf="error">{{ error }}</div>
              <div class="success" *ngIf="success">{{ success }}</div>

              <button class="btn btn-primary full-width" (click)="bookAppointment()" [disabled]="!selectedDate || !selectedTime || booking">
                {{ booking ? 'Booking...' : 'Book Appointment' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .doctor-profile { display: flex; align-items: center; gap: 20px; }
    .doctor-profile h1 { font-size: 22px; margin-bottom: 4px; }
    .doctor-profile .specialty { color: var(--primary); font-weight: 500; }
    .meta { display: flex; gap: 8px; font-size: 14px; color: var(--text-light); margin-top: 4px; }
    .fee { font-size: 28px; font-weight: 700; color: var(--primary); }
    .fee span { font-size: 13px; font-weight: 400; color: var(--text-light); display: block; }
    .detail-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .info-section p { color: var(--text-light); line-height: 1.6; margin-top: 12px; }
    .booking-form { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
    .slots-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px; }
    .slot-btn { padding: 8px; border: 1px solid var(--border); border-radius: 6px; background: white; cursor: pointer; font-size: 13px; }
    .slot-btn.available { border-color: var(--success); color: var(--success); }
    .slot-btn.available:hover { background: #dcfce7; }
    .slot-btn.selected { background: var(--primary); color: white; border-color: var(--primary); }
    .slot-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .full-width { width: 100%; justify-content: center; }
    .error { color: var(--danger); font-size: 13px; text-align: center; }
    .success { color: var(--success); font-size: 13px; text-align: center; }
    .avatar.large { width: 80px; height: 80px; font-size: 28px; }
  `]
})
export class DoctorDetailComponent implements OnInit {
  doctor: any = null;
  slots: any[] = [];
  selectedDate = '';
  selectedTime = '';
  appointmentType = 'in_person';
  reason = '';
  minDate = '';
  booking = false;
  error = '';
  success = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    public auth: AuthService,
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.doctorService.getDoctor(id).subscribe(res => this.doctor = res);
  }

  loadSlots() {
    if (!this.selectedDate || !this.doctor) return;
    this.doctorService.getSlots(this.doctor.id, this.selectedDate).subscribe({
      next: (res) => { this.slots = res.slots; this.selectedTime = ''; },
      error: () => { this.slots = []; }
    });
  }

  bookAppointment() {
    if (!this.selectedDate || !this.selectedTime) return;
    this.booking = true;
    this.error = '';
    this.success = '';

    this.appointmentService.book({
      doctor_id: this.doctor.id,
      appointment_date: this.selectedDate,
      appointment_time: this.selectedTime + ':00',
      type: this.appointmentType,
      reason: this.reason,
    }).subscribe({
      next: () => {
        this.success = 'Appointment booked successfully!';
        this.booking = false;
        setTimeout(() => this.router.navigate(['/appointments']), 1500);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Failed to book appointment';
        this.booking = false;
      }
    });
  }
}
