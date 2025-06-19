import { onAuthChange, getAuthToken } from '../../js/config/firebase-config.js';
import { apiService } from '../../services/api/apiService.js';

async function renderUserInfo() {
  const token = getAuthToken();
  const avatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const userMenu = document.getElementById('user-menu');
  const userActions = document.getElementById('user-actions');
  const userGreeting = document.getElementById('user-greeting');

  if (!avatar || !userName || !userMenu || !userActions || !userGreeting) return;

  if (!token) {
    // Usuário não autenticado
    userName.textContent = '';
    userMenu.style.display = 'none';
    userActions.style.display = 'flex';
    userGreeting.style.display = 'none';
    return;
  }

  // Buscar dados reais do usuário do backend
  let userProfile = null;
  try {
    const response = await apiService.makeAuthenticatedRequest('/api/users/me');
    userProfile = response.data;
  } catch (error) {
    userName.textContent = '';
    userMenu.style.display = 'none';
    userActions.style.display = 'flex';
    userGreeting.style.display = 'none';
    return;
  }

  // Atualize a UI com os dados reais do usuário
  userName.textContent = userProfile.name || userProfile.email || 'Usuário';
  avatar.src = userProfile.avatarUrl || '../../assets/images/default-avatar.png';
  userActions.style.display = 'none';
  userGreeting.style.display = '';
}

// Atualiza o header sempre que o estado de autenticação mudar
onAuthChange(renderUserInfo);

document.addEventListener('DOMContentLoaded', renderUserInfo);

function handleAvatarClick(e) {
  e.stopPropagation();
  const userMenu = document.getElementById('user-menu');
  if (!userMenu) return;
  userMenu.style.display = (userMenu.style.display === 'none' || userMenu.style.display === '') ? 'flex' : 'none';
}

// Adiciona listeners uma única vez após o load
window.addEventListener('load', function() {
  renderUserInfo();

  const avatar = document.getElementById('user-avatar');
  if (avatar) {
    avatar.addEventListener('click', handleAvatarClick);
  }

  // Listener para logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        // Chama logout do Firebase (frontend)
        const { logoutUser } = await import('../../js/config/firebase-config.js');
        await logoutUser();
        // Chama logout do backend
        await fetch('/api/users/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Erro ao fazer logout:', err);
      } finally {
        // Limpa token local e redireciona
        localStorage.removeItem('authToken');
        localStorage.removeItem('userUid');
        window.location.href = '../../pages/login-usuario/login.html';
      }
    });
  }

  // Fecha o menu ao clicar fora
  document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('user-menu');
    const avatar = document.getElementById('user-avatar');
    if (userMenu && userMenu.style.display !== 'none' && event.target !== avatar && !userMenu.contains(event.target)) {
      userMenu.style.display = 'none';
    }
  });
}); 