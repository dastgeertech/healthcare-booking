from config.database import SessionLocal, engine, Base
from models.user import User, UserRole
from models.doctor import Doctor
from models.appointment import Appointment, AppointmentStatus, AppointmentType
from models.prescription import Prescription
from models.hospital import Hospital, Department
from config.auth import hash_password
from datetime import date, time, timedelta

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(User).count() > 0:
        print("Database already seeded, skipping.")
        db.close()
        return

    print("Seeding database...")

    # Admin
    admin = User(
        email="admin@healthcare.com",
        password_hash=hash_password("admin123"),
        first_name="Admin",
        last_name="User",
        phone="+1234567890",
        role=UserRole.ADMIN,
    )
    db.add(admin)
    db.flush()

    # Hospitals
    hospital1 = Hospital(
        name="City General Hospital",
        description="A leading healthcare facility providing comprehensive medical services.",
        email="info@citygeneral.com",
        phone="+1-555-0100",
        address_street="123 Medical Center Drive",
        address_city="New York",
        address_state="NY",
        address_zip="10001",
        emergency_services=True,
        insurance_accepted=["Blue Cross", "Aetna", "UnitedHealth", "Cigna"],
        is_verified=True,
        operating_hours={
            "monday": {"open": "08:00", "close": "20:00"},
            "tuesday": {"open": "08:00", "close": "20:00"},
            "wednesday": {"open": "08:00", "close": "20:00"},
            "thursday": {"open": "08:00", "close": "20:00"},
            "friday": {"open": "08:00", "close": "18:00"},
            "saturday": {"open": "09:00", "close": "14:00"},
        },
    )
    db.add(hospital1)
    db.flush()

    hospital2 = Hospital(
        name="Metro Health Center",
        description="Modern healthcare center with state-of-the-art facilities.",
        email="info@metrohealth.com",
        phone="+1-555-0200",
        address_street="456 Health Avenue",
        address_city="New York",
        address_state="NY",
        address_zip="10002",
        emergency_services=True,
        insurance_accepted=["Blue Cross", "Aetna", "Cigna"],
        is_verified=True,
        operating_hours={
            "monday": {"open": "07:00", "close": "21:00"},
            "tuesday": {"open": "07:00", "close": "21:00"},
            "wednesday": {"open": "07:00", "close": "21:00"},
            "thursday": {"open": "07:00", "close": "21:00"},
            "friday": {"open": "07:00", "close": "19:00"},
        },
    )
    db.add(hospital2)
    db.flush()

    # Departments
    departments_data = [
        (hospital1.id, "Cardiology", "Heart and cardiovascular system care", [
            {"name": "ECG", "duration": 30, "price": 150},
            {"name": "Echocardiogram", "duration": 45, "price": 300},
            {"name": "Cardiac Consultation", "duration": 30, "price": 200},
        ]),
        (hospital1.id, "Neurology", "Brain and nervous system care", [
            {"name": "EEG", "duration": 60, "price": 400},
            {"name": "Neurology Consultation", "duration": 45, "price": 250},
        ]),
        (hospital1.id, "Orthopedics", "Bone and joint care", [
            {"name": "X-Ray", "duration": 20, "price": 100},
            {"name": "Orthopedic Consultation", "duration": 30, "price": 180},
        ]),
        (hospital1.id, "Pediatrics", "Children healthcare", [
            {"name": "Well Child Visit", "duration": 30, "price": 120},
            {"name": "Vaccination", "duration": 15, "price": 50},
        ]),
        (hospital1.id, "General Practice", "General healthcare and wellness", [
            {"name": "General Checkup", "duration": 30, "price": 100},
            {"name": "Blood Test", "duration": 15, "price": 75},
        ]),
        (hospital2.id, "Dermatology", "Skin care and treatment", [
            {"name": "Skin Consultation", "duration": 30, "price": 120},
            {"name": "Mole Check", "duration": 20, "price": 80},
        ]),
        (hospital2.id, "ENT", "Ear, nose, and throat care", [
            {"name": "ENT Consultation", "duration": 30, "price": 130},
            {"name": "Hearing Test", "duration": 45, "price": 200},
        ]),
    ]

    for hosp_id, name, desc, services in departments_data:
        dept = Department(
            hospital_id=hosp_id,
            name=name,
            description=desc,
            services=services,
        )
        db.add(dept)

    # Patients
    patients_data = [
        ("patient1@example.com", "password123", "John", "Doe", "+1111111111"),
        ("patient2@example.com", "password123", "Jane", "Smith", "+2222222222"),
        ("patient3@example.com", "password123", "Mike", "Johnson", "+3333333333"),
        ("patient4@example.com", "password123", "Sarah", "Williams", "+4444444444"),
    ]
    patients = []
    for email, pw, first, last, phone in patients_data:
        p = User(
            email=email,
            password_hash=hash_password(pw),
            first_name=first,
            last_name=last,
            phone=phone,
            role=UserRole.PATIENT,
        )
        db.add(p)
        patients.append(p)

    db.flush()

    # Doctor users
    doctors_data = [
        ("dr.smith@healthcare.com", "password123", "Robert", "Smith", "+5555555555",
         "Cardiology", "MED-1001", "Board-certified cardiologist with 15 years of experience.", 15, 150),
        ("dr.jones@healthcare.com", "password123", "Emily", "Jones", "+6666666666",
         "Dermatology", "MED-1002", "Specializing in cosmetic and medical dermatology.", 8, 120),
        ("dr.wilson@healthcare.com", "password123", "David", "Wilson", "+7777777777",
         "General Practice", "MED-1003", "Comprehensive primary care for all ages.", 20, 100),
        ("dr.brown@healthcare.com", "password123", "Sarah", "Brown", "+8888888888",
         "Pediatrics", "MED-1004", "Dedicated to children's health and wellness.", 12, 130),
        ("dr.taylor@healthcare.com", "password123", "James", "Taylor", "+9999999999",
         "Orthopedics", "MED-1005", "Sports medicine and joint replacement specialist.", 18, 160),
    ]

    doctors = []
    for email, pw, first, last, phone, specialty, lic, bio, exp, fee in doctors_data:
        u = User(
            email=email,
            password_hash=hash_password(pw),
            first_name=first,
            last_name=last,
            phone=phone,
            role=UserRole.DOCTOR,
        )
        db.add(u)
        db.flush()
        d = Doctor(
            user_id=u.id,
            specialty=specialty,
            license_number=lic,
            bio=bio,
            experience_years=exp,
            consultation_fee=fee,
            rating=4 + (exp % 5),
            total_ratings=50 + exp * 10,
            is_verified=True,
            available_days=[0, 1, 2, 3, 4],
            available_hours_start="09:00",
            available_hours_end="17:00",
            slot_duration_minutes=30,
        )
        db.add(d)
        doctors.append(d)

    db.flush()

    # Sample appointments
    today = date.today()
    appointments_data = [
        (patients[0].id, doctors[0].id, today + timedelta(days=1), time(10, 0), AppointmentType.IN_PERSON, AppointmentStatus.CONFIRMED, "Chest pain consultation"),
        (patients[1].id, doctors[1].id, today + timedelta(days=1), time(14, 30), AppointmentType.VIDEO, AppointmentStatus.CONFIRMED, "Skin rash follow-up"),
        (patients[2].id, doctors[2].id, today + timedelta(days=2), time(9, 0), AppointmentType.IN_PERSON, AppointmentStatus.PENDING, "Annual checkup"),
        (patients[0].id, doctors[4].id, today + timedelta(days=3), time(11, 0), AppointmentType.IN_PERSON, AppointmentStatus.PENDING, "Knee pain evaluation"),
        (patients[3].id, doctors[3].id, today - timedelta(days=5), time(10, 0), AppointmentType.VIDEO, AppointmentStatus.COMPLETED, "Child vaccination"),
    ]

    for pid, did, adate, atime, atype, astatus, reason in appointments_data:
        a = Appointment(
            patient_id=pid,
            doctor_id=did,
            appointment_date=adate,
            appointment_time=atime,
            type=atype,
            status=astatus,
            reason=reason,
            consultation_fee=100,
        )
        db.add(a)

    db.commit()
    print("Database seeded successfully!")
    print("\nDemo Credentials:")
    print("  Admin: admin@healthcare.com / admin123")
    print("  Patient: patient1@example.com / password123")
    print("  Doctor: dr.smith@healthcare.com / password123")
    db.close()


if __name__ == "__main__":
    seed()
