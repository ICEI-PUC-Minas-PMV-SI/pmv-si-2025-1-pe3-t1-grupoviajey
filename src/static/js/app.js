// Main Application JavaScript for Viajey App

// App state management
const appState = {
  currentScreen: 'onboarding',
  user: {
    name: 'Traveler',
    preferences: {
      travelGoal: '',
      travelDays: 0,
      travelStyle: '',
      planningStyle: ''
    }
  },
  itineraries: [],
  currentItinerary: {
    id: null,
    title: '',
    destination: '',
    days: [],
    checklist: []
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  // Load saved data from localStorage
  loadFromLocalStorage();
  
  // Show initial screen
  showScreen('onboarding');
  
  // Set up event listeners
  setupEventListeners();
});

// Screen navigation
function showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show requested screen
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.add('active');
    appState.currentScreen = screenId;
    
    // Perform any screen-specific initialization
    initializeScreen(screenId);
  }
}

// Screen-specific initialization
function initializeScreen(screenId) {
  switch(screenId) {
    case 'home':
      renderHomeScreen();
      break;
    case 'itinerary':
      renderItineraryBuilder();
      break;
    case 'checklist':
      renderChecklist();
      break;
    case 'map':
      renderMap();
      break;
    case 'share':
      renderShareScreen();
      break;
    case 'profile':
      renderProfileScreen();
      break;
    default:
      break;
  }
}

// Set up event listeners for all interactive elements
function setupEventListeners() {
  // Onboarding form
  document.getElementById('onboardingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    processOnboardingAnswers();
    showScreen('home');
  });
  
  // Option cards in onboarding
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', function() {
      const questionGroup = this.closest('.onboarding-question');
      questionGroup.querySelectorAll('.option-card').forEach(c => {
        c.classList.remove('selected');
      });
      this.classList.add('selected');
    });
  });
  
  // Navigation buttons
  document.querySelectorAll('[data-navigate]').forEach(button => {
    button.addEventListener('click', function() {
      const targetScreen = this.getAttribute('data-navigate');
      showScreen(targetScreen);
    });
  });
  
  // New itinerary button
  document.getElementById('newItineraryBtn').addEventListener('click', () => {
    createNewItinerary();
    showScreen('itinerary');
  });
  
  // Add activity buttons
  document.getElementById('addPlaceBtn').addEventListener('click', () => {
    addNewActivity('place');
  });
  
  document.getElementById('addActivityBtn').addEventListener('click', () => {
    addNewActivity('activity');
  });
  
  document.getElementById('addTransportBtn').addEventListener('click', () => {
    addNewActivity('transport');
  });
  
  document.getElementById('addAccommodationBtn').addEventListener('click', () => {
    addNewActivity('accommodation');
  });
  
  // Add day button
  document.getElementById('addDayBtn').addEventListener('click', () => {
    addNewDay();
  });
  
  // Save itinerary button
  document.getElementById('saveItineraryBtn').addEventListener('click', () => {
    saveCurrentItinerary();
    showScreen('home');
  });
  
  // Add checklist item
  document.getElementById('addChecklistItemBtn').addEventListener('click', () => {
    addChecklistItem();
  });
  
  // Copy share link
  document.getElementById('copyLinkBtn').addEventListener('click', () => {
    copyShareLink();
  });
  
  // Reset all data
  document.getElementById('resetDataBtn').addEventListener('click', () => {
    resetAllData();
  });
  
  // Checklist form
  document.getElementById('newChecklistForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addChecklistItem();
  });
}

// Process onboarding answers
function processOnboardingAnswers() {
  // Travel goal
  const goalOptions = document.querySelectorAll('.goal-option');
  goalOptions.forEach(option => {
    if (option.classList.contains('selected')) {
      appState.user.preferences.travelGoal = option.getAttribute('data-value');
    }
  });
  
  // Travel days
  const daysOptions = document.querySelectorAll('.days-option');
  daysOptions.forEach(option => {
    if (option.classList.contains('selected')) {
      appState.user.preferences.travelDays = parseInt(option.getAttribute('data-value'));
    }
  });
  
  // Travel style
  const styleOptions = document.querySelectorAll('.style-option');
  styleOptions.forEach(option => {
    if (option.classList.contains('selected')) {
      appState.user.preferences.travelStyle = option.getAttribute('data-value');
    }
  });
  
  // Planning style
  const planningOptions = document.querySelectorAll('.planning-option');
  planningOptions.forEach(option => {
    if (option.classList.contains('selected')) {
      appState.user.preferences.planningStyle = option.getAttribute('data-value');
    }
  });
  
  // Save to localStorage
  saveToLocalStorage();
}

// Create a new itinerary
function createNewItinerary() {
  const newItinerary = {
    id: Date.now(),
    title: 'New Trip',
    destination: 'Choose Destination',
    days: [{
      dayNumber: 1,
      morning: [],
      afternoon: [],
      evening: []
    }],
    checklist: []
  };
  
  appState.currentItinerary = newItinerary;
  
  // Pre-fill checklist based on preferences
  generateSmartChecklist();
}

// Generate smart checklist based on user preferences
function generateSmartChecklist() {
  const checklist = [];
  
  // Basic items for all trips
  checklist.push({ id: Date.now(), text: 'Passport/ID', checked: false });
  checklist.push({ id: Date.now() + 1, text: 'Travel insurance', checked: false });
  checklist.push({ id: Date.now() + 2, text: 'Phone charger', checked: false });
  
  // Add items based on travel goal
  switch(appState.user.preferences.travelGoal) {
    case 'relax':
      checklist.push({ id: Date.now() + 3, text: 'Books/E-reader', checked: false });
      checklist.push({ id: Date.now() + 4, text: 'Beach towel', checked: false });
      break;
    case 'adventure':
      checklist.push({ id: Date.now() + 3, text: 'Hiking boots', checked: false });
      checklist.push({ id: Date.now() + 4, text: 'First aid kit', checked: false });
      break;
    case 'family':
      checklist.push({ id: Date.now() + 3, text: 'Games/Entertainment', checked: false });
      checklist.push({ id: Date.now() + 4, text: 'Snacks', checked: false });
      break;
    case 'spiritual':
      checklist.push({ id: Date.now() + 3, text: 'Meditation items', checked: false });
      checklist.push({ id: Date.now() + 4, text: 'Comfortable clothing', checked: false });
      break;
  }
  
  // Add items based on travel style
  if (appState.user.preferences.travelStyle === 'economy') {
    checklist.push({ id: Date.now() + 5, text: 'Water bottle', checked: false });
  } else if (appState.user.preferences.travelStyle === 'luxury') {
    checklist.push({ id: Date.now() + 5, text: 'Formal attire', checked: false });
  }
  
  appState.currentItinerary.checklist = checklist;
}

// Render home screen with personalized content
function renderHomeScreen() {
  const savedTrips = document.getElementById('savedTrips');
  savedTrips.innerHTML = '';
  
  if (appState.itineraries.length === 0) {
    savedTrips.innerHTML = '<div class="alert alert-info">No saved trips yet. Create your first itinerary!</div>';
  } else {
    // Render saved itineraries
    appState.itineraries.forEach(itinerary => {
      const tripCard = document.createElement('div');
      tripCard.className = 'col-md-4 mb-4';
      tripCard.innerHTML = `
        <div class="travel-card card">
          <img src="https://images.unsplash.com/photo-1605130284535-11dd9eedc58a" class="card-img-top" alt="${itinerary.destination}">
          <div class="card-body">
            <h5 class="card-title">${itinerary.title}</h5>
            <p class="card-text">${itinerary.destination} • ${itinerary.days.length} days</p>
            <button class="btn btn-sm btn-secondary edit-trip-btn" data-id="${itinerary.id}">Edit Trip</button>
          </div>
        </div>
      `;
      savedTrips.appendChild(tripCard);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-trip-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tripId = parseInt(this.getAttribute('data-id'));
        loadItinerary(tripId);
        showScreen('itinerary');
      });
    });
  }
  
  // Update recommendation section based on preferences
  updateRecommendations();
}

// Update the recommendations section based on user preferences
function updateRecommendations() {
  const recommendationsContainer = document.getElementById('recommendations');
  recommendationsContainer.innerHTML = '';
  
  // Define recommendation data
  const recommendations = [
    {
      title: 'Beach Paradise',
      description: 'Perfect for relaxation and unwinding',
      image: 'https://images.unsplash.com/photo-1554366347-897a5113f6ab',
      type: 'relax'
    },
    {
      title: 'Mountain Trek',
      description: 'Adventure awaits in the peaks',
      image: 'https://images.unsplash.com/photo-1606944331341-72bf6523ff5e',
      type: 'adventure'
    },
    {
      title: 'Cultural Tour',
      description: 'Explore historical sites and local traditions',
      image: 'https://images.unsplash.com/photo-1594661745200-810105bcf054',
      type: 'cultural'
    },
    {
      title: 'Family Resort',
      description: 'Fun activities for all ages',
      image: 'https://images.unsplash.com/photo-1484910292437-025e5d13ce87',
      type: 'family'
    },
    {
      title: 'Spiritual Retreat',
      description: 'Find inner peace and tranquility',
      image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd',
      type: 'spiritual'
    }
  ];
  
  // Filter recommendations based on user preferences
  let filteredRecommendations = recommendations;
  if (appState.user.preferences.travelGoal) {
    filteredRecommendations = recommendations.filter(rec => 
      rec.type === appState.user.preferences.travelGoal || Math.random() > 0.5
    );
  }
  
  // Limit to 3 recommendations
  filteredRecommendations = filteredRecommendations.slice(0, 3);
  
  // Create recommendation cards
  filteredRecommendations.forEach(rec => {
    const recCard = document.createElement('div');
    recCard.className = 'col-md-4 mb-4';
    recCard.innerHTML = `
      <div class="travel-card card">
        <img src="${rec.image}" class="card-img-top" alt="${rec.title}">
        <div class="card-body">
          <h5 class="card-title">${rec.title}</h5>
          <p class="card-text">${rec.description}</p>
          <button class="btn btn-sm btn-info recommendation-btn">Explore</button>
        </div>
      </div>
    `;
    recommendationsContainer.appendChild(recCard);
  });
  
  // Add event listeners to recommendation buttons
  document.querySelectorAll('.recommendation-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const title = this.closest('.card').querySelector('.card-title').textContent;
      createNewItineraryFromRecommendation(title);
      showScreen('itinerary');
    });
  });
}

// Create a new itinerary from a recommendation
function createNewItineraryFromRecommendation(title) {
  const newItinerary = {
    id: Date.now(),
    title: title,
    destination: title,
    days: [{
      dayNumber: 1,
      morning: [],
      afternoon: [],
      evening: []
    }],
    checklist: []
  };
  
  appState.currentItinerary = newItinerary;
  
  // Generate checklist items
  generateSmartChecklist();
}

// Render itinerary builder
function renderItineraryBuilder() {
  // Update title and destination
  document.getElementById('itineraryTitle').value = appState.currentItinerary.title;
  document.getElementById('itineraryDestination').value = appState.currentItinerary.destination;
  
  // Set up event listeners for title and destination changes
  document.getElementById('itineraryTitle').addEventListener('change', function() {
    appState.currentItinerary.title = this.value;
  });
  
  document.getElementById('itineraryDestination').addEventListener('change', function() {
    appState.currentItinerary.destination = this.value;
  });
  
  // Render days
  renderDays();
}

// Render days in the itinerary
function renderDays() {
  const daysContainer = document.getElementById('daysContainer');
  daysContainer.innerHTML = '';
  
  appState.currentItinerary.days.forEach((day, index) => {
    const dayElement = document.createElement('div');
    dayElement.className = 'day-block';
    dayElement.setAttribute('data-day', day.dayNumber);
    
    dayElement.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3>Day ${day.dayNumber}</h3>
        <button class="btn btn-sm btn-danger remove-day-btn" data-day="${day.dayNumber}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      
      <div class="time-section">
        <h5>Morning</h5>
        <div class="drop-zone morning-zone" data-day="${day.dayNumber}" data-time="morning">
          ${renderActivities(day.morning)}
        </div>
      </div>
      
      <div class="time-section">
        <h5>Afternoon</h5>
        <div class="drop-zone afternoon-zone" data-day="${day.dayNumber}" data-time="afternoon">
          ${renderActivities(day.afternoon)}
        </div>
      </div>
      
      <div class="time-section">
        <h5>Evening</h5>
        <div class="drop-zone evening-zone" data-day="${day.dayNumber}" data-time="evening">
          ${renderActivities(day.evening)}
        </div>
      </div>
    `;
    
    daysContainer.appendChild(dayElement);
  });
  
  // Add event listeners for remove day buttons
  document.querySelectorAll('.remove-day-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const dayNumber = parseInt(this.getAttribute('data-day'));
      removeDay(dayNumber);
    });
  });
  
  // Set up drag and drop functionality
  initDragAndDrop();
}

// Render activities for a time section
function renderActivities(activities) {
  if (!activities || activities.length === 0) {
    return '';
  }
  
  let html = '';
  activities.forEach(activity => {
    html += `
      <div class="activity-item" draggable="true" data-id="${activity.id}">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="badge bg-${getActivityTypeBadge(activity.type)} me-2">${activity.type}</span>
            ${activity.text}
          </div>
          <button class="btn btn-sm btn-link text-danger remove-activity-btn" data-id="${activity.id}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  return html;
}

// Get badge color for activity type
function getActivityTypeBadge(type) {
  switch(type) {
    case 'place': return 'primary';
    case 'activity': return 'success';
    case 'transport': return 'warning';
    case 'accommodation': return 'info';
    default: return 'secondary';
  }
}

// Add a new activity to the current day
function addNewActivity(type) {
  // Prompt for activity details
  const activityText = prompt(`Enter ${type} details:`);
  if (!activityText) return;
  
  // Create new activity
  const newActivity = {
    id: Date.now(),
    type: type,
    text: activityText
  };
  
  // Get current day (default to first day)
  const currentDay = appState.currentItinerary.days[0];
  
  // Add to morning by default (user can drag to reposition)
  currentDay.morning.push(newActivity);
  
  // Rerender days
  renderDays();
}

// Add a new day to the itinerary
function addNewDay() {
  // Calculate the next day number
  const nextDayNumber = appState.currentItinerary.days.length + 1;
  
  // Create a new day
  const newDay = {
    dayNumber: nextDayNumber,
    morning: [],
    afternoon: [],
    evening: []
  };
  
  // Add to days array
  appState.currentItinerary.days.push(newDay);
  
  // Rerender days
  renderDays();
}

// Remove a day from the itinerary
function removeDay(dayNumber) {
  if (appState.currentItinerary.days.length <= 1) {
    alert("You can't remove the only day in your itinerary.");
    return;
  }
  
  // Confirm deletion
  if (!confirm(`Are you sure you want to remove Day ${dayNumber}?`)) {
    return;
  }
  
  // Remove the day
  appState.currentItinerary.days = appState.currentItinerary.days.filter(day => day.dayNumber !== dayNumber);
  
  // Renumber remaining days
  appState.currentItinerary.days.forEach((day, index) => {
    day.dayNumber = index + 1;
  });
  
  // Rerender days
  renderDays();
}

// Save the current itinerary
function saveCurrentItinerary() {
  // Remove any existing itinerary with the same ID
  appState.itineraries = appState.itineraries.filter(itinerary => itinerary.id !== appState.currentItinerary.id);
  
  // Add the current itinerary to the itineraries array
  appState.itineraries.push(appState.currentItinerary);
  
  // Save to localStorage
  saveToLocalStorage();
  
  alert('Itinerary saved successfully!');
}

// Load an itinerary for editing
function loadItinerary(itineraryId) {
  const itinerary = appState.itineraries.find(i => i.id === itineraryId);
  if (itinerary) {
    appState.currentItinerary = JSON.parse(JSON.stringify(itinerary)); // Deep copy
  }
}

// Render checklist
function renderChecklist() {
  const checklistContainer = document.getElementById('checklistContainer');
  const checklistProgress = document.getElementById('checklistProgress');
  
  checklistContainer.innerHTML = '';
  
  if (!appState.currentItinerary.checklist || appState.currentItinerary.checklist.length === 0) {
    checklistContainer.innerHTML = '<div class="alert alert-info">No items in your checklist yet. Add your first item!</div>';
    checklistProgress.style.width = '0%';
    checklistProgress.textContent = '0%';
    return;
  }
  
  // Count checked items
  const totalItems = appState.currentItinerary.checklist.length;
  const checkedItems = appState.currentItinerary.checklist.filter(item => item.checked).length;
  const progressPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  
  // Update progress bar
  checklistProgress.style.width = progressPercentage + '%';
  checklistProgress.textContent = progressPercentage + '%';
  
  // Render checklist items
  appState.currentItinerary.checklist.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = `checklist-item ${item.checked ? 'checked' : ''}`;
    
    itemElement.innerHTML = `
      <input type="checkbox" id="check-${item.id}" ${item.checked ? 'checked' : ''}>
      <label for="check-${item.id}">${item.text}</label>
      <button class="btn btn-sm btn-link text-danger ms-auto remove-checklist-btn" data-id="${item.id}">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    checklistContainer.appendChild(itemElement);
    
    // Add event listener for checkbox
    itemElement.querySelector('input[type="checkbox"]').addEventListener('change', function() {
      toggleChecklistItem(item.id);
    });
    
    // Add event listener for remove button
    itemElement.querySelector('.remove-checklist-btn').addEventListener('click', function() {
      removeChecklistItem(item.id);
    });
  });
}

// Add a new checklist item
function addChecklistItem() {
  const itemText = document.getElementById('newChecklistItem').value.trim();
  
  if (!itemText) {
    alert('Please enter an item description.');
    return;
  }
  
  // Create new item
  const newItem = {
    id: Date.now(),
    text: itemText,
    checked: false
  };
  
  // Add to checklist
  appState.currentItinerary.checklist.push(newItem);
  
  // Clear input field
  document.getElementById('newChecklistItem').value = '';
  
  // Rerender checklist
  renderChecklist();
}

// Toggle checklist item checked status
function toggleChecklistItem(itemId) {
  const item = appState.currentItinerary.checklist.find(i => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    renderChecklist();
  }
}

// Remove a checklist item
function removeChecklistItem(itemId) {
  appState.currentItinerary.checklist = appState.currentItinerary.checklist.filter(item => item.id !== itemId);
  renderChecklist();
}

// Render map screen
function renderMap() {
  // The actual map functionality is in map.js
  // This just ensures the container is properly sized
  const mapContainer = document.getElementById('mapContainer');
  mapContainer.innerHTML = `
    <img src="https://images.unsplash.com/photo-1738601077283-9215e4f2a098" class="img-fluid" alt="Map">
  `;
}

// Render share screen
function renderShareScreen() {
  // Generate share link (just JSON for this demo)
  const shareData = {
    itinerary: appState.currentItinerary
  };
  
  const shareLink = JSON.stringify(shareData);
  document.getElementById('shareLinkText').textContent = shareLink;
  
  // Update itinerary summary
  document.getElementById('shareItineraryTitle').textContent = appState.currentItinerary.title;
  document.getElementById('shareItineraryDestination').textContent = appState.currentItinerary.destination;
  document.getElementById('shareItineraryDays').textContent = appState.currentItinerary.days.length;
}

// Copy share link to clipboard
function copyShareLink() {
  const shareLink = document.getElementById('shareLinkText').textContent;
  
  navigator.clipboard.writeText(shareLink).then(() => {
    alert('Link copied to clipboard!');
  }).catch(err => {
    console.error('Could not copy text: ', err);
  });
}

// Render profile screen
function renderProfileScreen() {
  // Update user information
  document.getElementById('profileName').textContent = appState.user.name;
  
  // Update preferences
  document.getElementById('profileTravelGoal').textContent = appState.user.preferences.travelGoal || 'Not set';
  document.getElementById('profileTravelStyle').textContent = appState.user.preferences.travelStyle || 'Not set';
  
  // Update trip count
  document.getElementById('profileTripCount').textContent = appState.itineraries.length;
  
  // Update avatar with user initial
  const avatar = document.getElementById('profileAvatar');
  avatar.textContent = appState.user.name.charAt(0).toUpperCase();
}

// Save application state to localStorage
function saveToLocalStorage() {
  localStorage.setItem('viajeyAppState', JSON.stringify({
    user: appState.user,
    itineraries: appState.itineraries
  }));
}

// Load application state from localStorage
function loadFromLocalStorage() {
  const savedState = localStorage.getItem('viajeyAppState');
  
  if (savedState) {
    const parsedState = JSON.parse(savedState);
    appState.user = parsedState.user || appState.user;
    appState.itineraries = parsedState.itineraries || [];
  }
}

// Reset all data
function resetAllData() {
  if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
    localStorage.removeItem('viajeyAppState');
    appState.user = {
      name: 'Traveler',
      preferences: {
        travelGoal: '',
        travelDays: 0,
        travelStyle: '',
        planningStyle: ''
      }
    };
    appState.itineraries = [];
    appState.currentItinerary = {
      id: null,
      title: '',
      destination: '',
      days: [],
      checklist: []
    };
    
    showScreen('onboarding');
    alert('All data has been reset.');
  }
}
