// Desktop JavaScript for Viajey

// Application state
const appState = {
  currentUser: {
    name: 'Roberta',
    avatar: '/static/img/avatar-placeholder.jpg',
    preferences: {
      travelStyle: 'relaxar',
      interests: ['praia', 'cultura', 'gastronomia'],
      currency: 'BRL'
    }
  },
  itineraries: [
    {
      id: 'japan-2024',
      title: 'Japão Exótico',
      destination: 'Japão',
      startDate: '2024-03-15',
      endDate: '2024-03-28',
      image: '/static/img/destinations/japan.jpg',
      status: 'planning'
    },
    {
      id: 'punta-cana-2024',
      title: 'Relaxar em Punta Cana',
      destination: 'Punta Cana',
      image: '/static/img/destinations/punta-cana.jpg',
      isCollaborative: true,
      status: 'planning'
    },
    {
      id: 'paraty-2023',
      title: 'Passeio de barco em Paraty',
      destination: 'Paraty',
      image: '/static/img/destinations/paraty.jpg',
      status: 'completed'
    }
  ],
  destinations: [
    {
      id: 'lisbon',
      name: 'Lisboa',
      image: '/static/img/destinations/lisboa.jpg',
      rating: 4.7,
      country: 'Portugal',
      tags: ['relaxar', 'cultura', 'gastronomia'],
      region: 'europa'
    },
    {
      id: 'salvador',
      name: 'Salvador',
      image: '/static/img/destinations/salvador.jpg',
      rating: 4.3,
      country: 'Brasil',
      tags: ['praia', 'cultura', 'gastronomia'],
      region: 'america-sul'
    },
    {
      id: 'barcelona',
      name: 'Barcelona',
      image: '/static/img/destinations/barcelona.jpg',
      rating: 4.6,
      country: 'Espanha',
      tags: ['cultura', 'gastronomia', 'arte'],
      region: 'europa'
    }
  ],
  activeFilters: {
    style: 'relaxar',
    duration: null,
    region: null
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  // Set up event listeners
  setupEventListeners();
  
  // Update UI with user data
  updateUserInfo();
  
  // Set up dropdown functionality
  setupUserDropdown();
  
  // Add current weather to hero section (would use OpenWeather API in production)
  // addCurrentWeather();
});

// Set up all event listeners
function setupEventListeners() {
  // New trip button
  const newTripBtn = document.querySelector('.new-trip-btn');
  if (newTripBtn) {
    newTripBtn.addEventListener('click', createNewItinerary);
  }
  
  // Start trip button in hero section
  const startTripBtn = document.querySelector('.start-trip-btn');
  if (startTripBtn) {
    startTripBtn.addEventListener('click', createNewItinerary);
  }
  
  // Filter chips
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', function() {
      // Remove active class from all chips in the same group
      const parentGroup = this.closest('.filter-chips');
      parentGroup.querySelectorAll('.filter-chip').forEach(c => {
        if (!c.contains(this)) {
          c.classList.remove('active');
        }
      });
      
      // Toggle active class on clicked chip
      this.classList.toggle('active');
      
      // Update filters and refresh destination list
      updateFilters();
    });
  });
  
  // Filter tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      document.querySelectorAll('.filter-tab').forEach(t => {
        t.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Update filters based on tab
      const filterType = this.textContent.toLowerCase();
      appState.activeFilters.style = filterType;
      
      // Refresh destination list
      filterDestinations();
    });
  });
}

// Create a new itinerary
function createNewItinerary() {
  // Open the itinerary creation modal
  openCreateItineraryModal();
}

// Update user information in the UI
function updateUserInfo() {
  // Update hero section greeting
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && appState.currentUser.name) {
    heroTitle.textContent = `Olá, ${appState.currentUser.name}! Vamos planejar sua próxima aventura?`;
  }
  
  // Update avatar
  const userAvatar = document.querySelector('.user-avatar img');
  if (userAvatar && appState.currentUser.avatar) {
    userAvatar.src = appState.currentUser.avatar;
    userAvatar.alt = `Avatar de ${appState.currentUser.name}`;
  }
}

// Update active filters
function updateFilters() {
  // Extract style filter
  const activeStyleChip = document.querySelector('.filter-chips .filter-chip.active');
  if (activeStyleChip) {
    appState.activeFilters.style = activeStyleChip.querySelector('span').textContent.toLowerCase();
  } else {
    appState.activeFilters.style = null;
  }
  
  // Extract duration filter
  // This is simplified; in a real app you would have proper handling
  // for multiple filter groups
  
  // Refresh destination list based on new filters
  filterDestinations();
}

// Filter destinations based on active filters
function filterDestinations() {
  // In a real app, this would apply the filters to the destinations list
  // and update the UI accordingly. Here we're just logging the filters.
  console.log('Filtering destinations with:', appState.activeFilters);
  
  // For demo purposes, highlight different filter rows
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    const tabContent = tab.textContent.toLowerCase();
    if (tabContent === appState.activeFilters.style) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// Format date for display
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('pt-BR', options);
}

// Set up the user dropdown menu functionality
function setupUserDropdown() {
  const avatarDropdown = document.getElementById('user-avatar-dropdown');
  const dropdownMenu = document.getElementById('user-dropdown');
  
  if (avatarDropdown && dropdownMenu) {
    // Toggle dropdown when avatar is clicked
    avatarDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!avatarDropdown.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });
  }
}

// Add weather information to the hero section
function addCurrentWeather() {
  // This would use OpenWeather API in a real application
  // For now, just add a placeholder weather widget
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    const weatherWidget = document.createElement('div');
    weatherWidget.className = 'weather-widget';
    weatherWidget.innerHTML = `
      <div class="current-weather">
        <i class="fas fa-sun"></i>
        <span class="temperature">28°C</span>
        <span class="location">Lisboa, PT</span>
      </div>
    `;
    
    heroContent.appendChild(weatherWidget);
  }
}

// Create a new itinerary modal
function openCreateItineraryModal() {
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'createItineraryModal';
  modal.setAttribute('tabindex', '-1');
  modal.setAttribute('aria-labelledby', 'createItineraryModalLabel');
  modal.setAttribute('aria-hidden', 'true');
  
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="createItineraryModalLabel">Criar Novo Roteiro</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="create-itinerary-form">
            <div class="mb-3">
              <label for="itinerary-name" class="form-label">Nome do Roteiro</label>
              <input type="text" class="form-control" id="itinerary-name" placeholder="Ex: Férias em Paris">
            </div>
            <div class="mb-3">
              <label for="itinerary-destination" class="form-label">Destino</label>
              <input type="text" class="form-control" id="itinerary-destination" placeholder="Ex: Paris, França">
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <label for="itinerary-start-date" class="form-label">Data Inicial</label>
                <input type="date" class="form-control" id="itinerary-start-date">
              </div>
              <div class="col-6">
                <label for="itinerary-end-date" class="form-label">Data Final</label>
                <input type="date" class="form-control" id="itinerary-end-date">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Preferências</label>
              <div class="preference-chips">
                <div class="preference-chip">
                  <input type="checkbox" id="preference-relaxation" class="preference-checkbox">
                  <label for="preference-relaxation">Relaxamento</label>
                </div>
                <div class="preference-chip">
                  <input type="checkbox" id="preference-gastronomy" class="preference-checkbox">
                  <label for="preference-gastronomy">Gastronomia</label>
                </div>
                <div class="preference-chip">
                  <input type="checkbox" id="preference-culture" class="preference-checkbox">
                  <label for="preference-culture">Cultura</label>
                </div>
                <div class="preference-chip">
                  <input type="checkbox" id="preference-adventure" class="preference-checkbox">
                  <label for="preference-adventure">Aventura</label>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Faixa de Preço</label>
              <div class="price-range">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="priceRange" id="price-economic" value="economic">
                  <label class="form-check-label" for="price-economic">Econômico</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="priceRange" id="price-moderate" value="moderate" checked>
                  <label class="form-check-label" for="price-moderate">Moderado</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="priceRange" id="price-luxury" value="luxury">
                  <label class="form-check-label" for="price-luxury">Luxo</label>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" id="create-itinerary-btn">Criar Roteiro</button>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to body
  document.body.appendChild(modal);
  
  // Initialize Bootstrap modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
  
  // Add event listener to create button
  const createButton = document.getElementById('create-itinerary-btn');
  if (createButton) {
    createButton.addEventListener('click', function() {
      // Process form data and create itinerary
      // ...
      
      // Close modal
      modalInstance.hide();
      
      // Show next step (would navigate to selection screens)
      alert('Roteiro criado! Redirecionando para escolha de hospedagem...');
    });
  }
}