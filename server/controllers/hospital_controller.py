from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from config.database import get_db
from config.auth import get_current_user, require_role
from models.hospital import Hospital, Department
from models.user import User, UserRole
from schemas import HospitalResponse, DepartmentResponse
from typing import Optional, List

router = APIRouter(prefix="/api/hospitals", tags=["hospitals"])


@router.get("/")
def list_hospitals(
    search: Optional[str] = None,
    city: Optional[str] = None,
    emergency: Optional[bool] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Hospital).filter(Hospital.is_active == True)

    if search:
        query = query.filter(Hospital.name.ilike(f"%{search}%"))
    if city:
        query = query.filter(Hospital.address_city.ilike(f"%{city}%"))
    if emergency is not None:
        query = query.filter(Hospital.emergency_services == emergency)

    total = query.count()
    hospitals = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "hospitals": [HospitalResponse.model_validate(h).model_dump() for h in hospitals],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/{hospital_id}")
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    departments = db.query(Department).filter(
        Department.hospital_id == hospital_id,
        Department.is_active == True,
    ).all()

    return {
        "hospital": HospitalResponse.model_validate(hospital).model_dump(),
        "departments": [DepartmentResponse.model_validate(d).model_dump() for d in departments],
    }


@router.get("/{hospital_id}/departments")
def get_hospital_departments(hospital_id: int, db: Session = Depends(get_db)):
    departments = db.query(Department).filter(
        Department.hospital_id == hospital_id,
        Department.is_active == True,
    ).all()
    return {"departments": [DepartmentResponse.model_validate(d).model_dump() for d in departments]}


@router.post("/")
def create_hospital(
    name: str,
    description: str = None,
    email: str = None,
    phone: str = None,
    address_street: str = None,
    address_city: str = None,
    address_state: str = None,
    address_zip: str = None,
    emergency_services: bool = False,
    user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    hospital = Hospital(
        name=name,
        description=description,
        email=email,
        phone=phone,
        address_street=address_street,
        address_city=address_city,
        address_state=address_state,
        address_zip=address_zip,
        emergency_services=emergency_services,
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return {"hospital": HospitalResponse.model_validate(hospital).model_dump()}


@router.put("/{hospital_id}/verify")
def verify_hospital(
    hospital_id: int,
    user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    hospital.is_verified = True
    db.commit()
    return {"message": "Hospital verified"}
