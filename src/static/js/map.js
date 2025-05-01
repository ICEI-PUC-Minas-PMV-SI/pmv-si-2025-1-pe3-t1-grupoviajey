// Map functionality using Mapbox
let map = null;
let markers = [];

// Initialize the map
function initMap() {
  // Check if map container exists and Mapbox is loaded
  const mapContainer = document.getElementById('map');
  if (!mapContainer || typeof mapboxgl === 'undefined') {
    console.error('Map container not found or Mapbox not loaded');
    return;
  }
  
  // Check if we have an API key (would normally be provided as environment variable)
  // In a real app, this would be securely loaded from your backend
  // DO NOT hardcode API keys in production code
  let mapboxAccessToken = null;
  
  try {
    // Try to get API key from a meta tag set by the server
    const metaToken = document.querySelector('meta[name="mapbox-token"]');
    if (metaToken) {
      mapboxAccessToken = metaToken.getAttribute('content');
    }
    
    // If no token is available, use a fallback to show a placeholder
    if (!mapboxAccessToken) {
      showMapPlaceholder();
      return;
    }
    
    // Initialize the map
    mapboxgl.accessToken = mapboxAccessToken;
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [2.3522, 48.8566], // Default to Paris
      zoom: 12
    });
    
    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Setup event listeners
    map.on('load', () => {
      // Load map pins if we have an itinerary
      if (appState && appState.currentItinerary) {
        loadMapPins();
      }
    });
    
  } catch (error) {
    console.error('Error initializing map:', error);
    showMapPlaceholder();
  }
}

// Show a placeholder when map can't be loaded
function showMapPlaceholder() {
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.innerHTML = `
      <div class="map-placeholder p-4 d-flex flex-column justify-content-center align-items-center h-100">
        <i class="fas fa-map-marked-alt fa-3x mb-3 text-muted"></i>
        <h5 class="text-center">Mapa não disponível</h5>
        <p class="text-center text-muted">Configure a chave de API do Mapbox para visualizar o mapa.</p>
      </div>
    `;
  }
}

// Load pins from the current itinerary
function loadMapPins() {
  if (!map || !appState || !appState.currentItinerary) return;
  
  // Clear existing markers
  clearMapMarkers();
  
  // If we have coordinates for the destination, center the map there
  if (appState.currentItinerary.locationCoordinates) {
    map.setCenter([
      appState.currentItinerary.locationCoordinates.lng,
      appState.currentItinerary.locationCoordinates.lat
    ]);
  }
  
  // Add markers for all points of interest
  const pins = appState.currentItinerary.pointsOfInterest || [];
  
  if (pins.length === 0) {
    // Add dummy pins for preview
    const dummyPins = [
      {
        id: 'poi-1',
        name: 'Torre Eiffel',
        description: 'Atração turística icônica',
        type: 'attraction',
        coordinates: { lat: 48.858093, lng: 2.294694 },
        dayId: 1
      },
      {
        id: 'poi-2',
        name: 'Museu do Louvre',
        description: 'O maior museu de arte do mundo',
        type: 'attraction',
        coordinates: { lat: 48.8606, lng: 2.3376 },
        dayId: 1
      },
      {
        id: 'poi-3',
        name: 'Le Petit Café',
        description: 'Café tradicional francês',
        type: 'restaurant',
        coordinates: { lat: 48.8646, lng: 2.3324 },
        dayId: 2
      }
    ];
    
    // If the destination contains Tokyo, show Tokyo pins instead
    if (appState.currentItinerary.destination && 
        appState.currentItinerary.destination.toLowerCase().includes('tokyo')) {
      map.setCenter([139.7690, 35.6804]);
      dummyPins[0] = {
        id: 'poi-1',
        name: 'Tokyo Skytree',
        description: 'Torre de transmissão e observação',
        type: 'attraction',
        coordinates: { lat: 35.7101, lng: 139.8107 },
        dayId: 1
      };
      dummyPins[1] = {
        id: 'poi-2',
        name: 'Templo Senso-ji',
        description: 'Templo budista mais antigo de Tokyo',
        type: 'attraction',
        coordinates: { lat: 35.7147, lng: 139.7966 },
        dayId: 1
      };
      dummyPins[2] = {
        id: 'poi-3',
        name: 'Ichiran Ramen',
        description: 'Restaurante de ramen tradicional',
        type: 'restaurant',
        coordinates: { lat: 35.6595, lng: 139.7005 },
        dayId: 2
      };
    }
    
    // Add the dummy pins to the map
    dummyPins.forEach(pin => {
      createMapPin(mapContainer, pin);
    });
    
    // Update the POI list in the UI
    updatePoiList(dummyPins);
    
  } else {
    // Add real pins from the itinerary
    pins.forEach(pin => {
      createMapPin(mapContainer, pin);
    });
    
    // Update the POI list in the UI
    updatePoiList(pins);
  }
}

// Create a map pin/marker
function createMapPin(container, pin) {
  if (!map) return;
  
  // Create a marker element
  const el = document.createElement('div');
  el.className = 'map-marker';
  el.innerHTML = `<i class="${getPinIcon(pin.type)}"></i>`;
  el.style.color = getPinColor(pin.type);
  
  // Create a popup
  const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(`
      <h5>${pin.name}</h5>
      <p>${pin.description || ''}</p>
      <p><small>Dia ${pin.dayId || '?'}</small></p>
    `);
  
  // Create the marker
  const marker = new mapboxgl.Marker(el)
    .setLngLat([pin.coordinates.lng, pin.coordinates.lat])
    .setPopup(popup)
    .addTo(map);
  
  // Add click listener to open pin details
  el.addEventListener('click', () => {
    showPinDetails(pin);
  });
  
  // Store the marker for later reference
  markers.push(marker);
}

// Get icon for a pin type
function getPinIcon(type) {
  const icons = {
    'attraction': 'fas fa-monument',
    'restaurant': 'fas fa-utensils',
    'accommodation': 'fas fa-bed',
    'transport': 'fas fa-subway',
    'experience': 'fas fa-ticket-alt',
    'other': 'fas fa-map-pin'
  };
  
  return icons[type] || icons.other;
}

// Get color for a pin type
function getPinColor(type) {
  const colors = {
    'attraction': '#28a745', // green
    'restaurant': '#ffc107', // yellow
    'accommodation': '#6c757d', // gray
    'transport': '#17a2b8', // cyan
    'experience': '#dc3545', // red
    'other': '#007bff' // blue
  };
  
  return colors[type] || colors.other;
}

// Clear all markers from the map
function clearMapMarkers() {
  markers.forEach(marker => marker.remove());
  markers = [];
}

// Filter map pins by type
function filterMapPins(type) {
  // Update active state in the UI
  document.querySelectorAll('.filter-pills .badge').forEach(pill => {
    if (pill.getAttribute('data-filter') === type) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
  
  // Filter markers
  if (type === 'all') {
    // Show all markers
    markers.forEach(marker => {
      marker.getElement().style.display = 'block';
    });
    
    // Show all POIs in the list
    document.querySelectorAll('#poi-list .list-group-item').forEach(item => {
      item.style.display = 'flex';
    });
  } else {
    // Filter markers by type
    markers.forEach((marker, index) => {
      const pinType = appState.currentItinerary.pointsOfInterest[index]?.type || 'other';
      if (pinType === type) {
        marker.getElement().style.display = 'block';
      } else {
        marker.getElement().style.display = 'none';
      }
    });
    
    // Filter POIs in the list
    document.querySelectorAll('#poi-list .list-group-item').forEach(item => {
      const itemType = item.getAttribute('data-type');
      if (itemType === type) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  }
}

// Show detailed information about a map pin
function showPinDetails(pin) {
  // Update modal content
  document.getElementById('pin-title').textContent = pin.name;
  document.getElementById('pin-address').innerHTML = `<i class="fas fa-map-marker-alt me-2"></i>${pin.address || 'Endereço não disponível'}`;
  document.getElementById('pin-category').innerHTML = `<span class="badge bg-${getPinTypeClass(pin.type)}">${getPinTypeName(pin.type)}</span>`;
  document.getElementById('pin-description').textContent = pin.description || 'Sem descrição.';
  document.getElementById('pin-day').textContent = pin.dayId ? `Dia ${pin.dayId}` : 'Não agendado';
  document.getElementById('pin-time').textContent = pin.time || '--:--';
  
  // Open the modal
  const modal = new bootstrap.Modal(document.getElementById('map-pin-modal'));
  modal.show();
  
  // Add event listener to add the pin to itinerary
  document.getElementById('add-pin-to-itinerary-btn').onclick = () => {
    addPinToItinerary(pin);
    modal.hide();
  };
}

// Get CSS class for a pin type
function getPinTypeClass(type) {
  const classes = {
    'attraction': 'success',
    'restaurant': 'warning',
    'accommodation': 'secondary',
    'transport': 'info',
    'experience': 'danger',
    'other': 'primary'
  };
  
  return classes[type] || classes.other;
}

// Get display name for a pin type
function getPinTypeName(type) {
  const names = {
    'attraction': 'Atração',
    'restaurant': 'Restaurante',
    'accommodation': 'Hospedagem',
    'transport': 'Transporte',
    'experience': 'Experiência',
    'other': 'Outro'
  };
  
  return names[type] || names.other;
}

// Update the POI list in the UI
function updatePoiList(pins) {
  const poiList = document.getElementById('poi-list');
  if (!poiList) return;
  
  // Clear existing items
  poiList.innerHTML = '';
  
  // Add POIs to the list
  pins.forEach(pin => {
    const item = document.createElement('div');
    item.className = 'list-group-item d-flex';
    item.setAttribute('data-type', pin.type);
    item.setAttribute('data-id', pin.id);
    
    item.innerHTML = `
      <div class="poi-icon me-3">
        <i class="${getPinIcon(pin.type)} ${getTextColorClass(pin.type)}"></i>
      </div>
      <div class="poi-details">
        <h5 class="mb-1">${pin.name}</h5>
        <p class="mb-0 small">${getPinTypeName(pin.type)}${pin.dayId ? ` - Dia ${pin.dayId}` : ''}</p>
      </div>
      <div class="ms-auto d-flex align-items-center">
        <button class="btn btn-sm btn-link show-on-map-btn">
          <i class="fas fa-map-pin"></i>
        </button>
      </div>
    `;
    
    // Add event listener to show the pin on the map
    item.querySelector('.show-on-map-btn').addEventListener('click', () => {
      // Center the map on this pin
      if (map) {
        map.flyTo({
          center: [pin.coordinates.lng, pin.coordinates.lat],
          zoom: 15
        });
        
        // Open the popup for this marker
        const marker = markers.find(m => 
          m.getLngLat().lng === pin.coordinates.lng && 
          m.getLngLat().lat === pin.coordinates.lat
        );
        
        if (marker) {
          marker.togglePopup();
        }
      }
    });
    
    poiList.appendChild(item);
  });
}

// Get text color class for a pin type
function getTextColorClass(type) {
  const classes = {
    'attraction': 'text-success',
    'restaurant': 'text-warning',
    'accommodation': 'text-secondary',
    'transport': 'text-info',
    'experience': 'text-danger',
    'other': 'text-primary'
  };
  
  return classes[type] || classes.other;
}

// Add a pin to the itinerary
function addPinToItinerary(pin) {
  if (!appState.currentItinerary) return;
  
  // Get the day to add the pin to (default to the first day)
  let targetDayId = pin.dayId || 1;
  
  // Find the day
  const day = appState.currentItinerary.days.find(d => d.dayNumber === targetDayId);
  if (!day) return;
  
  // Create a new activity from the pin
  const newActivity = {
    id: 'activity-' + Date.now(),
    type: pin.type === 'restaurant' ? 'meal' : (pin.type === 'accommodation' ? 'accommodation' : 'place'),
    title: pin.name,
    description: pin.description,
    location: pin.address,
    coordinates: pin.coordinates,
    startTime: pin.time || null
  };
  
  // Add to the day's activities
  day.activities.push(newActivity);
  
  // Add to points of interest if not already there
  if (!appState.currentItinerary.pointsOfInterest.some(p => p.id === pin.id)) {
    appState.currentItinerary.pointsOfInterest.push({
      ...pin,
      activityId: newActivity.id,
      dayId: targetDayId
    });
  }
  
  // Save changes and notify the user
  saveCurrentItinerary();
  alert('Adicionado ao roteiro com sucesso!');
  
  // Would navigate to the itinerary screen in a real app
}