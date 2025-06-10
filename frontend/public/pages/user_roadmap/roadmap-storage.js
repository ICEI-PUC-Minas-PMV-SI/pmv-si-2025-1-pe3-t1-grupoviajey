import { createLocalCard, attachLocalCardActions } from './roadmap-utils.js';

// =============================================
// STORAGE DE ROTEIRO
// =============================================

// Constants for localStorage keys
const STORAGE_KEYS = {
  ROADMAP: 'userRoadmapData',
  UNASSIGNED_PLACES: 'unassigned_places',
  CHECKLISTS: 'roadmap_checklists',
  BUDGET: 'roadmap_budget'
};

// Generic storage operations
const storage = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving data to ${key}:`, error);
      return false;
    }
  },

  load: (key, defaultValue = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch (error) {
      console.error(`Error loading data from ${key}:`, error);
      return defaultValue;
    }
  }
};

// Roadmap specific operations
export const roadmapStorage = {
  save: (data) => {
    // Salva o estado do checklist junto com os dados do roadmap
    const checklistItems = document.querySelectorAll('.checklist-item');
    const checklistState = Array.from(checklistItems).map(item => {
      const text = item.querySelector('.checklist-text').textContent;
      const isChecked = item.querySelector('.checklist-checkbox').checked;
      return { text, isChecked };
    });
    data.checklist = checklistState;
    return storage.save(STORAGE_KEYS.ROADMAP, data);
  },
  load: () => storage.load(STORAGE_KEYS.ROADMAP, {
    tripName: '',
    tripDestination: '',
    tripDate: '',
    tripStart: '',
    tripEnd: '',
    tripDescription: '',
    days: [],
    checklist: []
  })
};

// Unassigned places operations
export const unassignedPlacesStorage = {
  save: (places) => storage.save(STORAGE_KEYS.UNASSIGNED_PLACES, places),
  load: () => storage.load(STORAGE_KEYS.UNASSIGNED_PLACES, [])
};

// Checklists operations
export const checklistsStorage = {
  save: (data) => storage.save(STORAGE_KEYS.CHECKLISTS, data),
  load: () => storage.load(STORAGE_KEYS.CHECKLISTS, [])
};

// Budget operations
export const budgetStorage = {
  save: (budget) => storage.save(STORAGE_KEYS.BUDGET, budget),
  load: () => storage.load(STORAGE_KEYS.BUDGET, { total: 0, gastos: [] })
};

// =============================================
// STORAGE DE LOCAIS SALVOS
// =============================================

// Estado dos locais salvos
const savedPlacesState = {
  places: []
};

// Função para adicionar um local aos salvos
export function handleAddToSavedPlaces(placeData) {
  savedPlacesState.places.push(placeData);
  saveSavedPlacesToStorage();
  renderSavedPlacesTab();
}

// Função para salvar locais no storage
export function saveSavedPlacesToStorage() {
  try {
    localStorage.setItem('userRoadmapSavedPlaces', JSON.stringify(savedPlacesState.places));
  } catch (error) {
    console.error('Erro ao salvar locais:', error);
  }
}

// Função para carregar locais do storage
export function loadSavedPlacesFromStorage() {
  try {
    const data = localStorage.getItem('userRoadmapSavedPlaces');
    if (data) {
      savedPlacesState.places = JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar locais:', error);
    savedPlacesState.places = [];
  }
}

// Função para renderizar a tab de locais salvos
export function renderSavedPlacesTab() {
  const container = document.getElementById('savedPlacesList');
  if (!container) return;

  container.innerHTML = '';
  if (!savedPlacesState.places.length) {
    container.innerHTML = '<p class="empty-saved-places-msg">Nenhum local salvo ainda.</p>';
    return;
  }

  savedPlacesState.places.forEach((place, idx) => {
    const card = createLocalCard(place);
    container.appendChild(card);
    attachLocalCardActions(card);

    // Botão de remover do local salvo
    const removeBtn = card.querySelector('.remove-place-btn');
    if (removeBtn) {
      removeBtn.onclick = function () {
        savedPlacesState.places.splice(idx, 1);
        saveSavedPlacesToStorage();
        renderSavedPlacesTab();
      };
    }
  });
}

// Inicializa os locais salvos
export function initSavedPlaces() {
  loadSavedPlacesFromStorage();
  renderSavedPlacesTab();
}

export function removeLocalFromStorage(cardKey) {
  const roadmap = JSON.parse(localStorage.getItem('userRoadmapData'));
  if (roadmap && Array.isArray(roadmap.days)) {
    for (const day of roadmap.days) {
      const idx = day.places.findIndex(
        p => (p.key || ((p.name || '') + '|' + (p.address || '') + '|' + (p.lat || '') + '|' + (p.lng || ''))) === cardKey
      );
      if (idx !== -1) {
        day.places.splice(idx, 1);
        break;
      }
    }
    localStorage.setItem('userRoadmapData', JSON.stringify(roadmap));
    return roadmap;
  }
  return null;
}

export function getAllPlacesFromStorage() {
  const roadmap = JSON.parse(localStorage.getItem('userRoadmapData'));
  if (roadmap && Array.isArray(roadmap.days)) {
    return roadmap.days
      .flatMap(day => day.places)
      .filter(p => p.lat && p.lng)
      .map(p => ({
        ...p,
        latitude: Number(p.lat),
        longitude: Number(p.lng),
        key: p.key || ((p.name || '') + '|' + (p.address || '') + '|' + (p.lat || '') + '|' + (p.lng || '')),
        types: p.types || ['lodging', 'restaurant', 'tourist_attraction']
      }));
  }
  return [];
}

// Função para salvar os dados da viagem
export function saveTripData(tripData) {
  try {
    // Salva os dados da viagem
    const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
    const tripIndex = trips.findIndex(t => String(t.id) === String(tripData.id));

    if (tripIndex !== -1) {
      trips[tripIndex] = { ...trips[tripIndex], ...tripData };
    }

    localStorage.setItem('userTrips', JSON.stringify(trips));

    // Atualiza os dados do roadmap
    const roadmap = JSON.parse(localStorage.getItem('userRoadmapData') || '{}');

    // Atualiza os dados básicos
    roadmap.tripName = tripData.title;
    roadmap.tripDestination = tripData.destination;
    roadmap.tripDescription = tripData.description || '';
    roadmap.tripStart = tripData.startDate;
    roadmap.tripEnd = tripData.endDate;

    // Limpa os dias antigos e cria novos dias
    roadmap.days = [];

    localStorage.setItem('userRoadmapData', JSON.stringify(roadmap));

    return true;
  } catch (error) {
    console.error('Erro ao salvar dados da viagem:', error);
    return false;
  }
}

// Função para carregar os dados da viagem atual
export function loadCurrentTripData() {
  try {
    const selectedTripId = localStorage.getItem('selectedTripId');
    if (!selectedTripId) return null;

    const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
    const trip = trips.find(t => String(t.id) === String(selectedTripId));

    if (!trip) return null;

    // Atualiza os dados do roadmap com os dados da viagem
    const roadmap = JSON.parse(localStorage.getItem('userRoadmapData') || '{}');
    roadmap.tripName = trip.title;
    roadmap.tripDestination = trip.destination;
    roadmap.tripDescription = trip.description || '';
    roadmap.tripStart = trip.startDate;
    roadmap.tripEnd = trip.endDate;

    // Mantém os dados existentes dos dias
    if (!roadmap.days) {
      roadmap.days = [];
    }

    localStorage.setItem('userRoadmapData', JSON.stringify(roadmap));

    return trip;
  } catch (error) {
    console.error('Erro ao carregar dados da viagem:', error);
    return null;
  }
}
