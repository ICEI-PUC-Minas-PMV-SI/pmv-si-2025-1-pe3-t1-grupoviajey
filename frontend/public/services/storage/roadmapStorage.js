// Service para persistência do roteiro do usuário (user_roadmap)

export function saveRoadmapToStorage(data) {
    localStorage.setItem('userRoadmapData', JSON.stringify(data));
}

export function loadRoadmapFromStorage() {
    const data = localStorage.getItem('userRoadmapData');
    return data ? JSON.parse(data) : null;
}

export function saveRoadmapBudgetToStorage(budget) {
    localStorage.setItem('userRoadmapBudget', JSON.stringify(budget));
}

export function loadRoadmapBudgetFromStorage() {
    const data = localStorage.getItem('userRoadmapBudget');
    return data ? JSON.parse(data) : null;
}

export function saveRoadmapSavedPlacesToStorage(savedPlaces) {
    localStorage.setItem('userRoadmapSavedPlaces', JSON.stringify(savedPlaces));
}

export function loadRoadmapSavedPlacesFromStorage() {
    const data = localStorage.getItem('userRoadmapSavedPlaces');
    return data ? JSON.parse(data) : [];
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