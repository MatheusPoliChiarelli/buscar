from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from database import Base


class Dealership(Base):
    __tablename__ = "dealerships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(20))
    city = Column(String(100), nullable=False)
    state = Column(String(2), nullable=False, default="SP")
    email = Column(String(150), unique=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    vehicles = relationship("Vehicle", back_populates="dealership")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    dealership_id = Column(Integer, ForeignKey("dealerships.id"), nullable=False)

    brand = Column(String(100), nullable=False)
    model = Column(String(150), nullable=False)
    version = Column(String(150))
    year = Column(Integer, nullable=False)
    mileage = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    transmission = Column(String(20))
    fuel = Column(String(30))
    color = Column(String(50))
    description = Column(Text)

    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dealership = relationship("Dealership", back_populates="vehicles")
    photos = relationship("VehiclePhoto", back_populates="vehicle", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_vehicle_search", "brand", "year", "price"),
    )


class VehiclePhoto(Base):
    __tablename__ = "vehicle_photos"

    id = Column(Integer, primary_key=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    url = Column(String(500), nullable=False)
    position = Column(Integer, default=0)

    vehicle = relationship("Vehicle", back_populates="photos")