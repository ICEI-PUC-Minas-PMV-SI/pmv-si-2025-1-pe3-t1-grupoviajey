import { getAuthToken } from '../../js/config/firebase-config.js';

// User service to handle user-related operations
class UserService {
  constructor() {
    this.user = null;
    this._loadUserFromStorage();
  }

  _loadUserFromStorage() {
    const storedUser = localStorage.getItem('userProfile');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  setUser(userData) {
    this.user = userData;
    // Note: We only set the user object in memory.
    // The profile is now saved to localStorage by header.js after a successful backend fetch.
  }

  getUser() {
    return this.user;
  }
}

// Export a singleton instance
export const userService = new UserService(); 