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
  
  // Carregar itinerários do usuário da API
  fetchUserItineraries();
  
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
  // O Bootstrap agora gerencia o dropdown, então não precisamos de código personalizado para abrir/fechar
  // O logout já é gerenciado pelo auth_frontend.js
  
  // Atualizar a interface baseada no status de autenticação
  updateUserInterface();
}

// Atualiza a interface do usuário com base no status de autenticação
function updateUserInterface() {
  const isUserLoggedIn = window.AUTH && window.AUTH.isUserLoggedIn();
  const userData = isUserLoggedIn ? window.AUTH.getUserData() : null;
  
  // Atualizar estados de visualização com base na autenticação
  const loggedInElements = document.querySelectorAll('.auth-logged-in');
  const loggedOutElements = document.querySelectorAll('.auth-logged-out');
  
  loggedInElements.forEach(el => {
    el.style.display = isUserLoggedIn ? '' : 'none';
  });
  
  loggedOutElements.forEach(el => {
    el.style.display = isUserLoggedIn ? 'none' : '';
  });
  
  // Atualizar o nome do usuário no dropdown se estiver logado
  if (isUserLoggedIn && userData) {
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
      el.textContent = `Olá, ${userData.username}`;
    });
    
    // Atualizar texto da hero section com o nome do usuário
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      heroTitle.textContent = `Olá, ${userData.username}! Vamos planejar sua próxima aventura?`;
    }
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

// Buscar itinerários do usuário da API
async function fetchUserItineraries() {
  try {
    const loadingEl = document.getElementById('loading-itineraries');
    const noItinerariesEl = document.getElementById('no-itineraries');
    const containerEl = document.getElementById('itineraries-container');
    
    if (!containerEl) return;
    
    // Mostrar loading
    if (loadingEl) loadingEl.classList.remove('d-none');
    if (noItinerariesEl) noItinerariesEl.classList.add('d-none');
    
    // Fazer requisição para a API
    const response = await fetch('/api/itineraries');
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar itinerários: ${response.status}`);
    }
    
    const itineraries = await response.json();
    
    // Esconder loading
    if (loadingEl) loadingEl.classList.add('d-none');
    
    // Verificar se há itinerários
    if (!itineraries || itineraries.length === 0) {
      if (noItinerariesEl) noItinerariesEl.classList.remove('d-none');
      return;
    }
    
    // Limpar o container (manter loading e no-itineraries)
    const existingCards = containerEl.querySelectorAll('.itinerary-card');
    existingCards.forEach(card => card.remove());
    
    // Criar cards para cada itinerário
    const itinerariesGrid = document.querySelector('.itineraries-grid');
    
    itineraries.forEach(itinerary => {
      const card = createItineraryCard(itinerary);
      itinerariesGrid.appendChild(card);
    });
    
  } catch (error) {
    console.error('Erro ao buscar itinerários:', error);
    
    // Esconder loading e mostrar mensagem de erro
    const loadingEl = document.getElementById('loading-itineraries');
    if (loadingEl) loadingEl.classList.add('d-none');
    
    const containerEl = document.getElementById('itineraries-container');
    if (containerEl) {
      const errorMessage = document.createElement('div');
      errorMessage.className = 'alert alert-danger mt-3';
      errorMessage.textContent = 'Não foi possível carregar seus roteiros. Tente novamente mais tarde.';
      containerEl.appendChild(errorMessage);
    }
  }
}

// Criar card de itinerário
function createItineraryCard(itinerary) {
  // Criar o elemento do card
  const card = document.createElement('div');
  card.className = 'itinerary-card';
  
  // Formatar datas para exibição
  let dateText = '';
  if (itinerary.start_date) {
    const startFormatted = formatDate(itinerary.start_date);
    const endFormatted = itinerary.end_date ? formatDate(itinerary.end_date) : '';
    
    dateText = endFormatted ? `${startFormatted} — ${endFormatted}` : startFormatted;
  }
  
  // Determinar imagem (com fallback)
  const imageUrl = itinerary.cover_image || '/static/img/destinations/default.jpg';
  
  // Status de badges para o itinerário
  let badgeHtml = '';
  if (itinerary.is_collaborative) {
    badgeHtml = `
      <div class="itinerary-badge">
        <small><i class="fas fa-star me-1"></i>Roteiro colaborativo</small>
      </div>
    `;
  } else if (itinerary.status === 'completed') {
    badgeHtml = `
      <div class="itinerary-badge">
        <small><i class="fas fa-check-circle me-1"></i>Concluído</small>
      </div>
    `;
  }
  
  // Construir HTML do card
  card.innerHTML = `
    <div class="itinerary-image">
      <img src="${imageUrl}" alt="${itinerary.destination || 'Destino'}">
    </div>
    <div class="itinerary-details">
      <h4>${itinerary.title}</h4>
      ${dateText ? `<p class="itinerary-dates">${dateText}</p>` : ''}
      ${badgeHtml}
      <div class="d-flex mt-2">
        <button class="btn btn-primary flex-grow-1 me-2" onclick="editItinerary('${itinerary.id}')">
          <i class="fas fa-edit me-1"></i> Editar
        </button>
        <button class="btn btn-outline-primary" onclick="viewItinerary('${itinerary.id}')">
          <i class="fas fa-eye"></i>
        </button>
      </div>
    </div>
  `;
  
  return card;
}

// Abrir o itinerário para edição no Kanban
function editItinerary(itineraryId) {
  window.location.href = `/itinerary-kanban.html?roteiroId=${itineraryId}`;
}

// Visualizar detalhes do itinerário
function viewItinerary(itineraryId) {
  window.location.href = `/itinerary.html?id=${itineraryId}`;
}

// Inicializar o formulário para o modal existente
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar event listener para o botão "Criar Roteiro" no modal fixo
  const saveItineraryBtn = document.getElementById('saveItineraryBtn');
  if (saveItineraryBtn) {
    saveItineraryBtn.addEventListener('click', async function() {
      try {
        // Obter dados do formulário
        const title = document.getElementById('itineraryName').value;
        const destination = document.getElementById('destination').value;
        const start_date = document.getElementById('startDate').value;
        const end_date = document.getElementById('endDate').value;
        
        // Validação básica
        if (!title || !destination || !start_date || !end_date) {
          alert('Por favor, preencha todos os campos obrigatórios.');
          return;
        }
        
        // Criar objeto de itinerário para enviar ao backend
        const itineraryData = {
          title,
          destination,
          start_date,
          end_date
        };
        
        // Enviar dados para API usando o objeto AUTH para autenticação
        const response = await AUTH.fetchWithAuth('/api/itineraries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(itineraryData),
          requireAuth: true  // Garantir que a requisição falhe se não houver token
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Você precisa estar logado para criar um roteiro. Por favor, faça login.');
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro ao criar roteiro: ${response.status}`);
          }
        }
        
        const newItinerary = await response.json();
        
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createItineraryModal'));
        if (modal) modal.hide();
        
        // Duas opções possíveis:
        // 1. Ir para o builder de itinerário (Kanban)
        window.location.href = `/itinerary-kanban.html?roteiroId=${newItinerary.id}`;
        
        // 2. Ou, como estava antes, ir para a página de exploração (uncommment if needed)
        // window.location.href = `/explorar.html?destination=${encodeURIComponent(destination)}&name=${encodeURIComponent(title)}&startDate=${encodeURIComponent(start_date)}&endDate=${encodeURIComponent(end_date)}`;
        
      } catch (error) {
        console.error('Erro ao criar roteiro:', error);
        
        // Verificar se é um erro de autenticação baseado na mensagem
        if (error.message.includes('logado') || error.message.includes('login')) {
          alert('Você precisa estar logado para criar um roteiro.');
          // Redirecionar para a página de login
          window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
        } else {
          alert(error.message || 'Não foi possível criar o roteiro. Tente novamente mais tarde.');
        }
      }
    });
  }
});