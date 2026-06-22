# Healthcare Booking System

A full-featured doctor appointment platform with telemedicine, prescriptions, and patient records management.

## Tech Stack

- **Frontend:** Angular 17, TypeScript, SCSS
- **Backend:** Python, FastAPI, SQLAlchemy, Alembic
- **Database:** PostgreSQL
- **Video Calls:** Twilio Video
- **SMS Notifications:** Twilio SMS
- **File Storage:** AWS S3
- **Infrastructure:** Docker Compose

## Quick Start

### With Docker

```bash
docker-compose up
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:3003
- PostgreSQL: localhost:5432

### Manual Setup

**Backend:**
```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python seed.py
python -m uvicorn main:app --reload --port 3003
```

**Frontend:**
```bash
cd client
npm install
ng serve --port 4200
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin&#64;healthcare.com | admin123 |
| Patient | patient1&#64;example.com | password123 |
| Doctor | dr.smith&#64;healthcare.com | password123 |

## Features

- Patient registration and authentication
- Doctor search with specialty, rating, and fee filters
- Available time slot detection
- Appointment booking (in-person, video, phone)
- Appointment status management (pending → confirmed → completed)
- Doctor profiles with ratings and availability
- Medical prescriptions with diagnoses and medications
- Patient dashboard with appointment stats
- Doctor dashboard with patient overview
- Admin panel with system-wide statistics

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register patient |
| POST | /api/auth/register-doctor | Register doctor |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/doctors/ | List/search doctors |
| GET | /api/doctors/:id | Get doctor details |
| GET | /api/doctors/:id/slots | Get available slots |
| POST | /api/appointments/ | Book appointment |
| GET | /api/appointments/ | List appointments |
| PUT | /api/appointments/:id/status | Update status |
| POST | /api/appointments/:id/prescription | Add prescription |
| GET | /api/appointments/prescriptions | List prescriptions |
| GET | /api/dashboard/patient | Patient dashboard |
| GET | /api/dashboard/doctor | Doctor dashboard |
| GET | /api/admin/stats | Admin statistics |

## Database Schema

- **users** — id, email, password_hash, first_name, last_name, phone, role, is_active
- **doctors** — id, user_id, specialty, license_number, bio, fee, rating, availability
- **appointments** — id, patient_id, doctor_id, date, time, type, status, reason
- **prescriptions** — id, appointment_id, patient_id, doctor_id, diagnosis, medications
