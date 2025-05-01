// Map functionality using Google Maps
let map = null;
let markers = [];
let infoWindow = null;

// Initialize the map - This function will be called automatically by Google Maps API when loaded
function initMap() {
  // Check if map container exists
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found');
    return;
  }
  
  try {
    // Initialize the map with default options
    map = new google.maps.Map(mapContainer, {
      center: { lat: 48.8566, lng: 2.3522 }, // Default to Paris
      zoom: 12,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false
    });
    
    // Create a single InfoWindow instance to reuse for all markers
    infoWindow = new google.maps.InfoWindow();
    
    // Add event listener to close infowindow when clicking on the map
    google.maps.event.addListener(map, 'click', function() {
      infoWindow.close();
    });
    
    // Load map pins if we have an itinerary
    if (appState && appState.currentItinerary) {
      loadMapPins();
    }
    
    // Add a "Center on Destination" button
    const centerControlDiv = document.createElement('div');
    centerControlDiv.classList.add('map-center-control');
    centerControlDiv.innerHTML = '<button type="button" class="btn btn-sm btn-primary shadow"><i class="fas fa-crosshairs me-1"></i> Recentrar</button>';
    centerControlDiv.onclick = function() {
      centerMapOnDestination();
    };
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);
    
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
        <p class="text-center text-muted">Configure a chave de API do Google Maps para visualizar o mapa.</p>
      </div>
    `;
  }
}

// Center map on destination coordinates
function centerMapOnDestination() {
  if (!map || !appState || !appState.currentItinerary) return;
  
  // If we have coordinates for the destination, center the map there
  if (appState.currentItinerary.locationCoordinates) {
    map.setCenter({
      lat: appState.currentItinerary.locationCoordinates.lat,
      lng: appState.currentItinerary.locationCoordinates.lng
    });
    map.setZoom(12);
  }
}

// Load pins from the current itinerary
function loadMapPins() {
  if (!map || !appState || !appState.currentItinerary) return;
  
  // Clear existing markers
  clearMapMarkers();
  
  // If we have coordinates for the destination, center the map there
  if (appState.currentItinerary.locationCoordinates) {
    map.setCenter({
      lat: appState.currentItinerary.locationCoordinates.lat,
      lng: appState.currentItinerary.locationCoordinates.lng
    });
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
      map.setCenter({ lat: 35.6804, lng: 139.7690 });
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
      createMapPin(pin);
    });
    
    // Update the POI list in the UI
    updatePoiList(dummyPins);
    
  } else {
    // Add real pins from the itinerary
    pins.forEach(pin => {
      createMapPin(pin);
    });
    
    // Update the POI list in the UI
    updatePoiList(pins);
  }
}

// Create a map pin/marker
function createMapPin(pin) {
  if (!map) return;
  
  // Define marker icon based on type
  const icon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: getPinColor(pin.type),
    fillOpacity: 0.9,
    strokeWeight: 1,
    strokeColor: '#ffffff',
    scale: 10
  };
  
  // Create the marker
  const marker = new google.maps.Marker({
    position: { lat: pin.coordinates.lat, lng: pin.coordinates.lng },
    map: map,
    icon: icon,
    title: pin.name,
    animation: google.maps.Animation.DROP
  });
  
  // Create info window content
  const content = `
    <div class="map-pin-info">
      <h5>${pin.name}</h5>
      <p>${pin.description || ''}</p>
      <p><small>Dia ${pin.dayId || '?'}</small></p>
      <button class="btn btn-sm btn-primary view-details-btn">Ver detalhes</button>
    </div>
  `;
  
  // Add click listener to show info window and register detail button
  marker.addListener('click', () => {
    // Close any open infowindow
    infoWindow.close();
    
    // Set content and open
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
    
    // Add event listener to view details button after infowindow is opened
    setTimeout(() => {
      const viewDetailsBtn = document.querySelector('.view-details-btn');
      if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', () => {
          showPinDetails(pin);
          infoWindow.close();
        });
      }
    }, 100);
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
  markers.forEach(marker => marker.setMap(null));
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
      marker.setVisible(true);
    });
    
    // Show all POIs in the list
    document.querySelectorAll('#poi-list .list-group-item').forEach(item => {
      item.style.display = 'flex';
    });
  } else {
    // Filter markers by type
    const pins = appState.currentItinerary.pointsOfInterest || [];
    
    markers.forEach((marker, index) => {
      const pinType = index < pins.length ? pins[index].type : 'other';
      marker.setVisible(pinType === type);
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
        map.setCenter({
          lat: pin.coordinates.lat,
          lng: pin.coordinates.lng
        });
        map.setZoom(15);
        
        // Open the popup for this marker
        const marker = markers.find(m => 
          m.getPosition().lat() === pin.coordinates.lat && 
          m.getPosition().lng() === pin.coordinates.lng
        );
        
        if (marker) {
          // Trigger a click on the marker to open its info window
          new google.maps.event.trigger(marker, 'click');
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