import { getAuthToken } from '../../js/config/firebase-config.js';

const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Função para fazer requisições autenticadas
  async makeAuthenticatedRequest(endpoint, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

  // Trips
  async getTrips() {
    return this.makeAuthenticatedRequest('/api/trips');
  }

  async createTrip(tripData) {
    return this.makeAuthenticatedRequest('/api/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  }

  async getTrip(tripId) {
    return this.makeAuthenticatedRequest(`/api/trips/${tripId}`);
  }

  async updateTrip(tripId, tripData) {
    return this.makeAuthenticatedRequest(`/api/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(tripData)
    });
  }

  async deleteTrip(tripId) {
    return this.makeAuthenticatedRequest(`/api/trips/${tripId}`, {
      method: 'DELETE'
    });
  }

  // Favorites
  async getFavorites() {
    return this.makeAuthenticatedRequest('/api/favorites');
  }

  async addFavorite(favoriteData) {
    return this.makeAuthenticatedRequest('/api/favorites', {
      method: 'POST',
      body: JSON.stringify(favoriteData)
    });
  }

  async removeFavorite(favoriteId) {
    return this.makeAuthenticatedRequest(`/api/favorites/${favoriteId}`, {
      method: 'DELETE'
    });
  }

  // Reviews
  async getPlaceReviews(placeId) {
    return this.makePublicRequest(`/api/reviews/places/${placeId}`);
  }

  async createReview(placeId, reviewData) {
    return this.makeAuthenticatedRequest(`/api/reviews/places/${placeId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  // Posts
  async getPublicPosts() {
    return this.makePublicRequest('/api/posts/public');
  }

  async createPost(postData) {
    return this.makeAuthenticatedRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }
}

export const apiService = new ApiService(); 