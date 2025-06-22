import { onAuthChange, logoutUser } from '../../js/config/firebase-config.js';
import { apiService } from '../../services/api/apiService.js';

// --- Elementos do DOM ---
const userActions = document.getElementById('user-actions'); // Botões Cadastrar/Entrar
const userGreeting = document.getElementById('user-greeting');
const userNameEl = document.getElementById('user-name');
const userAvatarEl = document.getElementById('user-avatar');
const userMenu = document.getElementById('user-menu');
const logoutBtn = document.getElementById('logout-btn');

// --- Funções de UI ---

/**
 * Atualiza a UI para o estado "logado", mostrando os dados do usuário.
 * @param {object} userData - Dados do usuário (ex: { name, avatarUrl }).
 */
function updateUIAfterLogin(userData) {
  if (userActions) userActions.style.display = 'none';

  if (userGreeting) userGreeting.style.display = 'inline';
  if (userNameEl) {
    userNameEl.textContent = userData.name.split(' ')[0] || 'Usuário';
    userNameEl.style.display = 'inline';
  }
  if (userAvatarEl) {
    userAvatarEl.src = userData.avatarUrl || '/assets/images/default-avatar.png';
    userAvatarEl.style.display = 'inline-block';
  }
}

/**
 * Atualiza a UI para o estado "deslogado".
 */
function updateUIAfterLogout() {
  if (userActions) userActions.style.display = 'flex';

  if (userGreeting) userGreeting.style.display = 'none';
  if (userNameEl) userNameEl.style.display = 'none';
  if (userAvatarEl) userAvatarEl.style.display = 'none';
  if (userMenu) userMenu.style.display = 'none'; // Garante que o menu feche
}

// --- Lógica de Autenticação e Dados ---

/**
 * Busca os dados do perfil do usuário no backend.
 */
async function fetchUserProfile() {
  try {
    const response = await apiService.makeAuthenticatedRequest('/api/users/me');
    return response.data;
  } catch (error) {
    console.error("Falha ao buscar perfil do usuário:", error);
    await handleLogout();
    return null;
  }
}

/**
 * Gerencia a mudança de estado de autenticação.
 * @param {object|null} user - Objeto do usuário do Firebase ou null.
 */
async function handleAuthStateChange(user) {
  if (user) {
    const userProfile = await fetchUserProfile();
    if (userProfile) {
      updateUIAfterLogin(userProfile);
    }
  } else {
    updateUIAfterLogout();
  }
}

/**
 * Gerencia o processo de logout.
 */
async function handleLogout() {
  try {
    await logoutUser();
    await apiService.makeAuthenticatedRequest('/api/users/logout', { method: 'POST' });
  } catch (error) {
    console.error("Erro durante o logout:", error);
  } finally {
    if (apiService.clearToken) apiService.clearToken();
    window.location.href = '/pages/home/index.html';
  }
}

// --- Inicialização e Event Listeners ---

function initializeHeader() {
  onAuthChange(handleAuthStateChange);

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }

  if (userAvatarEl) {
    userAvatarEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userMenu) {
        // Alterna a visibilidade baseado no 'display'
        const isVisible = userMenu.style.display === 'flex';
        userMenu.style.display = isVisible ? 'none' : 'flex';
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (userMenu && !userAvatarEl.contains(e.target) && !userMenu.contains(e.target)) {
      userMenu.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', initializeHeader); 