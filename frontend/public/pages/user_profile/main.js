// user-profile.js
// Main orchestrator for the user profile page

import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';
import { apiService } from '../../services/api/apiService.js';
import { checkAuthAndRedirect } from '../../js/config/firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticação primeiro
  const isAuthenticated = await checkAuthAndRedirect();
  if (!isAuthenticated) return;

  includeHeader();
  includeFooter();
  includeSearchBar();

  // Import and initialize modules
  if (window.ProfileAvatar && typeof window.ProfileAvatar.init === 'function') {
    window.ProfileAvatar.init();
  }
  if (window.ProfileForm && typeof window.ProfileForm.init === 'function') {
    window.ProfileForm.init();
  }
  if (window.ProfileEvents && typeof window.ProfileEvents.init === 'function') {
    window.ProfileEvents.init();
  }
  /*
  if (window.ProfileSecurity && typeof window.ProfileSecurity.init === 'function') {
    window.ProfileSecurity.init();
  }
  */

  // Tabs logic
  const tabPersonalBtn = document.getElementById('tab-personal-btn');
  // const tabSecurityBtn = document.getElementById('tab-security-btn');
  const tabPersonal = document.getElementById('tab-personal');
  // const tabSecurity = document.getElementById('tab-security');

  function activateTab(tab) {
    if (tab === 'personal') {
      tabPersonalBtn.classList.add('active');
      // tabSecurityBtn.classList.remove('active');
      tabPersonal.classList.add('active');
      tabPersonal.style.display = 'block';
      // tabSecurity.classList.remove('active');
      // tabSecurity.style.display = 'none';
    } 
    /*
    else {
      tabPersonalBtn.classList.remove('active');
      tabSecurityBtn.classList.add('active');
      tabPersonal.classList.remove('active');
      tabPersonal.style.display = 'none';
      tabSecurity.classList.add('active');
      tabSecurity.style.display = 'block';
    }
    */
  }
  if (tabPersonalBtn /*&& tabSecurityBtn*/) {
    tabPersonalBtn.addEventListener('click', () => activateTab('personal'));
    // tabSecurityBtn.addEventListener('click', () => activateTab('security'));
  }

  // Função async para carregar o perfil do usuário da API
  async function loadUserProfile() {
    const loadingSpinner = document.getElementById('profile-loading');
    if (loadingSpinner) loadingSpinner.style.display = 'block';

    try {
      const response = await apiService.getUserProfile();
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Dados do perfil não encontrados.');
      }

      const profile = response.data;
      
      // Preencher formulário
      if (window.ProfileForm && typeof window.ProfileForm.fillForm === 'function') {
        window.ProfileForm.fillForm(profile);
      }
      
      // Set greeting name
      if (profile && profile.firstName) {
        const greetingName = document.getElementById('user-greeting-name');
        if (greetingName) greetingName.textContent = profile.firstName;
      }
      
      // Set avatar if available
      if (profile && profile.avatarUrl) {
        const avatarImg = document.getElementById('user-profile-avatar');
        if (avatarImg) avatarImg.src = profile.avatarUrl;
      }

      // Salvar perfil no localStorage para uso global
      localStorage.setItem('userProfile', JSON.stringify(profile));
      
    } catch (err) {
      console.error('Failed to load user profile:', err);
      
      // Tratar erro 401 - redirecionar para login
      if (err.message.includes('401') || err.message.includes('não autenticado')) {
        window.location.href = '/pages/login/login.html';
        return;
      }
      
      // Mostrar mensagem de erro para outros casos
      showNotification('Erro ao carregar perfil. Tente novamente.', false);
    } finally {
      if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
  }

  // Função para mostrar notificações
  function showNotification(message, isSuccess = true) {
    let notification = document.getElementById('profile-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'profile-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
      `;
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.background = isSuccess ? '#E6F0EE' : '#FFD6D6';
    notification.style.color = isSuccess ? '#15332B' : '#B00020';
    notification.style.border = isSuccess ? '2px solid #15332B' : '2px solid #B00020';
    notification.style.display = 'block';

    setTimeout(() => {
      notification.style.display = 'none';
    }, 4000);
  }

  // Expor funções globalmente para outros módulos
  window.ProfileUtils = {
    showNotification,
    loadUserProfile
  };

  // Chama a função async para carregar perfil
  await loadUserProfile();
});
