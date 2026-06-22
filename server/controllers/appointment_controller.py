from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from config.database import get_db
from config.auth import get_current_user
from models.user import User, UserRole
from models.doctor import Doctor
from models.appointment import Appointment, AppointmentStatus, AppointmentType
from models.prescription import Prescription
from schemas import AppointmentCreate, AppointmentResponse, PrescriptionCreate, PrescriptionResponse
from typing import List, Any

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.post("/", response_model=AppointmentResponse)
def book_appointment(req: AppointmentCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == req.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    existing = db.query(Appointment).filter(
        Appointment.doctor_id == req.doctor_id,
        Appointment.appointment_date == req.appointment_date,
        Appointment.appointment_time == req.appointment_time,
        Appointment.status.in_([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")

    appointment = Appointment(
        patient_id=user.id,
        doctor_id=req.doctor_id,
        appointment_date=req.appointment_date,
        appointment_time=req.appointment_time,
        type=AppointmentType(req.type),
        reason=req.reason,
        consultation_fee=doctor.consultation_fee,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return AppointmentResponse(
        id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        type=appointment.type,
        status=appointment.status,
        reason=appointment.reason,
        notes=appointment.notes,
        consultation_fee=appointment.consultation_fee,
        doctor_name=f"Dr. {doctor.user.first_name} {doctor.user.last_name}",
        patient_name=f"{user.first_name} {user.last_name}",
        specialty=doctor.specialty,
        created_at=appointment.created_at,
    )


@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Appointment).options(
        joinedload(Appointment.doctor).joinedload(Doctor.user)
    )

    if user.role == UserRole.PATIENT:
        query = query.filter(Appointment.patient_id == user.id)
    elif user.role == UserRole.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
        if doctor:
            query = query.filter(Appointment.doctor_id == doctor.id)

    appointments = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).all()

    result = []
    for a in appointments:
        result.append(AppointmentResponse(
            id=a.id,
            patient_id=a.patient_id,
            doctor_id=a.doctor_id,
            appointment_date=a.appointment_date,
            appointment_time=a.appointment_time,
            type=a.type,
            status=a.status,
            reason=a.reason,
            notes=a.notes,
            consultation_fee=a.consultation_fee,
            doctor_name=f"Dr. {a.doctor.user.first_name} {a.doctor.user.last_name}",
            patient_name=None,
            specialty=a.doctor.specialty,
            created_at=a.created_at,
        ))
    return result


@router.put("/{appointment_id}/status")
def update_status(
    appointment_id: int,
    status: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = AppointmentStatus(status)
    db.commit()
    return {"message": "Status updated"}


@router.post("/{appointment_id}/prescription", response_model=PrescriptionResponse)
def add_prescription(
    appointment_id: int,
    req: PrescriptionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    prescription = Prescription(
        appointment_id=appointment_id,
        patient_id=req.patient_id,
        doctor_id=appointment.doctor_id,
        diagnosis=req.diagnosis,
        medications=req.medications,
        notes=req.notes,
        valid_until=req.valid_until,
    )
    db.add(prescription)
    db.commit()
    db.refresh(prescription)

    return PrescriptionResponse(
        id=prescription.id,
        appointment_id=prescription.appointment_id,
        patient_id=prescription.patient_id,
        doctor_id=prescription.doctor_id,
        diagnosis=prescription.diagnosis,
        medications=prescription.medications,
        notes=prescription.notes,
        valid_until=prescription.valid_until,
        created_at=prescription.created_at,
    )


@router.get("/prescriptions", response_model=List[PrescriptionResponse])
def list_prescriptions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Prescription)
    if user.role == UserRole.PATIENT:
        query = query.filter(Prescription.patient_id == user.id)
    elif user.role == UserRole.DOCTOR:
        doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
        if doctor:
            query = query.filter(Prescription.doctor_id == doctor.id)

    prescriptions = query.order_by(Prescription.created_at.desc()).all()
    return [PrescriptionResponse(
        id=p.id,
        appointment_id=p.appointment_id,
        patient_id=p.patient_id,
        doctor_id=p.doctor_id,
        diagnosis=p.diagnosis,
        medications=p.medications,
        notes=p.notes,
        valid_until=p.valid_until,
        created_at=p.created_at,
    ) for p in prescriptions]
