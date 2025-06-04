// Service para persistência do roteiro do usuário (user_roadmap)

import { roadmapStorage, budgetStorage, unassignedPlacesStorage } from '../../pages/user_roadmap/roadmap-storage.js';

export function saveRoadmapToStorage(data) {
    return roadmapStorage.save(data);
}

export function loadRoadmapFromStorage() {
    return roadmapStorage.load();
}

export function saveRoadmapBudgetToStorage(budget) {
    return budgetStorage.save(budget);
}

export function loadRoadmapBudgetFromStorage() {
    return budgetStorage.load();
}

export function saveRoadmapSavedPlacesToStorage(savedPlaces) {
    return unassignedPlacesStorage.save(savedPlaces);
}

export function loadRoadmapSavedPlacesFromStorage() {
    return unassignedPlacesStorage.load();
}

export function getSelectedTripId() {
    return localStorage.getItem('selectedTripId');
}

export function setSelectedTripId(id) {
    localStorage.setItem('selectedTripId', id);
}

export function loadUserTrips() {
    return JSON.parse(localStorage.getItem('userTrips') || '[]');
}

export function saveUserTrips(trips) {
    localStorage.setItem('userTrips', JSON.stringify(trips));
} 