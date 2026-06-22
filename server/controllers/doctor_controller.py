from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from config.database import get_db
from config.auth import get_current_user, require_role
from models.doctor import Doctor
from models.user import User, UserRole
from schemas import DoctorResponse
from typing import Optional

router = APIRouter(prefix="/api/doctors", tags=["doctors"])


def doctor_to_response(doc: Doctor) -> dict:
    return DoctorResponse(
        id=doc.id,
        user_id=doc.user_id,
        first_name=doc.user.first_name,
        last_name=doc.user.last_name,
        email=doc.user.email,
        phone=doc.user.phone,
        specialty=doc.specialty,
        bio=doc.bio,
        experience_years=doc.experience_years,
        consultation_fee=doc.consultation_fee,
        rating=doc.rating,
        total_ratings=doc.total_ratings,
        is_verified=doc.is_verified,
        available_days=doc.available_days,
        available_hours_start=doc.available_hours_start,
        available_hours_end=doc.available_hours_end,
        slot_duration_minutes=doc.slot_duration_minutes,
    ).model_dump()


@router.get("/")
def list_doctors(
    specialty: Optional[str] = None,
    search: Optional[str] = None,
    min_fee: Optional[int] = None,
    max_fee: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.is_verified == True)

    if specialty:
        query = query.filter(Doctor.specialty.ilike(f"%{specialty}%"))
    if search:
        query = query.join(User).filter(
            (User.first_name.ilike(f"%{search}%")) | (User.last_name.ilike(f"%{search}%"))
        )
    if min_fee is not None:
        query = query.filter(Doctor.consultation_fee >= min_fee)
    if max_fee is not None:
        query = query.filter(Doctor.consultation_fee <= max_fee)

    total = query.count()
    doctors = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "doctors": [doctor_to_response(d) for d in doctors],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{doctor_id}")
def get_doctor(doctor_id: int, db: Session = Depends(get_db)):
    doc = db.query(Doctor).options(joinedload(Doctor.user)).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor_to_response(doc)


@router.get("/{doctor_id}/slots")
def get_available_slots(
    doctor_id: int,
    date: str = Query(...),
    db: Session = Depends(get_db),
):
    from datetime import datetime, timedelta

    doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found")

    target_date = datetime.strptime(date, "%Y-%m-%d").date()
    day_of_week = target_date.weekday()

    if day_of_week not in doc.available_days:
        return {"slots": [], "message": "Doctor not available on this day"}

    start_h, start_m = map(int, doc.available_hours_start.split(":"))
    end_h, end_m = map(int, doc.available_hours_end.split(":"))
    slot_duration = doc.slot_duration_minutes

    from models.appointment import Appointment, AppointmentStatus

    booked = db.query(Appointment).filter(
        Appointment.doctor_id == doctor_id,
        Appointment.appointment_date == target_date,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
    ).all()
    booked_times = {str(a.appointment_time) for a in booked}

    slots = []
    current = datetime(target_date.year, target_date.month, target_date.day, start_h, start_m)
    end = datetime(target_date.year, target_date.month, target_date.day, end_h, end_m)

    while current < end:
        time_str = current.strftime("%H:%M")
        slots.append({"time": time_str, "available": time_str not in booked_times})
        current += timedelta(minutes=slot_duration)

    return {"slots": slots}
