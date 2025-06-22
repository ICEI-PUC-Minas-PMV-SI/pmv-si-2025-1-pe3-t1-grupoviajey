// profile-events.js
// Handles button event listeners for the profile page

import { apiService } from '../../services/api/apiService.js';

window.ProfileEvents = (function() {
  function init() {
    const saveBtn = document.getElementById('save-btn');
    const form = document.getElementById('profile-form');

    if (saveBtn && form) {
      saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (!window.ProfileForm) return;
        
        const validation = window.ProfileForm.validate();
        if (!validation.valid) {
          showMessage(validation.message, false);
          return;
        }

        // Desabilitar botão e mostrar loading
        setButtonLoading(saveBtn, true);
        
        try {
          const data = window.ProfileForm.getFormData();
          
          // Chamar API para atualizar perfil
          const updatedProfile = await apiService.updateUserProfile(data);
          
          // Atualizar dados originais no formulário
          if (window.ProfileForm && typeof window.ProfileForm.updateOriginalData === 'function') {
            window.ProfileForm.updateOriginalData(data);
          }
          
          // Atualizar localStorage
          const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
          const newProfile = { ...currentProfile, ...data };
          localStorage.setItem('userProfile', JSON.stringify(newProfile));
          
          // Atualizar nome no cabeçalho se existir
          updateHeaderName(data.firstName);
          
          showMessage('Perfil atualizado com sucesso!', true);
          
          // Atualizar estado do botão
          setButtonSuccess(saveBtn);
          
        } catch (err) {
          console.error('Erro ao salvar perfil:', err);
          
          // Tratar erros específicos
          if (err.message.includes('401') || err.message.includes('não autenticado')) {
            window.location.href = '/pages/login/login.html';
            return;
          }
          
          let errorMessage = 'Erro ao salvar alterações.';
          if (err.message.includes('400')) {
            errorMessage = 'Dados inválidos. Verifique as informações.';
          } else if (err.message.includes('409')) {
            errorMessage = 'E-mail já está em uso por outro usuário.';
          } else if (err.message.includes('500')) {
            errorMessage = 'Erro interno do servidor. Tente novamente.';
          }
          
          showMessage(errorMessage, false);
          
        } finally {
          // Reativar botão após delay
          setTimeout(() => {
            setButtonLoading(saveBtn, false);
          }, 2000);
        }
      });
    }
  }

  function setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.classList.add('loading');
      button.innerHTML = `
        <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        Salvando...
      `;
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      button.textContent = 'Salvar alterações';
    }
  }

  function setButtonSuccess(button) {
    button.classList.remove('loading');
    button.classList.add('success');
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      Salvo!
    `;
  }

  function updateHeaderName(firstName) {
    // Atualizar nome no cabeçalho se existir
    const headerName = document.querySelector('.user-name, .header-user-name');
    if (headerName) {
      headerName.textContent = firstName;
    }
    
    // Atualizar nome na saudação da página de perfil
    const greetingName = document.getElementById('user-greeting-name');
    if (greetingName) {
      greetingName.textContent = firstName;
    }
  }

  // Simple feedback message (could be improved with a modal/toast)
  function showMessage(msg, success) {
    // Usar a função de notificação global se disponível
    if (window.ProfileUtils && typeof window.ProfileUtils.showNotification === 'function') {
      window.ProfileUtils.showNotification(msg, success);
      return;
    }

    // Fallback para notificação local
    let el = document.getElementById('profile-msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'profile-msg';
      el.style.position = 'fixed';
      el.style.top = '24px';
      el.style.left = '50%';
      el.style.transform = 'translateX(-50%)';
      el.style.zIndex = '9999';
      el.style.padding = '12px 24px';
      el.style.borderRadius = '8px';
      el.style.fontWeight = '600';
      el.style.fontSize = '1rem';
      el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.background = success ? '#E6F0EE' : '#FFD6D6';
    el.style.color = success ? '#15332B' : '#B00020';
    el.style.border = success ? '2px solid #15332B' : '2px solid #B00020';
    el.style.display = 'block';
    setTimeout(() => {
      el.style.display = 'none';
    }, 4000);
  }

  return { init };
})();
