const USER_KEY = 'viajey_user';

export function saveUserToStorage(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadUserFromStorage() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}
