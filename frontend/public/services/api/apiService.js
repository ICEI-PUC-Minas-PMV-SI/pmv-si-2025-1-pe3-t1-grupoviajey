import { getAuthToken } from '../../js/config/firebase-config.js';

const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Função para fazer requisições autenticadas
  async makeAuthenticatedRequest(endpoint, method = 'GET', body = null) {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseURL}/api${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.errors) {
        console.error('Erros de validação da API:', errorData.errors);
        const detailedMessage = `Dados inválidos: ${errorData.errors.join(', ')}`;
        throw new Error(detailedMessage);
      }
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    return response.json();
  }

  // Função para requisições públicas
  async makePublicRequest(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, finalOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro ${response.status}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.makePublicRequest('/health');
  }

  // Auth endpoints
  async signup(userData) {
    return this.makePublicRequest('/auth/signup', 'POST', userData);
  }

  async verifyToken() {
    return this.makeAuthenticatedRequest('/auth/verify');
  }

  async forgotPassword(email) {
    return this.makePublicRequest('/auth/forgot-password', 'POST', { email });
  }

  async logout() {
    return this.makeAuthenticatedRequest('/auth/logout', 'POST');
  }

  // User profile endpoints
  async getUserProfile() {
    return this.makeAuthenticatedRequest('/users/me');
  }

  async updateUserProfile(profileData) {
    return this.makeAuthenticatedRequest('/users/me', 'PUT', profileData);
  }

  // Trips
  async getTrips() {
    return this.makeAuthenticatedRequest('/trips');
  }

  async createTrip(tripData) {
    return this.makeAuthenticatedRequest('/trips', 'POST', tripData);
  }

  async getTrip(tripId) {
    return this.makeAuthenticatedRequest(`/trips/${tripId}`);
  }

  async updateTrip(tripId, tripData) {
    return this.makeAuthenticatedRequest(`/trips/${tripId}`, 'PUT', tripData);
  }

  async deleteTrip(tripId) {
    return this.makeAuthenticatedRequest(`/trips/${tripId}`, 'DELETE');
  }

  // Favorites
  async getFavorites() {
    return this.makeAuthenticatedRequest('/favorites');
  }

  async addFavorite(favoriteData) {
    return this.makeAuthenticatedRequest('/favorites', 'POST', favoriteData);
  }

  async removeFavorite(favoriteId) {
    return this.makeAuthenticatedRequest(`/favorites/${favoriteId}`, 'DELETE');
  }

  // Reviews
  async getPlaceReviews(placeId) {
    return this.makePublicRequest(`/reviews/places/${placeId}`);
  }

  async createReview(placeId, reviewData) {
    return this.makeAuthenticatedRequest(`/reviews/places/${placeId}`, 'POST', reviewData);
  }

  // Posts
  async getPublicPosts() {
    return this.makePublicRequest('/posts/public');
  }

  async createPost(postData) {
    return this.makeAuthenticatedRequest('/posts', 'POST', postData);
  }

  // User Reviews
  async getUserReviews(page = 1, perPage = 5) {
    return this.makeAuthenticatedRequest(`/reviews/user?page=${page}&perPage=${perPage}`);
  }

  async updateReview(placeId, reviewId, reviewData) {
    return this.makeAuthenticatedRequest(`/reviews/places/${placeId}/reviews/${reviewId}`, 'PUT', reviewData);
  }

  async deleteReview(placeId, reviewId) {
    return this.makeAuthenticatedRequest(`/reviews/places/${placeId}/reviews/${reviewId}`, 'DELETE');
  }

  // Roadmap endpoints
  async getRoadmapWithStats(tripId) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/roadmap`);
  }

  async getUnassignedPlaces(tripId) {
    return await this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/unassignedPlaces`);
  }

  async addUnassignedPlace(tripId, placeData) {
    const response = await this.makeAuthenticatedRequest(
      `/roadmap/trips/${tripId}/unassignedPlaces`,
      'POST',
      placeData
    );
    return response.data;
  }

  async removeUnassignedPlace(tripId, placeId) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/unassignedPlaces/${placeId}`, 'DELETE');
  }

  async getPlacesInDay(tripId, dayId) {
    return await this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripDays/${dayId}/tripPlaces`);
  }

  async addPlaceToDay(tripId, dayId, placeData) {
    const response = await this.makeAuthenticatedRequest(
      `/roadmap/trips/${tripId}/tripDays/${dayId}/tripPlaces`,
      'POST',
      placeData
    );
    return response.data;
  }

  async removePlaceFromDay(tripId, dayId, placeId) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripDays/${dayId}/tripPlaces/${placeId}`, 'DELETE');
  }

  async getRoadmapBudget(tripId) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripBudget`);
  }

  async createRoadmapBudget(tripId, budgetData) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripBudget`, 'POST', budgetData);
  }

  async updateRoadmapBudget(tripId, budgetId, budgetData) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripBudget/${budgetId}`, 'PUT', budgetData);
  }

  async getRoadmapChecklists(tripId) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripChecklist`);
  }

  async createRoadmapChecklist(tripId, checklistData) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripChecklist`, 'POST', checklistData);
  }

  async updateRoadmapChecklist(tripId, checklistId, checklistData) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripChecklist/${checklistId}`, 'PUT', checklistData);
  }

  async deleteRoadmapChecklist(tripId, checklistId) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripChecklist/${checklistId}`, 'DELETE');
  }

  async addChecklistItem(tripId, checklistId, itemData) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripChecklist/${checklistId}/checklistItems`, 'POST', itemData);
  }

  async updateChecklistItem(tripId, checklistId, itemId, itemData) {
    return this.makeAuthenticatedRequest(`/roadmap/trips/${tripId}/tripChecklist/${checklistId}/checklistItems/${itemId}`, 'PUT', itemData);
  }
}

export const apiService = new ApiService(); 