from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from config.auth import get_current_user
from models.user import User, UserRole
from models.medical_record import MedicalRecord
from models.doctor import Doctor
from schemas import MedicalRecordCreate, MedicalRecordResponse
from typing import List

router = APIRouter(prefix="/api/medical-records", tags=["medical-records"])


def generate_record_id(db: Session) -> str:
    count = db.query(MedicalRecord).count()
    return f"MR-{str(count + 1).zfill(8)}"


@router.get("/patient")
def list_patient_records(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Patient access only")

    records = db.query(MedicalRecord).filter(
        MedicalRecord.patient_id == user.id,
        MedicalRecord.is_active == True,
    ).order_by(MedicalRecord.created_at.desc()).all()

    return {"records": [MedicalRecordResponse.model_validate(r).model_dump() for r in records]}


@router.get("/doctor")
def list_doctor_records(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access only")

    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    records = db.query(MedicalRecord).filter(
        MedicalRecord.doctor_id == doctor.id,
        MedicalRecord.is_active == True,
    ).order_by(MedicalRecord.created_at.desc()).all()

    return {"records": [MedicalRecordResponse.model_validate(r).model_dump() for r in records]}


@router.post("/", response_model=MedicalRecordResponse)
def create_medical_record(
    req: MedicalRecordCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access only")

    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    record = MedicalRecord(
        record_id=generate_record_id(db),
        patient_id=req.patient_id,
        doctor_id=doctor.id,
        hospital_id=req.hospital_id,
        appointment_id=req.appointment_id,
        type=req.type,
        title=req.title,
        description=req.description,
        diagnosis=req.diagnosis,
        symptoms=req.symptoms,
        vital_signs=req.vital_signs,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return MedicalRecordResponse.model_validate(record)
