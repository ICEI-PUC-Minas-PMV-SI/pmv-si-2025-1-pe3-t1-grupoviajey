// User service to handle user-related operations
class UserService {
    constructor() {
        this.favorites = this.loadFavorites();
    }

    // Load favorites from localStorage
    loadFavorites() {
        const favorites = localStorage.getItem('userFavorites');
        return favorites ? JSON.parse(favorites) : [];
    }

    // Save favorites to localStorage
    saveFavorites() {
        localStorage.setItem('userFavorites', JSON.stringify(this.favorites));
    }

    // Add a place to favorites
    addToFavorites(place) {
        if (!this.favorites.some(fav => fav.id === place.id)) {
            this.favorites.push(place);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // Remove a place from favorites
    removeFromFavorites(placeId) {
        const initialLength = this.favorites.length;
        this.favorites = this.favorites.filter(fav => fav.id !== placeId);
        if (this.favorites.length !== initialLength) {
            this.saveFavorites();
            return true;
        }
        return false;
    }

    // Check if a place is in favorites
    isFavorite(placeId) {
        return this.favorites.some(fav => fav.id === placeId);
    }

    // Get all favorites
    getFavorites() {
        return this.favorites;
    }
}

// Export a singleton instance
export const userService = new UserService(); 