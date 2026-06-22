import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./views/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./views/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./views/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'hospitals', loadComponent: () => import('./views/hospitals/hospitals.component').then(m => m.HospitalsComponent) },
  { path: 'hospitals/:id', loadComponent: () => import('./views/hospital-detail/hospital-detail.component').then(m => m.HospitalDetailComponent) },
  { path: 'doctors', loadComponent: () => import('./views/doctors/doctors.component').then(m => m.DoctorsComponent) },
  { path: 'doctors/:id', loadComponent: () => import('./views/doctor-detail/doctor-detail.component').then(m => m.DoctorDetailComponent) },
  { path: 'appointments', loadComponent: () => import('./views/appointments/appointments.component').then(m => m.AppointmentsComponent) },
  { path: 'prescriptions', loadComponent: () => import('./views/prescriptions/prescriptions.component').then(m => m.PrescriptionsComponent) },
  { path: 'medical-records', loadComponent: () => import('./views/medical-records/medical-records.component').then(m => m.MedicalRecordsComponent) },
  { path: 'notifications', loadComponent: () => import('./views/notifications/notifications.component').then(m => m.NotificationsComponent) },
  { path: 'profile', loadComponent: () => import('./views/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'patients', loadComponent: () => import('./views/patients/patients.component').then(m => m.PatientsComponent) },
  { path: 'admin', loadComponent: () => import('./views/admin/admin.component').then(m => m.AdminComponent) },
  { path: 'admin/hospitals', loadComponent: () => import('./views/admin/admin.component').then(m => m.AdminComponent) },
  { path: 'admin/users', loadComponent: () => import('./views/admin-users/admin-users.component').then(m => m.AdminUsersComponent) },
  { path: '**', redirectTo: '/login' },
];
