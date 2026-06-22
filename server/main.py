from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config.database import engine, Base
from config.settings import get_settings
from controllers.auth_controller import router as auth_router
from controllers.doctor_controller import router as doctor_router
from controllers.appointment_controller import router as appointment_router
from controllers.dashboard_controller import router as dashboard_router
from controllers.admin_controller import router as admin_router
from controllers.hospital_controller import router as hospital_router
from controllers.medical_record_controller import router as medical_record_router
from controllers.lab_result_controller import router as lab_result_router
from controllers.insurance_controller import router as insurance_router
from controllers.notification_controller import router as notification_router
import os

settings = get_settings()
app = FastAPI(title="Healthcare Booking API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)
app.include_router(doctor_router)
app.include_router(appointment_router)
app.include_router(dashboard_router)
app.include_router(admin_router)
app.include_router(hospital_router)
app.include_router(medical_record_router)
app.include_router(lab_result_router)
app.include_router(insurance_router)
app.include_router(notification_router)

Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "healthcare-booking", "version": "2.0.0"}
