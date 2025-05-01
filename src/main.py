from app import app

# Import database and models
import os
from flask_sqlalchemy import SQLAlchemy
from models.models import db, User, Itinerary, ItineraryDay, Activity, Place, Checklist, Budget

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()