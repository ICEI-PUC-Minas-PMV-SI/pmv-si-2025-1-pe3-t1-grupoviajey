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