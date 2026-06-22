from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
import enum


class RecordType(str, enum.Enum):
    CONSULTATION = "consultation"
    LAB_RESULT = "lab_result"
    IMAGING = "imaging"
    SURGERY = "surgery"
    DISCHARGE = "discharge"
    REFERRAL = "referral"
    OTHER = "other"


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(String(20), unique=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    type = Column(Enum(RecordType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    diagnosis = Column(JSON, default=list)
    symptoms = Column(JSON, default=list)
    vital_signs = Column(JSON, default=dict)
    is_confidential = Column(Boolean, default=False)
    tags = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("Doctor", foreign_keys=[doctor_id])
