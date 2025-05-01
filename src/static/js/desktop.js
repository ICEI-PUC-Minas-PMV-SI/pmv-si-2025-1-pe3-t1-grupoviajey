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
  // In a real app, this would open the itinerary creation modal
  // or navigate to the itinerary builder page
  alert('Começando um novo roteiro de viagem...');
  // window.location.href = '/itinerary/new';
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

// In a real application, you would have more functionality here
// such as viewing itineraries, saving filters, etc.