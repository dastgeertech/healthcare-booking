from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    email = Column(String(255))
    phone = Column(String(20))
    address_street = Column(String(255))
    address_city = Column(String(100))
    address_state = Column(String(50))
    address_zip = Column(String(10))
    emergency_services = Column(Boolean, default=False)
    insurance_accepted = Column(JSON, default=list)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    operating_hours = Column(JSON, default=dict)
    image_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    departments = relationship("Department", back_populates="hospital")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    services = Column(JSON, default=list)
    head_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    hospital = relationship("Hospital", back_populates="departments")
