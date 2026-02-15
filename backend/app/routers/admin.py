from fastapi import APIRouter, HTTPException, Header
from ..database import SessionLocal
from ..models import Appointment, Closure
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

ADMIN_KEY = "1234"  # später ändern!


def check_admin(x_admin_key: str | None):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(status_code=401, detail="Nicht autorisiert")


# ---------------------------
# Alle Termine abrufen
# ---------------------------
@router.get("/appointments")
def get_all_appointments(x_admin_key: str = Header(None)):
    check_admin(x_admin_key)

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


# ---------------------------
# Termin löschen
# ---------------------------
@router.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, x_admin_key: str = Header(None)):
    check_admin(x_admin_key)

    db = SessionLocal()
    appointment = db.query(Appointment).filter_by(id=appointment_id).first()

    if not appointment:
        db.close()
        raise HTTPException(status_code=404, detail="Termin nicht gefunden")

    db.delete(appointment)
    db.commit()
    db.close()

    return {"message": "Termin gelöscht"}


# ---------------------------
# Blockzeit erstellen
# ---------------------------
@router.post("/closures")
def create_closure(
    start: datetime,
    end: datetime,
    note: str = "",
    x_admin_key: str = Header(None),
):
    check_admin(x_admin_key)

    db = SessionLocal()

    closure = Closure(
        start=start,
        end=end,
        note=note,
    )

    db.add(closure)
    db.commit()
    db.close()

    return {"message": "Blockzeit erstellt"}


# ---------------------------
# Blockzeiten abrufen
# ---------------------------
@router.get("/closures")
def get_closures(x_admin_key: str = Header(None)):
    check_admin(x_admin_key)

    db = SessionLocal()
    closures = db.query(Closure).all()
    db.close()

    return [
        {
            "id": c.id,
            "start": c.start,
            "end": c.end,
            "note": c.note,
        }
        for c in closures
    ]


# ---------------------------
# Blockzeit löschen
# ---------------------------
@router.delete("/closures/{closure_id}")
def delete_closure(closure_id: int, x_admin_key: str = Header(None)):
    check_admin(x_admin_key)

    db = SessionLocal()
    closure = db.query(Closure).filter_by(id=closure_id).first()

    if not closure:
        db.close()
        raise HTTPException(status_code=404, detail="Blockzeit nicht gefunden")

    db.delete(closure)
    db.commit()
    db.close()

    return {"message": "Blockzeit gelöscht"}
