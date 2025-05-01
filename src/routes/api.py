from flask import Blueprint, request, jsonify
from models.models import db, Itinerary, ItineraryDay, Place, Activity, User
from datetime import datetime
import os

api_bp = Blueprint('api', __name__)

@api_bp.route('/itineraries', methods=['GET'])
def get_itineraries():
    """Get all itineraries for the current user"""
    # In a real app, you would get the user_id from the session
    user_id = 1  # Hardcoded for demo
    
    itineraries = Itinerary.query.filter_by(user_id=user_id).all()
    result = []
    
    for itinerary in itineraries:
        result.append({
            'id': itinerary.id,
            'name': itinerary.name,
            'destination': itinerary.destination,
            'start_date': itinerary.start_date.strftime('%Y-%m-%d') if itinerary.start_date else None,
            'end_date': itinerary.end_date.strftime('%Y-%m-%d') if itinerary.end_date else None,
            'description': itinerary.description,
            'is_public': itinerary.is_public,
            'cover_image_url': itinerary.cover_image_url
        })
    
    return jsonify(result)

@api_bp.route('/itineraries', methods=['POST'])
def create_itinerary():
    """Create a new itinerary"""
    data = request.json
    
    # In a real app, you would get the user_id from the session
    user_id = 1  # Hardcoded for demo
    
    # Convert string dates to date objects
    start_date = None
    if 'start_date' in data and data['start_date']:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    
    end_date = None
    if 'end_date' in data and data['end_date']:
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
    
    # Create new itinerary
    new_itinerary = Itinerary(
        name=data['name'],
        destination=data['destination'],
        start_date=start_date,
        end_date=end_date,
        description=data.get('description', ''),
        is_public=data.get('is_public', False),
        user_id=user_id
    )
    
    db.session.add(new_itinerary)
    db.session.commit()
    
    return jsonify({
        'id': new_itinerary.id,
        'name': new_itinerary.name,
        'destination': new_itinerary.destination,
        'message': 'Itinerary created successfully'
    })

@api_bp.route('/itineraries/<int:itinerary_id>', methods=['GET'])
def get_itinerary(itinerary_id):
    """Get a specific itinerary"""
    itinerary = Itinerary.query.get_or_404(itinerary_id)
    
    # Check if the user has access to this itinerary (in a real app)
    
    result = {
        'id': itinerary.id,
        'name': itinerary.name,
        'destination': itinerary.destination,
        'start_date': itinerary.start_date.strftime('%Y-%m-%d') if itinerary.start_date else None,
        'end_date': itinerary.end_date.strftime('%Y-%m-%d') if itinerary.end_date else None,
        'description': itinerary.description,
        'is_public': itinerary.is_public,
        'cover_image_url': itinerary.cover_image_url,
        'user_id': itinerary.user_id,
        'days': []
    }
    
    # Add days and activities
    for day in itinerary.days:
        day_data = {
            'id': day.id,
            'day_number': day.day_number,
            'date': day.date.strftime('%Y-%m-%d') if day.date else None,
            'notes': day.notes,
            'activities': []
        }
        
        for activity in day.activities:
            activity_data = {
                'id': activity.id,
                'title': activity.title,
                'description': activity.description,
                'start_time': activity.start_time.strftime('%H:%M') if activity.start_time else None,
                'end_time': activity.end_time.strftime('%H:%M') if activity.end_time else None,
                'type': activity.type,
                'location': activity.location,
                'address': activity.address,
                'cost': activity.cost
            }
            day_data['activities'].append(activity_data)
        
        result['days'].append(day_data)
    
    return jsonify(result)

@api_bp.route('/places', methods=['GET'])
def get_places():
    """Get places based on filters"""
    # Get query parameters
    destination = request.args.get('destination')
    place_type = request.args.get('type')
    
    # Build the query
    query = Place.query
    
    if destination:
        query = query.filter(Place.city.ilike(f'%{destination}%'))
    
    if place_type:
        query = query.filter_by(type=place_type)
    
    # Execute the query
    places = query.all()
    result = []
    
    for place in places:
        result.append({
            'id': place.id,
            'name': place.name,
            'description': place.description,
            'address': place.address,
            'city': place.city,
            'country': place.country,
            'type': place.type,
            'rating': place.rating,
            'price_level': place.price_level,
            'image_url': place.image_url,
            'latitude': place.latitude,
            'longitude': place.longitude
        })
    
    return jsonify(result)

@api_bp.route('/itineraries/<int:itinerary_id>/add-place', methods=['POST'])
def add_place_to_itinerary(itinerary_id):
    """Add a place to an itinerary as an activity"""
    data = request.json
    
    # Get the itinerary
    itinerary = Itinerary.query.get_or_404(itinerary_id)
    
    # Get or create a day for this activity
    day_number = data.get('day_number', 1)
    day = next((d for d in itinerary.days if d.day_number == day_number), None)
    
    if not day:
        # Create a new day
        day = ItineraryDay(
            day_number=day_number,
            date=None,  # You can calculate this based on the start_date and day_number
            itinerary_id=itinerary.id
        )
        db.session.add(day)
    
    # Get the place if provided
    place_id = data.get('place_id')
    place = None
    if place_id:
        place = Place.query.get(place_id)
    
    # Create the activity
    activity = Activity(
        title=data['title'],
        description=data.get('description', ''),
        start_time=data.get('start_time'),
        end_time=data.get('end_time'),
        type=data.get('type', 'other'),
        location=data.get('location', ''),
        address=data.get('address', ''),
        cost=data.get('cost'),
        day_id=day.id,
        place_id=place_id if place else None
    )
    
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({
        'message': 'Place added to itinerary successfully',
        'activity_id': activity.id,
        'day_id': day.id
    })