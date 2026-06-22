from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
import enum


class AppointmentStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class AppointmentType(str, enum.Enum):
    IN_PERSON = "in_person"
    VIDEO = "video"
    PHONE = "phone"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(Time, nullable=False)
    type = Column(Enum(AppointmentType), default=AppointmentType.IN_PERSON)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING)
    reason = Column(Text)
    notes = Column(Text)
    consultation_fee = Column(Integer, default=0)
    twilio_room_sid = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("User", foreign_keys=[patient_id], back_populates="appointments_as_patient")
    doctor = relationship("Doctor", back_populates="appointments")
    prescriptions = relationship("Prescription", back_populates="appointment")
