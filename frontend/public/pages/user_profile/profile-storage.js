// profile-storage.js
// Handles loading and saving user profile data (mocked, ready for backend)

window.ProfileStorage = (function() {
  const API_URL = '/api/usuario/perfil';

  async function loadProfile() {
    // Simulate backend call with fetch (mocked response)
    try {
      // Uncomment below for real backend
      // const response = await fetch(API_URL, { method: 'GET' });
      // if (!response.ok) throw new Error('Failed to fetch profile');
      // return await response.json();

      // Mocked data for development
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            firstName: 'Rita',
            lastName: 'Venturi',
            DocNumber: '12345678901',
            email: 'rita.venturi@email.com',
            password: '********',
            avatarUrl: 'https://i.pravatar.cc/100?img=' + Math.floor(Math.random() * 70 + 1)
          });
        }, 400);
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      throw err;
    }
  }

  async function saveProfile(profileData) {
    // Simulate backend call with fetch (mocked response)
    try {
      // Uncomment below for real backend
      // const response = await fetch(API_URL, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profileData)
      // });
      // if (!response.ok) throw new Error('Failed to save profile');
      // return await response.json();

      // Mocked save (simulate delay)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 400);
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    }
  }

  return {
    loadProfile,
    saveProfile
  };
})();
