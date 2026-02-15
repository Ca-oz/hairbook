from fastapi import APIRouter
from ..database import SessionLocal
from ..models import Service

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/")
def get_services():
    db = SessionLocal()
    services = db.query(Service).all()

    result = []
    for s in services:
        result.append({
            "id": s.id,
            "name": s.name,
            "duration": s.duration
        })

    db.close()
    return result

@router.post("/seed")
def seed_services():
    db = SessionLocal()

    services = [
        Service(name="Haare schneiden", duration=60),
        Service(name="Bart schneiden", duration=30),
        Service(name="Haare + Bart", duration=90),
    ]

    for s in services:
        db.add(s)

    db.commit()
    db.close()

    return {"message": "Services angelegt"}
