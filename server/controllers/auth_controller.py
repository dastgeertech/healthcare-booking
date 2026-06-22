from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from config.auth import hash_password, verify_password, create_token, get_current_user, require_role
from models.user import User, UserRole
from models.doctor import Doctor
from schemas import RegisterRequest, LoginRequest, UserResponse, TokenResponse, DoctorRegisterRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        first_name=req.first_name,
        last_name=req.last_name,
        phone=req.phone,
        role=UserRole(req.role),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if user.role == UserRole.DOCTOR:
        raise HTTPException(status_code=400, detail="Use /api/auth/register-doctor for doctors")

    return TokenResponse(access_token=create_token(user.id, user.role.value), user=UserResponse.model_validate(user))


@router.post("/register-doctor", response_model=TokenResponse)
def register_doctor(
    req: RegisterRequest,
    doctor_req: DoctorRegisterRequest,
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=req.email,
        password_hash=hash_password(req.password),
        first_name=req.first_name,
        last_name=req.last_name,
        phone=req.phone,
        role=UserRole.DOCTOR,
    )
    db.add(user)
    db.flush()

    doctor = Doctor(
        user_id=user.id,
        specialty=doctor_req.specialty,
        license_number=doctor_req.license_number,
        bio=doctor_req.bio,
        experience_years=doctor_req.experience_years,
        consultation_fee=doctor_req.consultation_fee,
        available_days=doctor_req.available_days,
        available_hours_start=doctor_req.available_hours_start,
        available_hours_end=doctor_req.available_hours_end,
        slot_duration_minutes=doctor_req.slot_duration_minutes,
    )
    db.add(doctor)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_token(user.id, user.role.value), user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_token(user.id, user.role.value), user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
