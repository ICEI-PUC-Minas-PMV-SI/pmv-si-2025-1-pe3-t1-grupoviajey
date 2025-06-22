const USER_KEY = 'viajey_user';

export function saveUserToStorage(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadUserFromStorage() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

// Funções para gerenciar dados do usuário no sessionStorage

const USER_DATA_KEY = 'viajeyUserProfile';

/**
 * Armazena os dados do perfil do usuário no sessionStorage.
 * @param {object} userData - Os dados do usuário para armazenar.
 */
export function storeUserData(userData) {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
}

/**
 * Recupera os dados do perfil do usuário do sessionStorage.
 * @returns {object|null} Os dados do usuário ou null se não houver.
 */
export function getStoredUserData() {
  if (typeof sessionStorage !== 'undefined') {
    const data = sessionStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

/**
 * Limpa os dados do perfil do usuário do sessionStorage.
 */
export function clearUserData() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(USER_DATA_KEY);
  }
}
