from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from config.auth import get_current_user
from models.user import User, UserRole
from models.insurance import Insurance
from schemas import InsuranceCreate, InsuranceResponse
from typing import List

router = APIRouter(prefix="/api/insurance", tags=["insurance"])


@router.get("/patient")
def list_patient_insurance(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Patient access only")

    policies = db.query(Insurance).filter(
        Insurance.patient_id == user.id,
        Insurance.is_active == True,
    ).order_by(Insurance.created_at.desc()).all()

    return {"policies": [InsuranceResponse.model_validate(p).model_dump() for p in policies]}


@router.post("/", response_model=InsuranceResponse)
def add_insurance(
    req: InsuranceCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Patient access only")

    policy = Insurance(
        patient_id=user.id,
        provider=req.provider,
        policy_number=req.policy_number,
        group_number=req.group_number,
        member_id=req.member_id,
        phone=req.phone,
        expiry_date=req.expiry_date,
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return InsuranceResponse.model_validate(policy)


@router.put("/{insurance_id}")
def update_insurance(
    insurance_id: int,
    provider: str = None,
    policy_number: str = None,
    group_number: str = None,
    member_id: str = None,
    phone: str = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Patient access only")

    policy = db.query(Insurance).filter(
        Insurance.id == insurance_id,
        Insurance.patient_id == user.id,
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Insurance not found")

    if provider: policy.provider = provider
    if policy_number: policy.policy_number = policy_number
    if group_number: policy.group_number = group_number
    if member_id: policy.member_id = member_id
    if phone: policy.phone = phone

    db.commit()
    db.refresh(policy)
    return InsuranceResponse.model_validate(policy)


@router.delete("/{insurance_id}")
def delete_insurance(
    insurance_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.PATIENT:
        raise HTTPException(status_code=403, detail="Patient access only")

    policy = db.query(Insurance).filter(
        Insurance.id == insurance_id,
        Insurance.patient_id == user.id,
    ).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Insurance not found")

    policy.is_active = False
    db.commit()
    return {"message": "Insurance removed"}
