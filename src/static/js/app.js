// Viajey - Main Application JavaScript

// State management for the app
const appState = {
  currentScreen: 'loading-screen',
  currentItinerary: null,
  userData: null,
  itineraries: [],
  recommendations: [
    {
      id: 'recommendation-1',
      title: 'Paris, França',
      description: '5 dias de cultura e gastronomia',
      image: '/static/img/destinations/paris.jpg'
    },
    {
      id: 'recommendation-2',
      title: 'Tokyo, Japão',
      description: '7 dias de aventura urbana',
      image: '/static/img/destinations/tokyo.jpg'
    }
  ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Simulate loading (would check authentication, load user data, etc.)
  setTimeout(() => {
    // For initial login/setup, show onboarding
    showScreen('onboarding-screen');
    
    // For returning users, would skip to homescreen
    // showScreen('home-screen');
    
    // Set up event listeners
    setupEventListeners();
  }, 2000);
});

// Show a specific screen and hide others
function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('d-none');
  });
  
  // Show the requested screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('d-none');
    appState.currentScreen = screenId;
    
    // Initialize the screen content
    initializeScreen(screenId);
  }
}

// Initialize screen-specific content
function initializeScreen(screenId) {
  switch(screenId) {
    case 'home-screen':
      renderHomeScreen();
      break;
    case 'itinerary-builder-screen':
      renderItineraryBuilder();
      break;
    case 'checklist-screen':
      renderChecklist();
      break;
    case 'map-screen':
      renderMap();
      break;
    case 'share-screen':
      renderShareScreen();
      break;
    case 'profile-screen':
      renderProfileScreen();
      break;
  }
}

// Set up event listeners for UI interactions
function setupEventListeners() {
  // Onboarding completion
  document.getElementById('complete-onboarding').addEventListener('click', () => {
    processOnboardingAnswers();
    showScreen('home-screen');
  });
  
  // New itinerary button
  document.getElementById('new-itinerary-btn').addEventListener('click', () => {
    createNewItinerary();
    showScreen('itinerary-builder-screen');
  });
  
  // Profile button
  document.getElementById('open-profile').addEventListener('click', () => {
    showScreen('profile-screen');
  });
  
  // Back buttons
  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', () => {
      if (appState.currentScreen.includes('itinerary') || 
          appState.currentScreen.includes('checklist') || 
          appState.currentScreen.includes('map') || 
          appState.currentScreen.includes('share')) {
        saveCurrentItinerary();
        showScreen('home-screen');
      } else if (appState.currentScreen === 'profile-screen') {
        showScreen('home-screen');
      }
    });
  });
  
  // Itinerary navigation
  document.querySelectorAll('.itinerary-nav .nav-item').forEach(navItem => {
    navItem.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      switch(target) {
        case 'itinerary':
          showScreen('itinerary-builder-screen');
          break;
        case 'checklist':
          showScreen('checklist-screen');
          break;
        case 'map':
          showScreen('map-screen');
          break;
        case 'share':
          showScreen('share-screen');
          break;
      }
    });
  });
  
  // Add day button
  document.getElementById('add-day-btn')?.addEventListener('click', () => {
    addNewDay();
  });
  
  // Activity modal save button
  document.getElementById('save-activity-btn')?.addEventListener('click', () => {
    // Read form data and add activity
    const activityTitle = document.getElementById('activity-title').value;
    const activityType = document.getElementById('activity-type').value;
    if (activityTitle) {
      addNewActivity(activityType);
      // Close the modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('activity-modal'));
      modal.hide();
    }
  });
  
  // Add checklist item button
  document.getElementById('add-checklist-item-btn')?.addEventListener('click', () => {
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('checklist-item-modal'));
    modal.show();
  });
  
  // Save checklist item button
  document.getElementById('save-checklist-item-btn')?.addEventListener('click', () => {
    addChecklistItem();
    // Close the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('checklist-item-modal'));
    modal.hide();
  });
  
  // Copy share link button
  document.getElementById('copy-share-link-btn')?.addEventListener('click', () => {
    copyShareLink();
  });
  
  // Checklist item checkboxes
  document.querySelectorAll('.checklist-items input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const itemId = e.target.closest('li').getAttribute('data-item-id');
      toggleChecklistItem(itemId);
    });
  });
  
  // Delete checklist item buttons
  document.querySelectorAll('.delete-item-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const itemId = e.target.closest('li').getAttribute('data-item-id');
      removeChecklistItem(itemId);
    });
  });
  
  // Map filter pills
  document.querySelectorAll('.filter-pills .badge').forEach(pill => {
    pill.addEventListener('click', (e) => {
      const filter = e.target.getAttribute('data-filter');
      filterMapPins(filter);
    });
  });
}

// Process onboarding form answers
function processOnboardingAnswers() {
  const travelStyle = document.getElementById('travel-style').value;
  const preferredTransport = document.getElementById('preferred-transport').value;
  
  // Save user preferences
  appState.userData = {
    preferences: {
      travelStyle,
      preferredTransport,
      theme: 'dark',
      language: 'pt-BR',
      currency: 'BRL'
    },
    level: 'beginner',
    points: 0,
    badges: [],
    trips: []
  };
  
  // Update recommendations based on preferences
  updateRecommendations();
  
  // Save to localStorage
  saveToLocalStorage();
}

// Create a new itinerary
function createNewItinerary() {
  appState.currentItinerary = {
    id: 'itinerary-' + Date.now(),
    title: '',
    destination: '',
    startDate: null,
    endDate: null,
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        date: null,
        activities: []
      }
    ],
    checklist: {
      items: [
        { id: 'item-1', text: 'Passaporte/RG', isChecked: false, category: 'documents', priority: 'high' },
        { id: 'item-2', text: 'Seguro viagem', isChecked: false, category: 'reservations', priority: 'high' },
        { id: 'item-3', text: 'Carregador de celular', isChecked: false, category: 'packing', priority: 'medium' }
      ]
    },
    budget: {
      total: 0,
      currency: 'BRL',
      expenses: []
    },
    pointsOfInterest: []
  };
}

// Generate a smart checklist based on destination
function generateSmartChecklist() {
  // This would be powered by an AI service, here we'll add some placeholders
  const destination = appState.currentItinerary.destination.toLowerCase();
  if (destination.includes('praia') || destination.includes('beach')) {
    appState.currentItinerary.checklist.items.push(
      { id: 'item-' + Date.now(), text: 'Protetor solar', isChecked: false, category: 'packing', priority: 'high' },
      { id: 'item-' + (Date.now()+1), text: 'Óculos de sol', isChecked: false, category: 'packing', priority: 'medium' },
      { id: 'item-' + (Date.now()+2), text: 'Traje de banho', isChecked: false, category: 'packing', priority: 'high' }
    );
  } else if (destination.includes('europa') || destination.includes('europe')) {
    appState.currentItinerary.checklist.items.push(
      { id: 'item-' + Date.now(), text: 'Adaptador de tomada', isChecked: false, category: 'packing', priority: 'high' },
      { id: 'item-' + (Date.now()+1), text: 'Converter moeda', isChecked: false, category: 'reservations', priority: 'medium' },
      { id: 'item-' + (Date.now()+2), text: 'Verificar roaming internacional', isChecked: false, category: 'reservations', priority: 'medium' }
    );
  }
}

// Render the home screen content
function renderHomeScreen() {
  // Update user level/stats
  if (appState.userData) {
    // Would display actual user data from server
  }
  
  // Render upcoming trips
  const upcomingTripsContainer = document.getElementById('upcoming-trips-list');
  if (upcomingTripsContainer) {
    if (appState.itineraries.length === 0) {
      upcomingTripsContainer.innerHTML = `
        <div class="trip-placeholder text-center p-5">
          <p>Você ainda não tem viagens planejadas.</p>
        </div>
      `;
    } else {
      // Would render user's itineraries
    }
  }
  
  // Set up recommendation click handlers
  document.querySelectorAll('.recommendation-card button').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.recommendation-card');
      const title = card.querySelector('.card-title').textContent;
      createNewItineraryFromRecommendation(title);
    });
  });
}

// Update recommendations based on user preferences
function updateRecommendations() {
  // This would fetch recommendations from server based on user preferences
  // For now, just use the static ones in appState
}

// Create new itinerary from recommendation
function createNewItineraryFromRecommendation(title) {
  createNewItinerary();
  appState.currentItinerary.title = title;
  
  // Set destination based on title
  const destination = title.split(',')[0].trim();
  appState.currentItinerary.destination = destination;
  
  // Generate a smart checklist
  generateSmartChecklist();
  
  // Go to itinerary builder
  showScreen('itinerary-builder-screen');
}

// Render the itinerary builder screen
function renderItineraryBuilder() {
  // Set form values from current itinerary
  if (appState.currentItinerary) {
    document.getElementById('itinerary-title').value = appState.currentItinerary.title || '';
    document.getElementById('itinerary-destination').value = appState.currentItinerary.destination || '';
    document.getElementById('itinerary-start-date').value = appState.currentItinerary.startDate || '';
    document.getElementById('itinerary-end-date').value = appState.currentItinerary.endDate || '';
    
    // Render days and activities
    renderDays();
  }
  
  // Add activity button handlers
  document.querySelectorAll('.add-activity-btn, .add-first-activity-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const dayElement = e.target.closest('.day-card');
      const dayNumber = dayElement ? parseInt(dayElement.getAttribute('data-day')) : 1;
      
      // Set up the modal for this day
      document.querySelector('#activity-modal .modal-title').textContent = `Nova Atividade - Dia ${dayNumber}`;
      document.querySelector('#activity-modal').setAttribute('data-day', dayNumber);
      
      // Show the modal
      const modal = new bootstrap.Modal(document.getElementById('activity-modal'));
      modal.show();
    });
  });
  
  // Remove day button handlers
  document.querySelectorAll('.remove-day-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const dayElement = e.target.closest('.day-card');
      const dayNumber = parseInt(dayElement.getAttribute('data-day'));
      removeDay(dayNumber);
    });
  });
}

// Render days and activities
function renderDays() {
  const daysContainer = document.getElementById('days-container');
  if (!daysContainer || !appState.currentItinerary) return;
  
  daysContainer.innerHTML = '';
  
  appState.currentItinerary.days.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'day-card card mb-3';
    dayElement.setAttribute('data-day', day.dayNumber);
    
    dayElement.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        <h4>Dia ${day.dayNumber}</h4>
        <div class="day-actions">
          <button class="btn btn-sm btn-link add-activity-btn">
            <i class="fas fa-plus-circle"></i>
          </button>
          ${day.dayNumber > 1 ? `<button class="btn btn-sm btn-link remove-day-btn">
            <i class="fas fa-trash"></i>
          </button>` : ''}
        </div>
      </div>
      <div class="card-body">
        <div class="activities-container" id="day-${day.dayNumber}-activities">
          ${day.activities.length > 0 ? 
            renderActivities(day.activities) :
            `<div class="activity-placeholder text-center p-3">
              <p class="text-muted">Nenhuma atividade adicionada.</p>
              <button class="btn btn-sm btn-outline-primary add-first-activity-btn">
                <i class="fas fa-plus me-1"></i> Adicionar Atividade
              </button>
            </div>`
          }
        </div>
      </div>
    `;
    
    daysContainer.appendChild(dayElement);
  });
  
  // Re-attach event listeners
  setupEventListeners();
}

// Render activities for a day
function renderActivities(activities) {
  if (!activities || activities.length === 0) return '';
  
  return activities.map(activity => `
    <div class="activity-card card" data-activity-id="${activity.id}" draggable="true">
      <div class="card-body">
        <div class="activity-type-badge">
          ${getActivityTypeBadge(activity.type)}
        </div>
        <h5 class="card-title">${activity.title}</h5>
        ${activity.startTime ? `<p class="card-text"><i class="fas fa-clock me-2"></i>${activity.startTime}${activity.endTime ? ` - ${activity.endTime}` : ''}</p>` : ''}
        ${activity.location ? `<p class="card-text"><i class="fas fa-map-marker-alt me-2"></i>${activity.location}</p>` : ''}
        ${activity.description ? `<p class="card-text">${activity.description}</p>` : ''}
        ${activity.cost ? `<p class="card-text"><i class="fas fa-coins me-2"></i>${activity.cost} ${activity.currency || 'BRL'}</p>` : ''}
        <div class="activity-actions mt-2">
          <button class="btn btn-sm btn-link edit-activity-btn">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-link remove-activity-btn">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Get badge for activity type
function getActivityTypeBadge(type) {
  const badges = {
    'place': '<span class="badge bg-success">Local</span>',
    'activity': '<span class="badge bg-primary">Atividade</span>',
    'transport': '<span class="badge bg-info">Transporte</span>',
    'accommodation': '<span class="badge bg-secondary">Hospedagem</span>',
    'meal': '<span class="badge bg-warning">Refeição</span>',
    'ticket': '<span class="badge bg-danger">Ingresso</span>',
    'other': '<span class="badge bg-light text-dark">Outro</span>'
  };
  
  return badges[type] || badges.other;
}

// Add new activity to the current itinerary
function addNewActivity(type) {
  if (!appState.currentItinerary) return;
  
  const modal = document.getElementById('activity-modal');
  const dayNumber = parseInt(modal.getAttribute('data-day'));
  const day = appState.currentItinerary.days.find(d => d.dayNumber === dayNumber);
  
  if (!day) return;
  
  const title = document.getElementById('activity-title').value;
  const startTime = document.getElementById('activity-start-time').value;
  const endTime = document.getElementById('activity-end-time').value;
  const location = document.getElementById('activity-location').value;
  const description = document.getElementById('activity-description').value;
  const cost = document.getElementById('activity-cost').value;
  const currency = document.getElementById('activity-currency').value;
  
  const newActivity = {
    id: 'activity-' + Date.now(),
    type: type,
    title: title,
    startTime: startTime,
    endTime: endTime,
    location: location,
    description: description,
    cost: cost ? parseFloat(cost) : null,
    currency: currency
  };
  
  day.activities.push(newActivity);
  
  // Re-render days
  renderDays();
  
  // Reset form
  document.getElementById('activity-form').reset();
}

// Add a new day to the itinerary
function addNewDay() {
  if (!appState.currentItinerary) return;
  
  const newDayNumber = appState.currentItinerary.days.length + 1;
  const newDay = {
    id: 'day-' + Date.now(),
    dayNumber: newDayNumber,
    date: null,
    activities: []
  };
  
  appState.currentItinerary.days.push(newDay);
  renderDays();
}

// Remove a day from the itinerary
function removeDay(dayNumber) {
  if (!appState.currentItinerary) return;
  
  // Find the day index
  const dayIndex = appState.currentItinerary.days.findIndex(day => day.dayNumber === dayNumber);
  
  if (dayIndex !== -1) {
    // Remove the day
    appState.currentItinerary.days.splice(dayIndex, 1);
    
    // Reorder day numbers
    appState.currentItinerary.days.forEach((day, index) => {
      day.dayNumber = index + 1;
    });
    
    // Re-render
    renderDays();
  }
}

// Save the current itinerary
function saveCurrentItinerary() {
  if (!appState.currentItinerary) return;
  
  // Update itinerary with form values
  appState.currentItinerary.title = document.getElementById('itinerary-title').value;
  appState.currentItinerary.destination = document.getElementById('itinerary-destination').value;
  appState.currentItinerary.startDate = document.getElementById('itinerary-start-date').value;
  appState.currentItinerary.endDate = document.getElementById('itinerary-end-date').value;
  
  // Check if itinerary is already in the list
  const existingIndex = appState.itineraries.findIndex(it => it.id === appState.currentItinerary.id);
  
  if (existingIndex !== -1) {
    // Update existing
    appState.itineraries[existingIndex] = appState.currentItinerary;
  } else {
    // Add new
    appState.itineraries.push(appState.currentItinerary);
  }
  
  // Save to localStorage
  saveToLocalStorage();
  
  // Would also save to server API
}

// Load an itinerary by ID
function loadItinerary(itineraryId) {
  const itinerary = appState.itineraries.find(it => it.id === itineraryId);
  if (itinerary) {
    appState.currentItinerary = itinerary;
    showScreen('itinerary-builder-screen');
  }
}

// Render the checklist screen
function renderChecklist() {
  if (!appState.currentItinerary) return;
  
  const checklistContainer = document.getElementById('checklist-items-container');
  if (!checklistContainer) return;
  
  // Clear previous items
  checklistContainer.innerHTML = '';
  
  // Render checklist items
  appState.currentItinerary.checklist.items.forEach(item => {
    const itemElement = document.createElement('li');
    itemElement.className = 'list-group-item d-flex align-items-center';
    itemElement.setAttribute('data-item-id', item.id);
    
    itemElement.innerHTML = `
      <input class="form-check-input me-3" type="checkbox" ${item.isChecked ? 'checked' : ''}>
      <span class="checklist-item-text ${item.isChecked ? 'text-decoration-line-through' : ''}">${item.text}</span>
      <div class="ms-auto">
        <button class="btn btn-sm btn-link delete-item-btn">
          <i class="fas fa-trash-alt text-danger"></i>
        </button>
      </div>
    `;
    
    checklistContainer.appendChild(itemElement);
  });
  
  // Update progress bar
  updateChecklistProgress();
  
  // Re-attach event listeners
  setupEventListeners();
}

// Add a new checklist item
function addChecklistItem() {
  if (!appState.currentItinerary) return;
  
  const text = document.getElementById('checklist-item-text').value;
  const category = document.getElementById('checklist-item-category').value;
  const priority = document.getElementById('checklist-item-priority').value;
  const dueDate = document.getElementById('checklist-item-duedate').value;
  const notes = document.getElementById('checklist-item-notes').value;
  
  if (!text) return;
  
  const newItem = {
    id: 'item-' + Date.now(),
    text: text,
    isChecked: false,
    category: category,
    priority: priority,
    dueDate: dueDate || null,
    notes: notes || null
  };
  
  appState.currentItinerary.checklist.items.push(newItem);
  
  // Reset form
  document.getElementById('checklist-item-form').reset();
  
  // Re-render checklist
  renderChecklist();
}

// Toggle a checklist item's checked state
function toggleChecklistItem(itemId) {
  if (!appState.currentItinerary) return;
  
  const item = appState.currentItinerary.checklist.items.find(item => item.id === itemId);
  if (item) {
    item.isChecked = !item.isChecked;
    
    // Update UI
    const itemElement = document.querySelector(`li[data-item-id="${itemId}"] .checklist-item-text`);
    if (itemElement) {
      if (item.isChecked) {
        itemElement.classList.add('text-decoration-line-through');
      } else {
        itemElement.classList.remove('text-decoration-line-through');
      }
    }
    
    // Update progress
    updateChecklistProgress();
  }
}

// Remove a checklist item
function removeChecklistItem(itemId) {
  if (!appState.currentItinerary) return;
  
  const itemIndex = appState.currentItinerary.checklist.items.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    appState.currentItinerary.checklist.items.splice(itemIndex, 1);
    
    // Re-render checklist
    renderChecklist();
  }
}

// Update checklist progress bar
function updateChecklistProgress() {
  if (!appState.currentItinerary) return;
  
  const items = appState.currentItinerary.checklist.items;
  if (items.length === 0) {
    document.querySelector('.progress-bar').style.width = '0%';
    document.querySelector('.progress-text small').textContent = '0 de 0 itens completos';
    return;
  }
  
  const checkedItems = items.filter(item => item.isChecked).length;
  const progressPercentage = Math.round((checkedItems / items.length) * 100);
  
  document.querySelector('.progress-bar').style.width = `${progressPercentage}%`;
  document.querySelector('.progress-text small').textContent = `${checkedItems} de ${items.length} itens completos`;
}

// Render the map screen (would integrate with Mapbox)
function renderMap() {
  // This would integrate with Mapbox API
  // For now, display placeholder content
  const mapElement = document.getElementById('map');
  
  if (mapElement && typeof mapboxgl !== 'undefined') {
    try {
      mapboxgl.accessToken = 'YOUR_MAPBOX_API_KEY'; // Would be retrieved from environment variables
      
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-74.5, 40], // Default center
        zoom: 9
      });
      
      // Would add map markers for the itinerary points of interest
    } catch (error) {
      console.error('Error initializing map:', error);
      mapElement.innerHTML = '<div class="p-5 text-center"><p>Mapa não disponível no momento.</p></div>';
    }
  }
}

// Render the share screen
function renderShareScreen() {
  if (!appState.currentItinerary) return;
  
  // Update share preview card
  document.getElementById('share-itinerary-title').textContent = appState.currentItinerary.title || 'Meu Roteiro';
  document.getElementById('share-itinerary-destination').innerHTML = `<i class="fas fa-map-marker-alt me-2"></i>${appState.currentItinerary.destination || 'Destino não definido'}`;
  
  // Format dates
  let dateText = 'Datas não definidas';
  if (appState.currentItinerary.startDate && appState.currentItinerary.endDate) {
    const startDate = new Date(appState.currentItinerary.startDate);
    const endDate = new Date(appState.currentItinerary.endDate);
    dateText = `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
  } else if (appState.currentItinerary.startDate) {
    const startDate = new Date(appState.currentItinerary.startDate);
    dateText = `A partir de ${startDate.toLocaleDateString('pt-BR')}`;
  }
  document.getElementById('share-itinerary-dates').innerHTML = `<i class="fas fa-calendar-alt me-2"></i>${dateText}`;
  
  // Generate share link
  const shareUrl = `https://viajey.app/share/${appState.currentItinerary.id}`;
  document.getElementById('share-link-input').value = shareUrl;
  
  // Hide copy confirmation initially
  document.querySelector('.share-link .form-text').style.display = 'none';
}

// Copy share link to clipboard
function copyShareLink() {
  const linkInput = document.getElementById('share-link-input');
  linkInput.select();
  document.execCommand('copy');
  
  // Show copy confirmation
  const confirmation = document.querySelector('.share-link .form-text');
  confirmation.style.display = 'block';
  
  // Hide after 3 seconds
  setTimeout(() => {
    confirmation.style.display = 'none';
  }, 3000);
}

// Render the profile screen
function renderProfileScreen() {
  if (!appState.userData) return;
  
  // Set user details
  document.getElementById('profile-name').textContent = appState.userData.name || 'Viajante';
  document.getElementById('profile-email').textContent = appState.userData.email || 'usuario@exemplo.com';
  document.getElementById('profile-level').textContent = appState.userData.level || 'Viajante Iniciante';
  document.getElementById('profile-trips-count').textContent = appState.itineraries.length;
  document.getElementById('profile-countries-count').textContent = appState.userData.countriesVisited?.length || 0;
  document.getElementById('profile-points').textContent = appState.userData.points || 0;
  
  // Render trips list
  const tripsListContainer = document.getElementById('profile-trips-list');
  if (tripsListContainer) {
    if (appState.itineraries.length === 0) {
      tripsListContainer.innerHTML = `
        <div class="trip-placeholder text-center">
          <p>Você ainda não tem viagens.</p>
        </div>
      `;
    } else {
      tripsListContainer.innerHTML = appState.itineraries.map(trip => `
        <div class="card mb-2">
          <div class="card-body">
            <h5 class="card-title">${trip.title || 'Viagem sem título'}</h5>
            <p class="card-text">${trip.destination || 'Sem destino'}</p>
            <button class="btn btn-sm btn-primary open-trip-btn" data-trip-id="${trip.id}">Abrir</button>
          </div>
        </div>
      `).join('');
      
      // Add event listeners for trip cards
      document.querySelectorAll('.open-trip-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const tripId = e.target.getAttribute('data-trip-id');
          loadItinerary(tripId);
        });
      });
    }
  }
  
  // Set preference values
  document.getElementById('user-language').value = appState.userData.preferences?.language || 'pt-BR';
  document.getElementById('user-currency').value = appState.userData.preferences?.currency || 'BRL';
  document.getElementById('user-theme').value = appState.userData.preferences?.theme || 'dark';
  document.getElementById('notification-switch').checked = appState.userData.preferences?.notifications?.web || true;
}

// Save app state to localStorage
function saveToLocalStorage() {
  localStorage.setItem('viajey-state', JSON.stringify({
    userData: appState.userData,
    itineraries: appState.itineraries
  }));
}

// Load app state from localStorage
function loadFromLocalStorage() {
  const savedState = localStorage.getItem('viajey-state');
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    appState.userData = parsedState.userData;
    appState.itineraries = parsedState.itineraries;
    return true;
  }
  return false;
}

// Reset all data (for testing)
function resetAllData() {
  localStorage.removeItem('viajey-state');
  appState.userData = null;
  appState.itineraries = [];
  appState.currentItinerary = null;
  
  // Go back to onboarding
  showScreen('onboarding-screen');
}