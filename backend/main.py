from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid
from pathlib import Path
from sqlalchemy import func, case


from database import get_db

from models_db import Vehicle, Dealership, VehiclePhoto, Event
from schemas import VehicleCreate, VehicleOut, PhotoOut, VehicleUpdate, VehicleListOut
from services.fipe_lookup import lookup_fipe_price
from services.fipe import get_brands, get_brand_years, get_year_models, get_brand_models, find_year_id, find_brand
from services.auth import hash_password, verify_password, create_access_token
from schemas import DealershipRegister, DealershipLogin, TokenOut, EventCreate
from services.auth import decode_access_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from schemas import DealershipUpdate
from schemas import DealershipRegister, DealershipLogin, TokenOut, DealershipUpdate, DealershipOut
from sqlalchemy import func
import secrets
from services.email import send_password_reset
from schemas import PasswordResetRequest, PasswordResetConfirm
from services.storage import upload_image, delete_image
import os
from sqlalchemy import text




app = FastAPI(title="BusCAR API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    FRONTEND_URL,
    "https://www.buscarrp.com.br",
    "https://buscar-omega.vercel.app",
    "http://localhost:3000",
],
    allow_methods=["*"],
    allow_headers=["*"],
)



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

@app.get("/vehicles", response_model=VehicleListOut)
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
    page: int = 1,
    limit: int = 12,
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

    total = query.count()

    page = max(1, page)
    limit = min(max(1, limit), 48)
    pages = max(1, (total + limit - 1) // limit)

    items = (
        query.order_by(Vehicle.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {"items": items, "total": total, "page": page, "pages": pages}


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

    try:
        url = upload_image(content, "vehicles")
    except Exception as e:
        print(f"Erro no upload: {e}")
        raise HTTPException(status_code=502, detail="Não foi possível enviar a imagem.")

    position = db.query(VehiclePhoto).filter(VehiclePhoto.vehicle_id == vehicle_id).count()

    photo = VehiclePhoto(vehicle_id=vehicle_id, url=url, position=position)
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

    delete_image(photo.url)

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


@app.get("/dealerships/{dealership_id}", response_model=DealershipOut)
def get_dealership(dealership_id: int, db: Session = Depends(get_db)):
    dealership = db.query(Dealership).filter(
        Dealership.id == dealership_id,
        Dealership.active == True
    ).first()
    if not dealership:
        raise HTTPException(status_code=404, detail="Revenda não encontrada")
    return dealership


@app.get("/dealerships/{dealership_id}/vehicles", response_model=list[VehicleOut])
def dealership_vehicles(dealership_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Vehicle)
        .filter(Vehicle.dealership_id == dealership_id, Vehicle.active == True)
        .order_by(Vehicle.created_at.desc())
        .all()
    )

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
        address=data.address,
        address_number=data.address_number,
        neighborhood=data.neighborhood,
        zip_code=data.zip_code,
        opening_hours=data.opening_hours,
        opening_hours_json=data.opening_hours_json,
        password_hash=hash_password(data.password),
    )

    db.add(dealership)
    db.commit()
    db.refresh(dealership)

    return {
        "access_token": create_access_token(dealership.id),
        "dealership": dealership,
    }


from datetime import datetime, timedelta, timezone

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


@app.post("/auth/login", response_model=TokenOut)
def login(data: DealershipLogin, db: Session = Depends(get_db)):
    dealership = db.query(Dealership).filter(Dealership.email == data.email.lower().strip()).first()

    if not dealership or not dealership.password_hash:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    now = datetime.utcnow()

    if dealership.locked_until and dealership.locked_until > now:
        minutes = max(1, int((dealership.locked_until - now).total_seconds() // 60) + 1)
        raise HTTPException(
            status_code=429,
            detail=f"Muitas tentativas. Tente novamente em {minutes} minuto(s) ou redefina sua senha.",
        )

    if not verify_password(data.password, dealership.password_hash):
        dealership.failed_login_attempts = (dealership.failed_login_attempts or 0) + 1

        if dealership.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
            dealership.locked_until = now + timedelta(minutes=LOCKOUT_MINUTES)
            dealership.failed_login_attempts = 0
            db.commit()
            raise HTTPException(
                status_code=429,
                detail=f"Muitas tentativas. Sua conta ficou bloqueada por {LOCKOUT_MINUTES} minutos.",
            )

        db.commit()
        remaining = MAX_LOGIN_ATTEMPTS - dealership.failed_login_attempts
        raise HTTPException(
            status_code=401,
            detail=f"E-mail ou senha incorretos. Restam {remaining} tentativa(s).",
        )

    if not dealership.active:
        raise HTTPException(status_code=403, detail="Esta conta está desativada.")

    dealership.failed_login_attempts = 0
    dealership.locked_until = None
    db.commit()

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


@app.get("/me", response_model=DealershipOut)
def get_me(dealership: Dealership = Depends(get_current_dealership)):
    return dealership


@app.patch("/me", response_model=DealershipOut)
def update_me(
    data: DealershipUpdate,
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(dealership, field, value)

    db.commit()
    db.refresh(dealership)
    return dealership


@app.get("/dealerships")
def list_dealerships(db: Session = Depends(get_db)):
    rows = (
        db.query(
            Dealership,
            func.count(Vehicle.id).label("vehicle_count"),
        )
        .outerjoin(Vehicle, (Vehicle.dealership_id == Dealership.id) & (Vehicle.active == True))
        .filter(Dealership.active == True)
        .group_by(Dealership.id)
        .order_by(Dealership.name)
        .all()
    )

    return [
        {
            "id": d.id,
            "name": d.name,
            "phone": d.phone,
            "city": d.city,
            "state": d.state,
            "address": d.address,
            "address_number": d.address_number,
            "neighborhood": d.neighborhood,
            "zip_code": d.zip_code,
            "opening_hours": d.opening_hours,
            "opening_hours_json": d.opening_hours_json,
            "logo_url": d.logo_url,
            "vehicle_count": count,
        }
        for d, count in rows
    ]

@app.post("/me/logo", response_model=DealershipOut)
async def upload_logo(
    file: UploadFile = File(...),
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato não permitido. Use JPG, PNG ou WEBP.")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Máximo 5 MB.")

    try:
        url = upload_image(content, "logos")
    except Exception as e:
        print(f"Erro no upload: {e}")
        raise HTTPException(status_code=502, detail="Não foi possível enviar a imagem.")

    if dealership.logo_url:
        delete_image(dealership.logo_url)

    dealership.logo_url = url
    db.commit()
    db.refresh(dealership)
    return dealership


@app.delete("/me/logo", response_model=DealershipOut)
def delete_logo(
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    if dealership.logo_url:
        filepath = UPLOAD_DIR / Path(dealership.logo_url).name
        if filepath.exists():
            filepath.unlink()

    dealership.logo_url = None
    db.commit()
    db.refresh(dealership)
    return dealership


RESET_TOKEN_HOURS = 1


@app.post("/auth/forgot-password")
def forgot_password(data: PasswordResetRequest, db: Session = Depends(get_db)):
    dealership = db.query(Dealership).filter(
        Dealership.email == data.email.lower().strip()
    ).first()

    if dealership and dealership.active:
        token = secrets.token_urlsafe(32)
        dealership.reset_token = token
        dealership.reset_token_expires = datetime.utcnow() + timedelta(hours=RESET_TOKEN_HOURS)
        db.commit()

        send_password_reset(dealership.email, dealership.name, token)

    return {
        "message": "Se existir uma conta com esse e-mail, enviamos as instruções para redefinir a senha."
    }


@app.post("/auth/reset-password")
def reset_password(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="A senha precisa ter pelo menos 8 caracteres.")

    dealership = db.query(Dealership).filter(Dealership.reset_token == data.token).first()

    if not dealership or not dealership.reset_token_expires:
        raise HTTPException(status_code=400, detail="Link inválido ou já utilizado.")

    if dealership.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Este link expirou. Peça um novo.")

    dealership.password_hash = hash_password(data.password)
    dealership.reset_token = None
    dealership.reset_token_expires = None
    dealership.failed_login_attempts = 0
    dealership.locked_until = None
    db.commit()

    return {"message": "Senha alterada com sucesso."}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/fipe/models-by-year")
def fipe_models_by_year(brand: str, year: int, fuel: str | None = None):
    try:
        found = find_brand(brand)
        if not found:
            return []

        year_id = find_year_id(found["code"], year, fuel)
        if not year_id:
            return []

        models = get_year_models(found["code"], year_id)

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

VALID_EVENT_TYPES = {"vehicle_view", "whatsapp_click", "dealership_view", "search_impression"}


@app.post("/events")
def create_event(data: EventCreate, db: Session = Depends(get_db)):
    if data.event_type not in VALID_EVENT_TYPES:
        raise HTTPException(status_code=400, detail="Tipo de evento inválido")

    dealership = db.query(Dealership).filter(Dealership.id == data.dealership_id).first()
    if not dealership:
        raise HTTPException(status_code=404, detail="Revenda não encontrada")

    if data.session_id and data.vehicle_id:
        existing = db.query(Event).filter(
            Event.session_id == data.session_id,
            Event.vehicle_id == data.vehicle_id,
            Event.event_type == data.event_type,
            Event.created_at > text("NOW() - INTERVAL '1 hour'"),
        ).first()
        if existing:
            return {"status": "ok", "duplicate": True}

    event = Event(
        event_type=data.event_type,
        vehicle_id=data.vehicle_id,
        dealership_id=data.dealership_id,
        session_id=data.session_id,
    )
    db.add(event)
    db.commit()
    return {"status": "ok"}


@app.get("/reports")
def get_reports(
    days: int = 30,
    dealership: Dealership = Depends(get_current_dealership),
    db: Session = Depends(get_db),
):
    days = min(max(days, 1), 365)
    since = datetime.utcnow() - timedelta(days=days)
    previous_since = since - timedelta(days=days)

    def count_events(event_type: str, start, end=None):
        query = db.query(func.count(Event.id)).filter(
            Event.dealership_id == dealership.id,
            Event.event_type == event_type,
            Event.created_at >= start,
        )
        if end:
            query = query.filter(Event.created_at < end)
        return query.scalar() or 0

    def count_clicks(start, end=None, from_vehicle=True):
        query = db.query(func.count(Event.id)).filter(
            Event.dealership_id == dealership.id,
            Event.event_type == "whatsapp_click",
            Event.created_at >= start,
        )
        query = query.filter(
            Event.vehicle_id.isnot(None) if from_vehicle else Event.vehicle_id.is_(None)
        )
        if end:
            query = query.filter(Event.created_at < end)
        return query.scalar() or 0

    current = {
        "vehicle_views": count_events("vehicle_view", since),
        "whatsapp_clicks": count_events("whatsapp_click", since),
        "vehicle_clicks": count_clicks(since, from_vehicle=True),
        "dealership_clicks": count_clicks(since, from_vehicle=False),
        "dealership_views": count_events("dealership_view", since),
        "search_impressions": count_events("search_impression", since),
    }

    previous = {
        "vehicle_views": count_events("vehicle_view", previous_since, since),
        "whatsapp_clicks": count_events("whatsapp_click", previous_since, since),
        "vehicle_clicks": count_clicks(previous_since, since, from_vehicle=True),
        "dealership_clicks": count_clicks(previous_since, since, from_vehicle=False),
        "dealership_views": count_events("dealership_view", previous_since, since),
        "search_impressions": count_events("search_impression", previous_since, since),
    }

    per_vehicle = (
        db.query(
            Vehicle.id,
            Vehicle.brand,
            Vehicle.model,
            Vehicle.version,
            Vehicle.year,
            Vehicle.price,
            Vehicle.active,
            func.count(case((Event.event_type == "vehicle_view", 1))).label("views"),
            func.count(case((Event.event_type == "whatsapp_click", 1))).label("clicks"),
        )
        .outerjoin(
            Event,
            (Event.vehicle_id == Vehicle.id) & (Event.created_at >= since),
        )
        .filter(Vehicle.dealership_id == dealership.id)
        .group_by(Vehicle.id)
        .order_by(func.count(case((Event.event_type == "vehicle_view", 1))).desc())
        .all()
    )

    daily = (
        db.query(
            func.date(Event.created_at).label("day"),
            func.count(case((Event.event_type == "vehicle_view", 1))).label("views"),
            func.count(case((Event.event_type == "whatsapp_click", 1))).label("clicks"),
        )
        .filter(Event.dealership_id == dealership.id, Event.created_at >= since)
        .group_by(func.date(Event.created_at))
        .order_by(func.date(Event.created_at))
        .all()
    )

    active_count = (
        db.query(func.count(Vehicle.id))
        .filter(Vehicle.dealership_id == dealership.id, Vehicle.active == True)
        .scalar()
        or 0
    )

    return {
        "period_days": days,
        "current": current,
        "previous": previous,
        "active_vehicles": active_count,
        "vehicles": [
            {
                "id": v.id,
                "brand": v.brand,
                "model": v.model,
                "version": v.version,
                "year": v.year,
                "price": v.price,
                "active": v.active,
                "views": v.views,
                "clicks": v.clicks,
            }
            for v in per_vehicle
        ],
        "daily": [
            {"day": str(d.day), "views": d.views, "clicks": d.clicks} for d in daily
        ],
    }
