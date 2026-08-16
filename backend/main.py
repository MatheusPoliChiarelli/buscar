from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid
from pathlib import Path
from fastapi.staticfiles import StaticFiles

from database import get_db

from models_db import Vehicle, Dealership, VehiclePhoto
from schemas import VehicleCreate, VehicleOut, PhotoOut, VehicleUpdate
from services.fipe_lookup import lookup_fipe_price
from services.fipe import get_brands, get_brand_years, get_year_models, get_brand_models, find_year_id, find_brand
from services.auth import hash_password, verify_password, create_access_token
from schemas import DealershipRegister, DealershipLogin, TokenOut
from services.auth import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials





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

security = HTTPBearer()


def get_current_dealership(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> Dealership:
    dealership_id = decode_access_token(credentials.credentials)

    if not dealership_id:
        raise HTTPException(status_code=401, detail="Sessão expirada. Faça login novamente.")

    dealership = db.query(Dealership).filter(Dealership.id == dealership_id).first()

    if not dealership or not dealership.active:
        raise HTTPException(status_code=401, detail="Conta não encontrada ou desativada.")

    return dealership



@app.get("/")
def read_root():
    return {"status": "ok", "service": "BusCAR API"}

@app.get("/vehicles", response_model=list[VehicleOut])
def list_vehicles(
    brand: str | None = None,
    model: str | None = None,
    version: str | None = None,
    min_year: int | None = None,
    max_year: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    max_mileage: int | None = None,
    transmission: str | None = None,
    city: str | None = None,
    has_history_report: bool | None = None,
    is_inspected: bool | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle).filter(Vehicle.active == True)

    if brand:
        query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
    if model:
        query = query.filter(Vehicle.model.ilike(f"%{model}%"))
    if version:
        query = query.filter(Vehicle.version.ilike(f"%{version}%"))
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
    if has_history_report:
        query = query.filter(Vehicle.has_history_report == True)
    if is_inspected:
        query = query.filter(Vehicle.is_inspected == True)

    return query.order_by(Vehicle.created_at.desc()).all()


@app.get("/vehicles/facets")
def vehicle_facets(db: Session = Depends(get_db)):
    rows = db.query(Vehicle.brand, Vehicle.model, Vehicle.version).filter(Vehicle.active == True).all()

    brands: dict[str, dict[str, set[str]]] = {}
    for brand, model, version in rows:
        models = brands.setdefault(brand, {})
        versions = models.setdefault(model, set())
        if version:
            versions.add(version)

    return [
        {
            "brand": brand,
            "models": [
                {"model": model, "versions": sorted(versions)}
                for model, versions in sorted(models.items())
            ],
        }
        for brand, models in sorted(brands.items())
    ]


@app.get("/vehicles/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return vehicle


@app.post("/vehicles", response_model=VehicleOut)
def create_vehicle(
    data: VehicleCreate,
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    vehicle = Vehicle(**data.model_dump(), dealership_id=dealership.id)

    fipe = lookup_fipe_price(
        db=db,
        brand=data.brand,
        model=data.model,
        year=data.year,
        version=data.version,
        transmission=data.transmission,
        fuel=data.fuel,
    )

    if fipe:
        vehicle.fipe_price = fipe["price"]
        vehicle.fipe_reference = fipe["reference_month"]
        vehicle.fipe_matched_model = fipe["matched_model"]

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@app.post("/vehicles/{vehicle_id}/photos", response_model=PhotoOut)
async def upload_photo(
    vehicle_id: int,
    file: UploadFile = File(...),
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    if vehicle.dealership_id != dealership.id:
        raise HTTPException(status_code=403, detail="Este anúncio não é seu.")

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

    photo = VehiclePhoto(vehicle_id=vehicle_id, url=f"/uploads/{filename}", position=position)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@app.delete("/vehicles/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    if vehicle.dealership_id != dealership.id:
        raise HTTPException(status_code=403, detail="Este anúncio não é seu.")

    vehicle.active = False
    db.commit()
    return {"status": "ok", "message": "Anúncio removido"}


@app.delete("/vehicles/{vehicle_id}/photos/{photo_id}")
def delete_photo(
    vehicle_id: int,
    photo_id: int,
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    if vehicle.dealership_id != dealership.id:
        raise HTTPException(status_code=403, detail="Este anúncio não é seu.")

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




@app.patch("/vehicles/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    if vehicle.dealership_id != dealership.id:
        raise HTTPException(status_code=403, detail="Este anúncio não é seu.")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@app.get("/fipe/brands")
def fipe_brands():
    try:
        return get_brands()
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/fipe/brands/{brand_id}/models")
def fipe_models(brand_id: str, year: int, fuel: str | None = None):
    try:
        year_id = find_year_id(brand_id, year, fuel)
        if not year_id:
            return []

        models = get_year_models(brand_id, year_id)

        grouped: dict[str, list[str]] = {}
        for m in models:
            name = m["name"]
            base = name.split()[0] if name else ""
            grouped.setdefault(base, []).append(name)

        return [
            {"model": base, "versions": sorted(versions)}
            for base, versions in sorted(grouped.items())
        ]
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/fipe/models")
def fipe_models_by_brand(brand: str):
    try:
        found = find_brand(brand)
        if not found:
            return []

        models = get_brand_models(found["code"])

        grouped: dict[str, set[str]] = {}
        for m in models:
            name = m["name"]
            if not name:
                continue
            base = name.split()[0]
            grouped.setdefault(base, set()).add(name)

        return [
            {"model": base, "versions": sorted(versions)}
            for base, versions in sorted(grouped.items())
        ]
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/fipe/price")
def fipe_price(
    brand: str,
    model: str,
    year: int,
    version: str | None = None,
    transmission: str | None = None,
    fuel: str | None = None,
    db: Session = Depends(get_db),
):
    result = lookup_fipe_price(
        db=db,
        brand=brand,
        model=model,
        year=year,
        version=version,
        transmission=transmission,
        fuel=fuel,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Não encontramos esse veículo na tabela FIPE.")
    return result


@app.post("/auth/register", response_model=TokenOut)
def register(data: DealershipRegister, db: Session = Depends(get_db)):
    existing = db.query(Dealership).filter(Dealership.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Já existe uma conta com esse e-mail.")

    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="A senha precisa ter pelo menos 8 caracteres.")

    dealership = Dealership(
        name=data.name,
        email=data.email.lower().strip(),
        phone=data.phone,
        city=data.city,
        state=data.state,
        password_hash=hash_password(data.password),
    )
    db.add(dealership)
    db.commit()
    db.refresh(dealership)

    return {
        "access_token": create_access_token(dealership.id),
        "dealership": dealership,
    }


@app.post("/auth/login", response_model=TokenOut)
def login(data: DealershipLogin, db: Session = Depends(get_db)):
    dealership = db.query(Dealership).filter(Dealership.email == data.email.lower().strip()).first()

    if not dealership or not dealership.password_hash:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    if not verify_password(data.password, dealership.password_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    if not dealership.active:
        raise HTTPException(status_code=403, detail="Esta conta está desativada.")

    return {
        "access_token": create_access_token(dealership.id),
        "dealership": dealership,
    }






@app.get("/my-vehicles", response_model=list[VehicleOut])
def my_vehicles(
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    return (
        db.query(Vehicle)
        .filter(Vehicle.dealership_id == dealership.id)
        .order_by(Vehicle.created_at.desc())
        .all()
    )