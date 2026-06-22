from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from config.auth import get_current_user
from models.user import User, UserRole
from models.doctor import Doctor
from models.appointment import Appointment, AppointmentStatus
from schemas import UserResponse
from typing import List

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/patient")
def patient_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Patient access only")

    total = db.query(Appointment).filter(Appointment.patient_id == user.id).count()
    upcoming = db.query(Appointment).filter(
        Appointment.patient_id == user.id,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
    ).count()
    completed = db.query(Appointment).filter(
        Appointment.patient_id == user.id,
        Appointment.status == AppointmentStatus.COMPLETED,
    ).count()

    from models.prescription import Prescription
    prescriptions = db.query(Prescription).filter(Prescription.patient_id == user.id).count()

    return {
        "user": UserResponse.model_validate(user),
        "stats": {
            "total_appointments": total,
            "upcoming": upcoming,
            "completed": completed,
            "prescriptions": prescriptions,
        },
    }


@router.get("/doctor")
def doctor_dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access only")

    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    total = db.query(Appointment).filter(Appointment.doctor_id == doctor.id).count()
    today_appointments = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
    ).count()
    completed = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.status == AppointmentStatus.COMPLETED,
    ).count()

    from models.prescription import Prescription
    prescriptions_written = db.query(Prescription).filter(Prescription.doctor_id == doctor.id).count()

    return {
        "user": UserResponse.model_validate(user),
        "doctor": {
            "id": doctor.id,
            "specialty": doctor.specialty,
            "rating": doctor.rating,
            "total_ratings": doctor.total_ratings,
        },
        "stats": {
            "total_appointments": total,
            "upcoming": today_appointments,
            "completed": completed,
            "prescriptions_written": prescriptions_written,
        },
    }
