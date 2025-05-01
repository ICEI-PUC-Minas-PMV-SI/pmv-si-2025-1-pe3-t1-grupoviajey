from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Tabela de associação para usuários e roteiros compartilhados
itinerary_shares = db.Table('itinerary_shares',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('itinerary_id', db.Integer, db.ForeignKey('itinerary.id'), primary_key=True),
    db.Column('permission', db.String(20), default='view'),  # view, edit
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

# Tabela de associação para usuários e locais favoritos
user_favorites = db.Table('user_favorites',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('place_id', db.Integer, db.ForeignKey('place.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100))
    bio = db.Column(db.Text)
    avatar_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    itineraries = db.relationship('Itinerary', backref='owner', lazy=True)
    shared_itineraries = db.relationship('Itinerary', secondary=itinerary_shares, lazy='subquery',
                                        backref=db.backref('shared_with', lazy=True))
    favorite_places = db.relationship('Place', secondary=user_favorites, lazy='subquery',
                                     backref=db.backref('favorited_by', lazy=True))
    checklist_templates = db.relationship('ChecklistTemplate', backref='creator', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Itinerary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    description = db.Column(db.Text)
    is_public = db.Column(db.Boolean, default=False)
    cover_image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Chave estrangeira
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relacionamentos
    days = db.relationship('ItineraryDay', backref='itinerary', lazy=True, cascade='all, delete-orphan')
    budget = db.relationship('Budget', backref='itinerary', uselist=False, cascade='all, delete-orphan')
    checklists = db.relationship('Checklist', backref='itinerary', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Itinerary {self.name} - {self.destination}>'

class ItineraryDay(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    day_number = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date)
    notes = db.Column(db.Text)
    
    # Chave estrangeira
    itinerary_id = db.Column(db.Integer, db.ForeignKey('itinerary.id'), nullable=False)
    
    # Relacionamentos
    activities = db.relationship('Activity', backref='day', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Day {self.day_number} of Itinerary {self.itinerary_id}>'

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    type = db.Column(db.String(20))  # hotel, restaurant, attraction, transport, other
    location = db.Column(db.String(100))
    address = db.Column(db.String(255))
    cost = db.Column(db.Float)
    booking_reference = db.Column(db.String(100))
    booking_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Chaves estrangeiras
    day_id = db.Column(db.Integer, db.ForeignKey('itinerary_day.id'), nullable=False)
    place_id = db.Column(db.Integer, db.ForeignKey('place.id'))
    
    def __repr__(self):
        return f'<Activity {self.title}>'

class Place(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    type = db.Column(db.String(20))  # hotel, restaurant, attraction, transport
    rating = db.Column(db.Float)
    price_level = db.Column(db.Integer)  # 1-4, representing $-$$$$
    image_url = db.Column(db.String(255))
    website = db.Column(db.String(255))
    phone = db.Column(db.String(20))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    activities = db.relationship('Activity', backref='place', lazy=True)
    
    def __repr__(self):
        return f'<Place {self.name} - {self.city}, {self.country}>'

class Checklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Chave estrangeira
    itinerary_id = db.Column(db.Integer, db.ForeignKey('itinerary.id'), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('checklist_template.id'))
    
    # Relacionamentos
    items = db.relationship('ChecklistItem', backref='checklist', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Checklist {self.name}>'

class ChecklistTemplate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_public = db.Column(db.Boolean, default=False)
    type = db.Column(db.String(20))  # packing, preparation, activity
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Chave estrangeira
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relacionamentos
    items = db.relationship('ChecklistTemplateItem', backref='template', lazy=True, cascade='all, delete-orphan')
    checklists = db.relationship('Checklist', backref='template', lazy=True)
    
    def __repr__(self):
        return f'<ChecklistTemplate {self.name}>'

class ChecklistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    priority = db.Column(db.Integer, default=0)  # 0-low, 1-medium, 2-high
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    # Chave estrangeira
    checklist_id = db.Column(db.Integer, db.ForeignKey('checklist.id'), nullable=False)
    
    def __repr__(self):
        return f'<ChecklistItem {self.text[:20]}...>'

class ChecklistTemplateItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(255), nullable=False)
    priority = db.Column(db.Integer, default=0)  # 0-low, 1-medium, 2-high
    
    # Chave estrangeira
    template_id = db.Column(db.Integer, db.ForeignKey('checklist_template.id'), nullable=False)
    
    def __repr__(self):
        return f'<TemplateItem {self.text[:20]}...>'

class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total_budget = db.Column(db.Float)
    currency = db.Column(db.String(3), default='BRL')  # ISO currency code
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Chave estrangeira
    itinerary_id = db.Column(db.Integer, db.ForeignKey('itinerary.id'), nullable=False)
    
    # Relacionamentos
    categories = db.relationship('BudgetCategory', backref='budget', lazy=True, cascade='all, delete-orphan')
    expenses = db.relationship('Expense', backref='budget', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Budget {self.total_budget} {self.currency} for Itinerary {self.itinerary_id}>'

class BudgetCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    planned_amount = db.Column(db.Float)
    color = db.Column(db.String(7))  # Hex color code
    
    # Chave estrangeira
    budget_id = db.Column(db.Integer, db.ForeignKey('budget.id'), nullable=False)
    
    # Relacionamentos
    expenses = db.relationship('Expense', backref='category', lazy=True)
    
    def __repr__(self):
        return f'<BudgetCategory {self.name}>'

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow)
    payment_method = db.Column(db.String(50))
    receipt_image_url = db.Column(db.String(255))
    is_paid = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Chaves estrangeiras
    budget_id = db.Column(db.Integer, db.ForeignKey('budget.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('budget_category.id'))
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'))
    
    def __repr__(self):
        return f'<Expense {self.description} - {self.amount}>'