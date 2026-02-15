from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..database import SessionLocal
from ..models import Appointment, Closure

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.get("/")
def get_appointments():
    db = SessionLocal()
    appointments = db.query(Appointment).all()
    db.close()

    return [
        {
            "id": a.id,
            "start": a.start,
            "end": a.end,
            "service_name": a.service_name,
            "customer_name": a.customer_name,
            "customer_phone": a.customer_phone,
        }
        for a in appointments
    ]

@router.post("/")
def create_appointment(
    start: datetime,
    end: datetime,
    service_name: str,
    customer_name: str,
    customer_phone: str,
):
    db = SessionLocal()

 # 🔥 FIX
    start = start.replace(tzinfo=None)
    end = end.replace(tzinfo=None)

    # Überlappung mit bestehenden Terminen prüfen
    existing = db.query(Appointment).all()

    for a in existing:
        if not (end <= a.start or start >= a.end):
            db.close()
            return {"error": "Zeitraum nicht verfügbar"}

    # Überlappung mit Blockzeiten prüfen
    closures = db.query(Closure).all()

    for c in closures:
        if not (end <= c.start or start >= c.end):
            db.close()
            raise HTTPException(status_code=400, detail="Zeitraum liegt in Blockzeit")

    # Termin speichern
    new_appointment = Appointment(
        start=start,
        end=end,
        service_name=service_name,
        customer_name=customer_name,
        customer_phone=customer_phone,
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    db.close()

    return {"message": "Termin erfolgreich gespeichert"}

from datetime import time, timedelta
from ..models import Service


@router.get("/available")
def get_available_slots(date: str, service_id: int):
    db = SessionLocal()

    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        db.close()
        return []

    selected_date = datetime.strptime(date, "%Y-%m-%d")

    opening_time = time(9, 0)
    closing_time = time(18, 0)

    day_start = datetime.combine(selected_date, opening_time)
    day_end = datetime.combine(selected_date, closing_time)

    duration = timedelta(minutes=service.duration)

    appointments = db.query(Appointment).all()
    closures = db.query(Closure).all()

    slots = []
    current = day_start

    while current + duration <= day_end:
        overlap = False
        end_time = current + duration

        # Prüfe Termine
        for a in appointments:
            if a.start.date() == selected_date.date():
                if not (end_time <= a.start or current >= a.end):
                    overlap = True
                    break

        # Prüfe Blockzeiten
        if not overlap:
            for c in closures:
                if c.start.date() == selected_date.date():
                    if not (end_time <= c.start or current >= c.end):
                        overlap = True
                        break

        if not overlap:
            slots.append(current.strftime("%H:%M"))

        # Raster: 30 Minuten
        current += timedelta(minutes=30)

    db.close()
    return slots
