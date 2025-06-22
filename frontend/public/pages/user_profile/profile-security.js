// profile-security.js
// Handles password change logic for the security tab

import { apiService } from '../../services/api/apiService.js';

window.ProfileSecurity = (function() {
  function init() {
    const form = document.getElementById('security-form');
    const saveBtn = document.getElementById('save-password-btn');
    if (!form || !saveBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentPassword = form.currentPassword.value.trim();
      const newPassword = form.newPassword.value.trim();
      const confirmPassword = form.confirmPassword.value.trim();

      // Validação
      const validation = validatePasswordChange(currentPassword, newPassword, confirmPassword);
      if (!validation.valid) {
        showMessage(validation.message, false);
        return;
      }

      // Desabilitar botão e mostrar loading
      setButtonLoading(saveBtn, true);

      try {
        // Chamar API para alterar senha
        await apiService.changePassword({
          currentPassword,
          newPassword
        });

        showMessage('Senha alterada com sucesso!', true);
        setButtonSuccess(saveBtn);
        form.reset();

      } catch (err) {
        console.error('Erro ao alterar senha:', err);
        
        // Tratar erros específicos
        if (err.message.includes('401') || err.message.includes('não autenticado')) {
          window.location.href = '/pages/login/login.html';
          return;
        }
        
        let errorMessage = 'Erro ao alterar senha.';
        if (err.message.includes('400')) {
          errorMessage = 'Senha atual incorreta.';
        } else if (err.message.includes('422')) {
          errorMessage = 'A nova senha não atende aos requisitos de segurança.';
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

    // Adicionar validação em tempo real
    setupPasswordValidation(form);
  }

  function validatePasswordChange(currentPassword, newPassword, confirmPassword) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { valid: false, message: 'Preencha todos os campos.' };
    }
    
    if (newPassword.length < 8) {
      return { valid: false, message: 'A nova senha deve ter pelo menos 8 caracteres.' };
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      return { valid: false, message: 'A senha deve conter pelo menos uma letra maiúscula.' };
    }
    
    if (!/[a-z]/.test(newPassword)) {
      return { valid: false, message: 'A senha deve conter pelo menos uma letra minúscula.' };
    }
    
    if (!/\d/.test(newPassword)) {
      return { valid: false, message: 'A senha deve conter pelo menos um número.' };
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      return { valid: false, message: 'A senha deve conter pelo menos um caractere especial.' };
    }
    
    if (newPassword !== confirmPassword) {
      return { valid: false, message: 'As senhas não coincidem.' };
    }
    
    if (newPassword === currentPassword) {
      return { valid: false, message: 'A nova senha deve ser diferente da atual.' };
    }
    
    return { valid: true };
  }

  function setupPasswordValidation(form) {
    const newPasswordInput = form.querySelector('#newPassword');
    const confirmPasswordInput = form.querySelector('#confirmPassword');

    if (newPasswordInput) {
      newPasswordInput.addEventListener('input', () => {
        validatePasswordStrength(newPasswordInput);
        validatePasswordMatch(newPasswordInput, confirmPasswordInput);
        updatePasswordButtonState();
      });
    }

    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        validatePasswordMatch(newPasswordInput, confirmPasswordInput);
        updatePasswordButtonState();
      });
    }
  }

  function validatePasswordStrength(input) {
    const password = input.value;
    const strengthIndicator = getOrCreateStrengthIndicator(input);
    
    // Remover classes anteriores
    strengthIndicator.className = 'password-strength';
    
    let strength = 0;
    let feedback = '';

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        strengthIndicator.classList.add('very-weak');
        feedback = 'Muito fraca';
        break;
      case 2:
        strengthIndicator.classList.add('weak');
        feedback = 'Fraca';
        break;
      case 3:
        strengthIndicator.classList.add('medium');
        feedback = 'Média';
        break;
      case 4:
        strengthIndicator.classList.add('strong');
        feedback = 'Forte';
        break;
      case 5:
        strengthIndicator.classList.add('very-strong');
        feedback = 'Muito forte';
        break;
    }

    strengthIndicator.textContent = `Força da senha: ${feedback}`;
  }

  function validatePasswordMatch(newPasswordInput, confirmPasswordInput) {
    if (!newPasswordInput || !confirmPasswordInput) return;

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Remover classes anteriores
    confirmPasswordInput.classList.remove('match', 'no-match');

    if (confirmPassword && newPassword !== confirmPassword) {
      confirmPasswordInput.classList.add('no-match');
    } else if (confirmPassword && newPassword === confirmPassword) {
      confirmPasswordInput.classList.add('match');
    }
  }

  function getOrCreateStrengthIndicator(input) {
    let indicator = input.parentNode.querySelector('.password-strength');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'password-strength';
      indicator.style.cssText = `
        font-size: 0.875rem;
        margin-top: 4px;
        margin-bottom: 8px;
      `;
      input.parentNode.insertBefore(indicator, input.nextSibling);
    }
    return indicator;
  }

  function updatePasswordButtonState() {
    const saveBtn = document.getElementById('save-password-btn');
    const form = document.getElementById('security-form');
    
    if (!saveBtn || !form) return;

    const currentPassword = form.currentPassword.value.trim();
    const newPassword = form.newPassword.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();

    const validation = validatePasswordChange(currentPassword, newPassword, confirmPassword);
    saveBtn.disabled = !validation.valid;
  }

  function setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.classList.add('loading');
      button.innerHTML = `
        <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        Alterando...
      `;
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      button.textContent = 'Salvar nova senha';
    }
  }

  function setButtonSuccess(button) {
    button.classList.remove('loading');
    button.classList.add('success');
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      Senha alterada!
    `;
  }

  function showMessage(msg, success) {
    // Usar a função de notificação global se disponível
    if (window.ProfileUtils && typeof window.ProfileUtils.showNotification === 'function') {
      window.ProfileUtils.showNotification(msg, success);
      return;
    }

    // Fallback para notificação local
    let el = document.getElementById('security-msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'security-msg';
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