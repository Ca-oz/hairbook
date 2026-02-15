from fastapi import APIRouter
from datetime import datetime, timedelta, time
from ..database import SessionLocal
from ..models import Appointment, Closure, Service

router = APIRouter(prefix="/availability", tags=["availability"])


@router.get("/")
def get_availability(date: str, service_id: int):
    db = SessionLocal()

    # Datum umwandeln
    selected_date = datetime.strptime(date, "%Y-%m-%d").date()

    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        db.close()
        return {"error": "Service nicht gefunden"}

    duration = timedelta(minutes=service.duration_minutes)

    # Öffnungszeiten
    opening_time = datetime.combine(selected_date, time(9, 0))
    closing_time = datetime.combine(selected_date, time(18, 0))

    # Bestehende Termine
    appointments = db.query(Appointment).all()

    # Blockzeiten
    closures = db.query(Closure).all()

    db.close()

    free_slots = []
    current = opening_time

    while current + duration <= closing_time:
        slot_end = current + duration
        overlap = False

        for a in appointments:
            if not (slot_end <= a.start or current >= a.end):
                overlap = True
                break

        for c in closures:
            if not (slot_end <= c.start or current >= c.end):
                overlap = True
                break

        if not overlap:
            free_slots.append(current.strftime("%H:%M"))

        current += timedelta(minutes=15)

    return free_slots
