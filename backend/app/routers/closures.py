from fastapi import APIRouter
from datetime import datetime
from ..database import SessionLocal
from ..models import Closure

router = APIRouter(prefix="/closures", tags=["closures"])


@router.post("/")
def create_closure(
    start: datetime,
    end: datetime,
    note: str = "Pause",
):
    db = SessionLocal()

    closure = Closure(
        start=start,
        end=end,
        note=note,
    )

    db.add(closure)
    db.commit()
    db.refresh(closure)
    db.close()

    return {"id": closure.id}


@router.get("/")
def list_closures():
    db = SessionLocal()
    closures = db.query(Closure).order_by(Closure.start).all()
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
