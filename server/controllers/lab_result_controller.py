from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from config.auth import get_current_user
from models.user import User, UserRole
from models.lab_result import LabResult
from models.doctor import Doctor
from schemas import LabResultCreate, LabResultResponse
from typing import List

router = APIRouter(prefix="/api/lab-results", tags=["lab-results"])


def generate_lab_id(db: Session) -> str:
    count = db.query(LabResult).count()
    return f"LAB-{str(count + 1).zfill(8)}"


@router.get("/patient")
def list_patient_lab_results(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Patient access only")

    results = db.query(LabResult).filter(
        LabResult.patient_id == user.id,
        LabResult.is_active == True,
    ).order_by(LabResult.created_at.desc()).all()

    return {"results": [LabResultResponse.model_validate(r).model_dump() for r in results]}


@router.get("/doctor")
def list_doctor_lab_results(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access only")

    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    results = db.query(LabResult).filter(
        LabResult.doctor_id == doctor.id,
        LabResult.is_active == True,
    ).order_by(LabResult.created_at.desc()).all()

    return {"results": [LabResultResponse.model_validate(r).model_dump() for r in results]}


@router.post("/", response_model=LabResultResponse)
def create_lab_result(
    req: LabResultCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Doctor access only")

    doctor = db.query(Doctor).filter(Doctor.user_id == user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    result = LabResult(
        lab_result_id=generate_lab_id(db),
        patient_id=req.patient_id,
        doctor_id=doctor.id,
        hospital_id=req.hospital_id,
        appointment_id=req.appointment_id,
        test_name=req.test_name,
        test_type=req.test_type,
        category=req.category,
        results=req.results,
        summary=req.summary,
        interpretation=req.interpretation,
        is_abnormal=req.is_abnormal,
        priority=req.priority,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return LabResultResponse.model_validate(result)
