from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PhotoOut(BaseModel):
    id: int
    url: str
    position: int

    model_config = ConfigDict(from_attributes=True)


class DealershipOut(BaseModel):
    id: int
    name: str
    phone: str | None
    city: str
    address: str | None
    opening_hours: str | None
    state: str

    model_config = ConfigDict(from_attributes=True)


class VehicleCreate(BaseModel):
    brand: str
    model: str
    version: str | None = None
    year: int
    mileage: int
    price: float
    transmission: str | None = None
    fuel: str | None = None
    color: str | None = None
    description: str | None = None
    has_history_report: bool = False
    is_inspected: bool = False


class VehicleOut(BaseModel):
    id: int
    brand: str
    model: str
    version: str | None
    year: int
    mileage: int
    price: float
    transmission: str | None
    fuel: str | None
    color: str | None
    description: str | None
    created_at: datetime
    dealership: DealershipOut
    photos: list[PhotoOut]
    fipe_price: float | None
    fipe_reference: str | None
    has_history_report: bool
    is_inspected: bool
    active: bool
    has_history_report: bool
    is_inspected: bool

    model_config = ConfigDict(from_attributes=True)



class VehicleUpdate(BaseModel):
    brand: str | None = None
    model: str | None = None
    version: str | None = None
    year: int | None = None
    mileage: int | None = None
    price: float | None = None
    transmission: str | None = None
    fuel: str | None = None
    color: str | None = None
    description: str | None = None
    active: bool | None = None
    has_history_report: bool | None = None
    is_inspected: bool | None = None



class DealershipRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: str | None = None
    city: str
    state: str = "SP"
    address: str | None = None
    opening_hours: str | None = None


class DealershipLogin(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    dealership: DealershipOut


class DealershipUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    city: str | None = None
    state: str | None = None
    address: str | None = None
    opening_hours: str | None = None