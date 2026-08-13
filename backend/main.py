from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid
from pathlib import Path
from fastapi.staticfiles import StaticFiles

from database import get_db

from models_db import Vehicle, Dealership, VehiclePhoto
from schemas import VehicleCreate, VehicleOut, PhotoOut, VehicleUpdate

app = FastAPI(title="BusCAR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def read_root():
    return {"status": "ok", "service": "BusCAR API"}


@app.get("/vehicles", response_model=list[VehicleOut])
def list_vehicles(
    brand: str | None = None,
    model: str | None = None,
    min_year: int | None = None,
    max_year: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    max_mileage: int | None = None,
    transmission: str | None = None,
    city: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle).filter(Vehicle.active == True)

    if brand:
        query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
    if model:
        query = query.filter(Vehicle.model.ilike(f"%{model}%"))
    if min_year:
        query = query.filter(Vehicle.year >= min_year)
    if max_year:
        query = query.filter(Vehicle.year <= max_year)
    if min_price:
        query = query.filter(Vehicle.price >= min_price)
    if max_price:
        query = query.filter(Vehicle.price <= max_price)
    if max_mileage:
        query = query.filter(Vehicle.mileage <= max_mileage)
    if transmission:
        query = query.filter(Vehicle.transmission == transmission)
    if city:
        query = query.join(Dealership).filter(Dealership.city.ilike(f"%{city}%"))

    return query.order_by(Vehicle.created_at.desc()).all()


@app.get("/vehicles/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return vehicle


@app.post("/vehicles", response_model=VehicleOut)
def create_vehicle(data: VehicleCreate, db: Session = Depends(get_db)):
    dealership = db.query(Dealership).filter(Dealership.id == data.dealership_id).first()
    if not dealership:
        raise HTTPException(status_code=404, detail="Revenda não encontrada")

    vehicle = Vehicle(**data.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@app.post("/vehicles/{vehicle_id}/photos", response_model=PhotoOut)
async def upload_photo(vehicle_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato não permitido. Use JPG, PNG ou WEBP.")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Máximo 5 MB.")

    filename = f"{uuid.uuid4().hex}{extension}"
    filepath = UPLOAD_DIR / filename
    filepath.write_bytes(content)

    position = db.query(VehiclePhoto).filter(VehiclePhoto.vehicle_id == vehicle_id).count()

    photo = VehiclePhoto(
        vehicle_id=vehicle_id,
        url=f"/uploads/{filename}",
        position=position
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo



@app.patch("/vehicles/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, data: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@app.delete("/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")

    vehicle.active = False
    db.commit()
    return {"status": "ok", "message": "Anúncio removido"}


@app.delete("/vehicles/{vehicle_id}/photos/{photo_id}")
def delete_photo(vehicle_id: int, photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(VehiclePhoto).filter(
        VehiclePhoto.id == photo_id,
        VehiclePhoto.vehicle_id == vehicle_id
    ).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Foto não encontrada")

    filepath = UPLOAD_DIR / Path(photo.url).name
    if filepath.exists():
        filepath.unlink()

    db.delete(photo)
    db.commit()
    return {"status": "ok", "message": "Foto removida"}