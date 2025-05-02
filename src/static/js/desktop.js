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
  // Usar o modal já existente no HTML em vez de criar um novo
  const modal = document.getElementById('createItineraryModal');
  if (modal) {
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  } else {
    console.error("Modal 'createItineraryModal' não encontrado no HTML");
  }
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

// Inicializar o formulário para o modal existente
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar event listener para o botão "Criar Roteiro" no modal fixo
  const saveItineraryBtn = document.getElementById('saveItineraryBtn');
  if (saveItineraryBtn) {
    saveItineraryBtn.addEventListener('click', function() {
      // Obter dados do formulário
      const itineraryName = document.getElementById('itineraryName').value;
      const destination = document.getElementById('destination').value;
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      
      // Validação básica
      if (!itineraryName || !destination || !startDate || !endDate) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      // Processar e criar itinerário
      console.log('Criando roteiro:', { itineraryName, destination, startDate, endDate });
      
      // Fechar modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('createItineraryModal'));
      if (modal) modal.hide();
      
      // Redirecionar para a página de itinerário
      window.location.href = `/itinerary-kanban.html?name=${encodeURIComponent(itineraryName)}&destination=${encodeURIComponent(destination)}`;
    });
  }
});