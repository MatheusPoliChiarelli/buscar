from database import SessionLocal
from models_db import Dealership

db = SessionLocal()
dealership = db.query(Dealership).filter(Dealership.id == 1).first()
dealership.name = "Auto Center Ribeirão"
dealership.city = "Ribeirão Preto"
db.commit()
print("Atualizado:", dealership.name, "|", dealership.city)
db.close()