from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Date, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
import enum


class LabTestType(str, enum.Enum):
    BLOOD = "blood"
    URINE = "urine"
    IMAGING = "imaging"
    BIOPSY = "biopsy"
    OTHER = "other"


class LabResultStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    lab_result_id = Column(String(20), unique=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    test_name = Column(String(255), nullable=False)
    test_type = Column(Enum(LabTestType), nullable=False)
    category = Column(String(100))
    results = Column(JSON, default=list)
    summary = Column(Text)
    interpretation = Column(Text)
    is_abnormal = Column(Boolean, default=False)
    status = Column(Enum(LabResultStatus), default=LabResultStatus.PENDING)
    priority = Column(String(20), default="routine")
    collected_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("Doctor", foreign_keys=[doctor_id])
