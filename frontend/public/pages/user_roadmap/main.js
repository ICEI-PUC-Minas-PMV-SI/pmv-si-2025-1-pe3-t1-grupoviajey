//Ponto de entrada, orquestra os outros módulos

import { createLocalCard, getTrashSVG, getDragHandleSVG, createNoteDiv, createExpenseDiv, formatCurrencyInput, formatCurrency, getCurrencyLocale, attachNoteActions, attachExpenseActions, formatTripPeriod, parseDate } from './roadmap-utils.js';
import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';
import { formatShortDateRange } from '../../js/utils/date.js';
import { searchDestinationImage } from '../../services/api/unsplash.js';
import { initRoadmapMap, initializeGoogleMapsAutocomplete, getLastSelectedPlace, clearLastSelectedPlace } from './roadmap-map.js';
import { initMultiChecklists, setupAddChecklistBlockBtn } from './roadmap-checklist.js';
import { init as initFinance } from './roadmap-finance.js';
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

    // 5. Inicializa módulos específicos
    await initModules(trip);

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
    await initRoadmapMap(trip.destination);

    // 2. Inicializa storage e locais salvos
    initSavedPlaces();

    // 3. Inicializa checklists
    if (document.getElementById('checklistsContainer')) {
      initMultiChecklists();
      setupAddChecklistBlockBtn();
    }

    // 4. Inicializa finanças
    initFinance();

    // 5. Inicializa modais
    initModals();

    // 6. Inicializa eventos
    attachRoadmapEventListeners();
    initEventListeners();

    // 7. Configura eventos específicos
    setupSpecificEventListeners();

  } catch (error) {
    console.error('Erro ao inicializar módulos:', error);
    throw error;
  }
}

function setupSpecificEventListeners() {
  // Listener para o botão '+ Adicionar local' na tab de locais salvos
  const addSavedPlaceBtn = document.getElementById('addSavedPlaceBtn');
  if (addSavedPlaceBtn) {
    addSavedPlaceBtn.addEventListener('click', () => {
      openAddPlaceModal(null, true);
    });
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

  // Event listeners para o botão de orçamento
  const budgetBtn = document.getElementById('budgetBtn');
  const budgetDropdown = document.getElementById('budgetDropdown');

  if (budgetBtn && budgetDropdown) {
    budgetBtn.addEventListener('click', () => {
      budgetDropdown.classList.toggle('show');
    });

    // Fecha o dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      if (!budgetBtn.contains(e.target) && !budgetDropdown.contains(e.target)) {
        budgetDropdown.classList.remove('show');
      }
    });
  }
}




