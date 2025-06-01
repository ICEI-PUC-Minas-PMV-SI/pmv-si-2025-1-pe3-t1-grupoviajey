// user-profile.js
// Main orchestrator for the user profile page

import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';

document.addEventListener('DOMContentLoaded', () => {
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

  // Tabs logic
  const tabPersonalBtn = document.getElementById('tab-personal-btn');
  const tabSecurityBtn = document.getElementById('tab-security-btn');
  const tabPersonal = document.getElementById('tab-personal');
  const tabSecurity = document.getElementById('tab-security');

  function activateTab(tab) {
    if (tab === 'personal') {
      tabPersonalBtn.classList.add('active');
      tabSecurityBtn.classList.remove('active');
      tabPersonal.classList.add('active');
      tabPersonal.style.display = 'block';
      tabSecurity.classList.remove('active');
      tabSecurity.style.display = 'none';
    } else {
      tabPersonalBtn.classList.remove('active');
      tabSecurityBtn.classList.add('active');
      tabPersonal.classList.remove('active');
      tabPersonal.style.display = 'none';
      tabSecurity.classList.add('active');
      tabSecurity.style.display = 'block';
    }
  }
  if (tabPersonalBtn && tabSecurityBtn) {
    tabPersonalBtn.addEventListener('click', () => activateTab('personal'));
    tabSecurityBtn.addEventListener('click', () => activateTab('security'));
  }

  // Função async para carregar o perfil do usuário
  async function loadUserProfile() {
    if (window.ProfileStorage && typeof window.ProfileStorage.loadProfile === 'function') {
      try {
        const profile = await window.ProfileStorage.loadProfile();
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
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    }
  }

  // Chama a função async
  loadUserProfile();
});
