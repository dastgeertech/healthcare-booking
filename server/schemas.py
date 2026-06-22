from pydantic import BaseModel, EmailStr
from typing import Optional, Any, List
from datetime import date, time, datetime
from enum import Enum


class UserRoleEnum(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class AppointmentTypeEnum(str, Enum):
    IN_PERSON = "in_person"
    VIDEO = "video"
    PHONE = "phone"


class AppointmentStatusEnum(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RecordTypeEnum(str, Enum):
    CONSULTATION = "consultation"
    LAB_RESULT = "lab_result"
    IMAGING = "imaging"
    SURGERY = "surgery"
    DISCHARGE = "discharge"
    REFERRAL = "referral"
    OTHER = "other"


class LabTestTypeEnum(str, Enum):
    BLOOD = "blood"
    URINE = "urine"
    IMAGING = "imaging"
    BIOPSY = "biopsy"
    OTHER = "other"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: UserRoleEnum = UserRoleEnum.PATIENT


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    role: UserRoleEnum
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    user: UserResponse


class DoctorRegisterRequest(BaseModel):
    specialty: str
    license_number: str
    bio: Optional[str] = None
    experience_years: int = 0
    consultation_fee: int = 0
    available_days: list[int] = [1, 2, 3, 4, 5]
    available_hours_start: str = "09:00"
    available_hours_end: str = "17:00"
    slot_duration_minutes: int = 30


class DoctorResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    specialty: str
    bio: Optional[str]
    experience_years: int
    consultation_fee: int
    rating: int
    total_ratings: int
    is_verified: bool
    available_days: list[int]
    available_hours_start: str
    available_hours_end: str
    slot_duration_minutes: int

    class Config:
        from_attributes = True


class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: date
    appointment_time: time
    type: AppointmentTypeEnum = AppointmentTypeEnum.IN_PERSON
    reason: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: date
    appointment_time: time
    type: AppointmentTypeEnum
    status: AppointmentStatusEnum
    reason: Optional[str]
    notes: Optional[str]
    consultation_fee: int
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    specialty: Optional[str] = None
    created_at: Any

    class Config:
        from_attributes = True


class PrescriptionCreate(BaseModel):
    appointment_id: int
    patient_id: int
    diagnosis: str
    medications: str
    notes: Optional[str] = None
    valid_until: Optional[date] = None


class PrescriptionResponse(BaseModel):
    id: int
    appointment_id: int
    patient_id: int
    doctor_id: int
    diagnosis: str
    medications: str
    notes: Optional[str]
    valid_until: Optional[date]
    created_at: Any

    class Config:
        from_attributes = True


class SlotQuery(BaseModel):
    doctor_id: int
    date: date


class AvailableSlot(BaseModel):
    time: str
    available: bool


class HospitalResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    address_street: Optional[str]
    address_city: Optional[str]
    address_state: Optional[str]
    address_zip: Optional[str]
    emergency_services: bool
    insurance_accepted: list
    is_verified: bool
    operating_hours: Optional[dict]
    image_url: Optional[str]
    created_at: Any

    class Config:
        from_attributes = True


class DepartmentResponse(BaseModel):
    id: int
    hospital_id: int
    name: str
    description: Optional[str]
    services: list
    head_doctor_id: Optional[int]
    is_active: bool
    created_at: Any

    class Config:
        from_attributes = True


class MedicalRecordCreate(BaseModel):
    patient_id: int
    hospital_id: Optional[int] = None
    appointment_id: Optional[int] = None
    type: RecordTypeEnum
    title: str
    description: Optional[str] = None
    diagnosis: Optional[list] = None
    symptoms: Optional[list] = None
    vital_signs: Optional[dict] = None


class MedicalRecordResponse(BaseModel):
    id: int
    record_id: Optional[str]
    patient_id: int
    doctor_id: int
    hospital_id: Optional[int]
    appointment_id: Optional[int]
    type: RecordTypeEnum
    title: str
    description: Optional[str]
    diagnosis: Optional[list]
    symptoms: Optional[list]
    vital_signs: Optional[dict]
    is_confidential: bool
    created_at: Any

    class Config:
        from_attributes = True


class LabResultCreate(BaseModel):
    patient_id: int
    hospital_id: Optional[int] = None
    appointment_id: Optional[int] = None
    test_name: str
    test_type: LabTestTypeEnum
    category: Optional[str] = None
    results: Optional[list] = None
    summary: Optional[str] = None
    interpretation: Optional[str] = None
    is_abnormal: bool = False
    priority: str = "routine"


class LabResultResponse(BaseModel):
    id: int
    lab_result_id: Optional[str]
    patient_id: int
    doctor_id: int
    hospital_id: Optional[int]
    appointment_id: Optional[int]
    test_name: str
    test_type: LabTestTypeEnum
    category: Optional[str]
    results: Optional[list]
    summary: Optional[str]
    interpretation: Optional[str]
    is_abnormal: bool
    status: str
    priority: str
    is_verified: bool
    created_at: Any

    class Config:
        from_attributes = True


class InsuranceCreate(BaseModel):
    provider: str
    policy_number: str
    group_number: Optional[str] = None
    member_id: Optional[str] = None
    phone: Optional[str] = None
    expiry_date: Optional[date] = None


class InsuranceResponse(BaseModel):
    id: int
    patient_id: int
    provider: str
    policy_number: str
    group_number: Optional[str]
    member_id: Optional[str]
    phone: Optional[str]
    expiry_date: Optional[date]
    is_verified: bool
    created_at: Any

    class Config:
        from_attributes = True


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str]
    created_at: Any

    class Config:
        from_attributes = True
