from database import Base, engine
import models_db

Base.metadata.create_all(bind=engine)
print("Tables created successfully.")