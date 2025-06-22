//Ponto de entrada, orquestra os outros módulos

import { createLocalCard, createNoteDiv, createExpenseDiv, createDaySection } from './roadmap-core.js';
import { getTrashSVG, getDragHandleSVG, formatCurrencyInput, formatCurrency, getCurrencyLocale, attachNoteActions, attachExpenseActions, formatTripPeriod, parseDate, attachLocalCardActions } from './roadmap-utils.js';
import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';
import { formatShortDateRange } from '../../js/utils/date.js';
import { searchDestinationImage } from '../../services/api/unsplash.js';
import { initMultiChecklists, setupAddChecklistBlockBtn } from './roadmap-checklist.js';
import { init as initFinance } from './roadmap-finance.js';
import { initRoadmapMap, updateMap, initializeGoogleMapsAutocomplete } from './roadmap-map.js';
import { apiService } from '../../services/api/apiService.js';
import { attachRoadmapEventListeners, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd, addDnDHandlers, handleLocalCardDragStart, handleLocalCardDragOver, handleLocalCardDragLeave, handleLocalCardDrop, handleLocalCardDragEnd, handleDayContentDragOver, handleDayContentDrop, handleDayContentDragLeave, addLocalCardDnDHandlers, addDayContentDnDHandlers, handleDayHeaderDragOver, addDayHeaderDnDHandlers, initLocalCardDnD, initEventListeners } from './roadmap-events.js';
import { showLoading, hideLoading, showErrorToast } from '../../js/utils/ui-utils.js';
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

// Estado global da aplicação
let currentTrip = null;
let roadmapData = null;
let allPlaces = []; // Armazena todos os locais para o mapa

// =============================================
// DOM CONTENT LOADED INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', async () => {
  showLoading('Carregando sua viagem...');
  try {
    // 1. Inicializa componentes básicos de UI (removido includeSearchBar)
    await Promise.all([includeHeader(), includeFooter()]);

    // 2. Carrega todos os dados necessários da página
    const data = await loadRoadmapPageData();
    if (!data) {
      showErrorToast("Não foi possível carregar os dados da viagem.");
      // Opcional: redirecionar ou mostrar mensagem de erro permanente
      document.getElementById('roadmap-content').innerHTML = '<p class="error-message">Erro fatal ao carregar a viagem. Tente voltar para o seu <a href="/pages/user_dashboard/user-dashboard.html">dashboard</a>.</p>';
      return;
    }
    currentTrip = data.trip;
    roadmapData = data.roadmap;

    // 3. Renderiza a página com os dados carregados
    renderTripData(currentTrip);
    initRoadmapStructure(currentTrip, roadmapData);
    
    // 4. Inicializa módulos restantes
    await initModules(currentTrip, roadmapData);

  } catch (error) {
    console.error('Erro ao inicializar a página de roteiro:', error);
    showErrorToast('Ocorreu um erro inesperado.');
  } finally {
    hideLoading();
  }
});

// =============================================
// FUNÇÕES DE CARREGAMENTO DE DADOS
// =============================================

async function loadRoadmapPageData() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('tripId');

  if (!tripId) {
    console.error("Nenhum ID de viagem encontrado na URL.");
    window.location.href = '/pages/user_dashboard/user-dashboard.html';
    return null;
  }

  try {
    // Faz as chamadas em paralelo para otimizar
    const [tripResponse, roadmapResponse] = await Promise.all([
      apiService.getTrip(tripId),
      apiService.getRoadmapWithStats(tripId)
    ]);

    if (!tripResponse.success || !roadmapResponse.success) {
      console.error("Falha ao buscar dados da API:", { tripResponse, roadmapResponse });
      return null;
    }

    return { trip: tripResponse.data, roadmap: roadmapResponse.data };

  } catch (error) {
    console.error('Erro ao carregar dados para a página do roteiro:', error);
    return null;
  }
}

// =============================================
// FUNÇÕES DE RENDERIZAÇÃO
// =============================================

function renderTripData(trip) {
  document.getElementById('tripNameBanner').textContent = trip.title;
  document.getElementById('tripDestinationBanner').textContent = trip.destination;
  document.getElementById('tripDateBanner').textContent = formatTripPeriod(trip.startDate, trip.endDate);
  if (trip.photo) {
    document.getElementById('cover-img').src = trip.photo;
  }
  if (trip.description) {
    document.getElementById('tripDescriptionBanner').textContent = trip.description;
  }
}

function initRoadmapStructure(trip, roadmap) {
  // 1. Limpa o array de locais antes de preencher
  allPlaces = [];

  // 2. Renderiza locais não atribuídos
  if (roadmap.unassignedPlaces) {
    renderUnassignedPlaces(roadmap.unassignedPlaces);
  }

  // 3. Renderiza os dias e os locais dentro de cada dia
  if (roadmap.tripDays) {
    renderTripDays(roadmap.tripDays);
  }
}

function renderUnassignedPlaces(places) {
  const container = document.getElementById('savedPlacesList');
  if (!container) return;

  container.innerHTML = '';
  if (!places || places.length === 0) {
    container.innerHTML = '<p class="empty-saved-places-msg">Arraste locais do mapa aqui para salvá-los!</p>';
    return;
  }

  places.forEach((place) => {
    const card = createLocalCard(place);
    container.appendChild(card);
    attachLocalCardActions(card, null); // null para dayId
    allPlaces.push(place.placeDetails);
  });
}

function renderTripDays(tripDays) {
    const daysContainer = document.getElementById('daysContainer');
    if (!daysContainer) {
        console.error("Container de dias 'daysContainer' não encontrado!");
        return;
    }
    daysContainer.innerHTML = ''; // Limpa o container antes de renderizar

    // Ordena os dias por data para garantir a ordem cronológica
    tripDays.sort((a, b) => new Date(a.date) - new Date(b.date));

    tripDays.forEach(day => {
        // 1. Cria a seção do dia (acordeão) com o ID e data corretos
        const daySection = createDaySection(new Date(day.date.replace(/-/g, '\/')), day.date, day.id);
        daysContainer.appendChild(daySection);
        
        // 2. Encontra o container da timeline dentro da seção recém-criada
        const dayTimeline = daySection.querySelector('.day-timeline');

        if (dayTimeline) {
            dayTimeline.innerHTML = '<div class="timeline-line"></div>'; // Limpa para garantir
            if (day.tripPlaces && day.tripPlaces.length > 0) {
                day.tripPlaces.forEach(place => {
                    const card = createLocalCard(place);
                    dayTimeline.appendChild(card);
                    attachLocalCardActions(card, day.id);
                    if (place.placeDetails) {
                        allPlaces.push(place.placeDetails);
                    }
                });
            } else {
                dayTimeline.innerHTML += '<p class="empty-day-msg">Nenhum local adicionado para este dia.</p>';
            }
        }
    });
}

// =============================================
// FUNÇÕES DE INICIALIZAÇÃO DE MÓDULOS
// =============================================

async function initModules(trip, roadmap) {
  try {
    // 1. Inicializa o mapa com o destino e os marcadores
    const map = await initRoadmapMap(trip.destination);
    if (map) {
      updateMap(allPlaces); // Atualiza o mapa com todos os locais
      initializeGoogleMapsAutocomplete(map);
    } else {
        console.error('Falha ao inicializar o mapa. Autocomplete e outras funções dependentes podem não funcionar.');
    }

    // 2. Inicializa os modais e seus eventos
    initModals();

    // 3. Inicializa os ouvintes de eventos globais
    initEventListeners();

    // 4. Inicializa o módulo financeiro com o ID da viagem
    initFinance(trip.id);

    // 5. Inicializa os checklists
    initMultiChecklists();
    setupAddChecklistBlockBtn();

  } catch (error) {
    console.error("Erro na inicialização dos módulos:", error);
    showErrorToast("Erro ao carregar componentes da página.");
  }
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

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

function attachHoverEvents() {
  console.log('Anexando eventos de hover...');
  console.log('Markers disponíveis:', window.roadmapMarkers);
  console.log('Cards disponíveis:', document.querySelectorAll('.local-card').length);

  // Adiciona eventos de hover sem clonar os cards
  document.querySelectorAll('.local-card').forEach(card => {
    if (card.dataset.key) {
      console.log('Anexando eventos para card:', card.dataset.key);

      // Remove eventos antigos de hover se existirem
      const oldEnter = card._mouseEnterHandler;
      const oldLeave = card._mouseLeaveHandler;
      if (oldEnter) card.removeEventListener('mouseenter', oldEnter);
      if (oldLeave) card.removeEventListener('mouseleave', oldLeave);

      // Cria novos handlers
      const mouseEnterHandler = () => {
        console.log('Mouse enter em card:', card.dataset.key);
        if (window.roadmapMarkers) {
          const marker = window.roadmapMarkers.find(m => m._localKey === card.dataset.key);
          console.log('Marker encontrado:', marker);
          if (marker && window.updateMarkerAnimation) {
            window.updateMarkerAnimation(marker, true);
          }
        }
      };

      const mouseLeaveHandler = () => {
        console.log('Mouse leave em card:', card.dataset.key);
        if (window.roadmapMarkers) {
          const marker = window.roadmapMarkers.find(m => m._localKey === card.dataset.key);
          if (marker && window.updateMarkerAnimation) {
            window.updateMarkerAnimation(marker, false);
          }
        }
      };

      // Armazena referências para remoção posterior
      card._mouseEnterHandler = mouseEnterHandler;
      card._mouseLeaveHandler = mouseLeaveHandler;

      // Adiciona os eventos
      card.addEventListener('mouseenter', mouseEnterHandler);
      card.addEventListener('mouseleave', mouseLeaveHandler);
    }
  });
}

// Não há mais necessidade de exportar essas variáveis ou funções
// A comunicação agora é via API e eventos.

