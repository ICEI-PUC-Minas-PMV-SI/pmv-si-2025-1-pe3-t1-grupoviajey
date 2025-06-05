//Ponto de entrada, orquestra os outros módulos

import { createLocalCard, getTrashSVG, getDragHandleSVG, createNoteDiv, createExpenseDiv, formatCurrencyInput, formatCurrency, getCurrencyLocale, attachNoteActions, attachExpenseActions, formatTripPeriod, parseDate } from './roadmap-utils.js';
import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';
import { formatShortDateRange } from '../../js/utils/date.js';
import { searchDestinationImage } from '../../services/api/unsplash.js';
import { initMultiChecklists, setupAddChecklistBlockBtn } from './roadmap-checklist.js';
import { init as initFinance } from './roadmap-finance.js';
import { initRoadmapMap, updateMap, initializeGoogleMapsAutocomplete } from './roadmap-map.js';
import { roadmapStorage, handleAddToSavedPlaces, saveSavedPlacesToStorage, loadSavedPlacesFromStorage, renderSavedPlacesTab, initSavedPlaces } from './roadmap-storage.js';
import { createDaysFromStorage, loadRoadmapFromStorage, saveRoadmapToStorage, handleAddToTimeline, createTimeline, getPlaceData } from './roadmap-core.js';
import { attachRoadmapEventListeners, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd, addDnDHandlers, handleLocalCardDragStart, handleLocalCardDragOver, handleLocalCardDragLeave, handleLocalCardDrop, handleLocalCardDragEnd, handleDayContentDragOver, handleDayContentDrop, handleDayContentDragLeave, addLocalCardDnDHandlers, addDayContentDnDHandlers, handleDayHeaderDragOver, addDayHeaderDnDHandlers, initLocalCardDnD, initEventListeners } from './roadmap-events.js';
// import { fetchUserTrips } from '../../services/api/roadmapService.js'; // [BACKEND FUTURO]

// Importa funções dos modais
import {
  openEditTripModal,
  closeEditTripModal,
  openShareModal,
  closeShareModal,
  openCollabModal,
  closeCollabModal,
  initModals,
  openAddPlaceModal,
  closeAddPlaceModal
} from './roadmap-modals.js';

// =============================================
// DOM CONTENT LOADED INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Inicializa componentes básicos
    await Promise.all([
      includeHeader(),
      includeFooter(),
      includeSearchBar()
    ]);

    // 2. Carrega dados da viagem
    const selectedTripId = localStorage.getItem('selectedTripId');
    const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
    const trip = trips.find(t => String(t.id) === String(selectedTripId));

    if (!trip) {
      window.location.href = '/pages/user_dashboard/user-dashboard.html';
      return;
    }

    // 3. Renderiza dados básicos da viagem
    renderTripData(trip);

    // 4. Inicializa estrutura do roteiro
    initRoadmapStructure(trip);

    // 5. Inicializa módulos específicos (inclui o mapa)
    await initModules(trip);

    // 6. Só aqui, depois do mapa e dos dados prontos, chame updateMap:
    const roadmap = JSON.parse(localStorage.getItem('userRoadmapData'));
    if (roadmap && Array.isArray(roadmap.days)) {
      const allPlaces = roadmap.days
        .flatMap(day => day.places)
        .filter(p => p.lat && p.lng)
        .map(p => ({
          ...p,
          latitude: Number(p.lat),
          longitude: Number(p.lng),
          types: p.types || ['lodging', 'restaurant', 'tourist_attraction']
        }));
      if (typeof updateMap === 'function') {
        updateMap(allPlaces);
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar a página:', error);
    // TODO: Adicionar feedback visual para o usuário
  }
});

function renderTripData(trip) {
  if (document.getElementById('trip-title')) {
    document.getElementById('trip-title').textContent = trip.title;
  }
  if (document.getElementById('tripNameBanner')) {
    document.getElementById('tripNameBanner').textContent = trip.title;
  }
  if (document.getElementById('tripDestinationBanner')) {
    document.getElementById('tripDestinationBanner').textContent = trip.destination;
  }
  if (document.getElementById('tripDateBanner')) {
    const start = trip.startDate || trip.tripStart;
    const end = trip.endDate || trip.tripEnd;
    document.getElementById('tripDateBanner').textContent = formatTripPeriod(start, end);
  }
  if (trip.photo && document.getElementById('cover-img')) {
    document.getElementById('cover-img').src = trip.photo;
  }
  if (trip.description && document.getElementById('tripDescriptionBanner')) {
    document.getElementById('tripDescriptionBanner').textContent = trip.description;
  }
}

function initRoadmapStructure(trip) {
  // Cria os dias do roteiro baseado nas datas da viagem
  const start = trip.startDate || trip.tripStart;
  const end = trip.endDate || trip.tripEnd;
  if (start && end) {
    createDaysFromStorage(start, end);
  }

  // Carrega os dados salvos do roteiro 
  loadRoadmapFromStorage();
}

async function initModules(trip) {
  try {
    // 1. Inicializa o mapa com o destino correto
    console.log('[DEBUG] Inicializando mapa com destino:', trip.destination);
    const map = await initRoadmapMap(trip.destination);
    if (!map) {
      console.error('[DEBUG] Falha ao inicializar mapa');
    } else {
      console.log('[DEBUG] Mapa inicializado com sucesso');
      // Atualiza o mapa com os lugares salvos
      const savedPlaces = loadSavedPlacesFromStorage();
      if (savedPlaces && savedPlaces.length > 0) {
        updateMap(savedPlaces);
      }
    }

    // 2. Inicializa storage e locais salvos
    initSavedPlaces();

    // 3. Inicializa checklists
    console.log('[Checklist] Verificando container de checklists');
    const checklistContainer = document.getElementById('checklistsContainer');
    if (checklistContainer) {
      console.log('[Checklist] Container encontrado, inicializando...');
      initMultiChecklists();
      setupAddChecklistBlockBtn();
    } else {
      console.error('[Checklist] Container não encontrado');
    }

    // 4. Inicializa finanças
    initFinance();

    // 5. Inicializa modais
    initModals();

    // 6. Configura eventos específicos (incluindo o botão de adicionar local)
    setupSpecificEventListeners();

    // 7. Inicializa eventos gerais
    attachRoadmapEventListeners();
    initEventListeners();

    // 8. Inicializa Google Maps Autocomplete
    await initializeGoogleMapsAutocomplete('autocomplete');

  } catch (error) {
    console.error('Erro ao inicializar módulos:', error);
    throw error;
  }
}

function setupSpecificEventListeners() {
  // Listener para o botão '+ Adicionar local' na tab de locais salvos
  const addSavedPlaceBtn = document.getElementById('addSavedPlaceBtn');
  if (addSavedPlaceBtn) {
    console.log('[DEBUG] Configurando botão de adicionar local salvo');
    addSavedPlaceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('[DEBUG] Botão de adicionar local salvo clicado');
      openAddPlaceModal(null, true);
    });
  } else {
    console.error('[DEBUG] Botão de adicionar local salvo não encontrado');
  }

  // Garante que o checklist aparece ao trocar de aba
  const checklistTabBtn = document.querySelector('.tabs .tab:nth-child(3)');
  if (checklistTabBtn) {
    checklistTabBtn.addEventListener('click', () => {
      const container = document.getElementById('checklistsContainer');
      if (container && container.children.length === 0) {
        initMultiChecklists();
        setupAddChecklistBlockBtn();
      }
    });
  }
}

function adjustMapHeight() {
  const mapContainer = document.querySelector('.results-map');
  const mapElement = document.getElementById('map');
  const itinerary = document.querySelector('.roadmap-itinerary');

  if (!mapContainer || !mapElement || !itinerary) return;

  // Obtém a altura do itinerário
  const itineraryHeight = itinerary.scrollHeight;

  // Aplica a altura do itinerário ao mapa
  mapContainer.style.height = `${itineraryHeight}px`;
  mapElement.style.height = '100%';
  mapElement.style.width = '100%';
}

// Event listeners
window.addEventListener('DOMContentLoaded', () => {
  // Ajusta altura inicial
  adjustMapHeight();

  // Adiciona listeners para os headers do accordion
  const dayHeaders = document.querySelectorAll('.day-header');
  dayHeaders.forEach(header => {
    header.addEventListener('click', () => {
      // Espera a animação do accordion terminar (300ms é o padrão do CSS)
      setTimeout(adjustMapHeight, 300);
    });
  });

  // Observa mudanças no itinerário
  const itinerary = document.querySelector('.roadmap-itinerary');
  if (itinerary) {
    const itineraryObserver = new MutationObserver(() => {
      // Espera a animação do accordion terminar
      setTimeout(adjustMapHeight, 300);
    });
    itineraryObserver.observe(itinerary, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
  }
});

window.addEventListener('resize', adjustMapHeight);

function updateFooterHeightVar() {
  const footer = document.getElementById('footer');
  const footerHeight = footer ? footer.offsetHeight : 0;
  document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
}

window.addEventListener('DOMContentLoaded', updateFooterHeightVar);
window.addEventListener('resize', updateFooterHeightVar);




