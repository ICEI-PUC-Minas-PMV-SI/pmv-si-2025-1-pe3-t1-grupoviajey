// Map functionality for the travel planner

// Sample map data (points of interest)
const mapPins = [
  {
    id: 1,
    name: 'Eiffel Tower',
    type: 'attraction',
    description: 'Iconic iron tower in Paris',
    position: { left: '48%', top: '35%' }
  },
  {
    id: 2,
    name: 'Louvre Museum',
    type: 'attraction',
    description: 'World-renowned art museum',
    position: { left: '52%', top: '37%' }
  },
  {
    id: 3,
    name: 'Café de Paris',
    type: 'restaurant',
    description: 'Traditional French cuisine',
    position: { left: '46%', top: '42%' }
  },
  {
    id: 4,
    name: 'Seine River Cruise',
    type: 'experience',
    description: 'Scenic boat tour along the Seine',
    position: { left: '50%', top: '40%' }
  },
  {
    id: 5,
    name: 'Notre-Dame Cathedral',
    type: 'attraction',
    description: 'Medieval Catholic cathedral',
    position: { left: '54%', top: '39%' }
  },
  {
    id: 6,
    name: 'Montmartre',
    type: 'attraction',
    description: 'Artistic hill and neighborhood',
    position: { left: '49%', top: '30%' }
  },
  {
    id: 7,
    name: 'Le Bistro',
    type: 'restaurant',
    description: 'Charming local eatery',
    position: { left: '43%', top: '38%' }
  },
  {
    id: 8,
    name: 'Wine Tasting Tour',
    type: 'experience',
    description: 'Guided wine tasting experience',
    position: { left: '57%', top: '44%' }
  }
];

// Initialize map functionality
function initMap() {
  const mapContainer = document.getElementById('mapContainer');
  if (!mapContainer) return;
  
  // Clear previous pins
  const existingPins = mapContainer.querySelectorAll('.map-pin, .map-pin-popup');
  existingPins.forEach(pin => pin.remove());
  
  // Place pins on the map
  mapPins.forEach(pin => {
    createMapPin(mapContainer, pin);
  });
  
  // Add event listeners for map filters
  document.querySelectorAll('.map-filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const filterType = this.getAttribute('data-filter');
      filterMapPins(filterType);
    });
  });
}

// Create a pin on the map
function createMapPin(container, pin) {
  // Create pin element
  const pinElement = document.createElement('div');
  pinElement.className = `map-pin map-pin-${pin.type}`;
  pinElement.style.left = pin.position.left;
  pinElement.style.top = pin.position.top;
  pinElement.setAttribute('data-id', pin.id);
  pinElement.setAttribute('data-type', pin.type);
  
  // Create popup element
  const popupElement = document.createElement('div');
  popupElement.className = 'map-pin-popup';
  popupElement.id = `popup-${pin.id}`;
  popupElement.style.left = `calc(${pin.position.left} + 15px)`;
  popupElement.style.top = `calc(${pin.position.top} - 70px)`;
  popupElement.innerHTML = `
    <h5>${pin.name}</h5>
    <p>${pin.description}</p>
    <button class="btn btn-sm btn-info add-to-itinerary-btn" data-id="${pin.id}">
      Add to Itinerary
    </button>
    <button class="btn btn-sm btn-secondary close-popup-btn">
      Close
    </button>
  `;
  
  // Add pin and popup to container
  container.appendChild(pinElement);
  container.appendChild(popupElement);
  
  // Add event listeners
  pinElement.addEventListener('click', function() {
    // Close all other popups
    document.querySelectorAll('.map-pin-popup').forEach(popup => {
      popup.classList.remove('active');
    });
    
    // Show this popup
    popupElement.classList.add('active');
  });
  
  // Close button
  popupElement.querySelector('.close-popup-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    popupElement.classList.remove('active');
  });
  
  // Add to itinerary button
  popupElement.querySelector('.add-to-itinerary-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    addPinToItinerary(pin);
    popupElement.classList.remove('active');
  });
}

// Filter map pins by type
function filterMapPins(type) {
  const allPins = document.querySelectorAll('.map-pin');
  
  if (type === 'all') {
    // Show all pins
    allPins.forEach(pin => {
      pin.style.display = 'block';
    });
  } else {
    // Show only pins of the selected type
    allPins.forEach(pin => {
      const pinType = pin.getAttribute('data-type');
      pin.style.display = pinType === type ? 'block' : 'none';
    });
  }
}

// Add map pin to itinerary
function addPinToItinerary(pin) {
  // First, check if there's an active itinerary
  if (!appState.currentItinerary.id) {
    alert('Please create or select an itinerary first.');
    return;
  }
  
  // Create a new activity based on the pin
  const activity = {
    id: Date.now(),
    type: pin.type === 'attraction' ? 'place' : 
          pin.type === 'restaurant' ? 'activity' : 'activity',
    text: pin.name
  };
  
  // Add to the first day's morning by default
  if (appState.currentItinerary.days.length > 0) {
    appState.currentItinerary.days[0].morning.push(activity);
    alert(`Added "${pin.name}" to your itinerary!`);
  } else {
    alert('Error: No days in your itinerary.');
  }
}

// Initialize map when the map screen is shown
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-navigate="map"]').forEach(el => {
    el.addEventListener('click', () => {
      // Small delay to ensure the map container is visible
      setTimeout(initMap, 100);
    });
  });
});
