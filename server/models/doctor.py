from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    specialty = Column(String(100), nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    bio = Column(Text)
    experience_years = Column(Integer, default=0)
    consultation_fee = Column(Integer, default=0)
    rating = Column(Integer, default=0)
    total_ratings = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    available_days = Column(JSON, default=[1, 2, 3, 4, 5])
    available_hours_start = Column(String(5), default="09:00")
    available_hours_end = Column(String(17), default="17:00")
    slot_duration_minutes = Column(Integer, default=30)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
