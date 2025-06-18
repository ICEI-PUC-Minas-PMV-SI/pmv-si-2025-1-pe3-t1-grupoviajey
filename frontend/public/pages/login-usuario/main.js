import { includeHeader, includeFooter } from '../../js/utils/include.js';
import { loginUser } from '../../js/config/firebase-config.js';
import { apiService } from '../../services/api/apiService.js';

document.addEventListener('DOMContentLoaded', () => {
  includeHeader();
  includeFooter();
  
  const loginBtn = document.getElementById('login-btn');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const loadingSpinner = document.createElement('div');
  
  // Criar spinner de loading
  loadingSpinner.innerHTML = `
    <div id="login-loading-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;">
      <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
        <p>Fazendo login...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;
  document.body.appendChild(loadingSpinner);
  const overlay = loadingSpinner.querySelector('#login-loading-overlay');
  if (overlay) overlay.style.display = 'none';

  function showLoading() {
    if (overlay) overlay.style.display = 'flex';
  }
  function hideLoading() {
    if (overlay) overlay.style.display = 'none';
  }

  async function login(email, password) {
    if (!email || !password) {
      alert('Preencha e-mail e senha.');
      console.log('Campos não preenchidos');
      hideLoading();
      return;
    }

    showLoading();
    try {
      console.log('Iniciando login...');
      const loginResult = await loginUser(email, password);
      console.log('Resultado do login:', loginResult);

      if (!loginResult.success) {
        alert(`Erro no login: ${loginResult.error}`);
        hideLoading();
        return;
      }

      let userProfile = null;
      try {
        console.log('Buscando perfil do usuário...');
        userProfile = await apiService.makeAuthenticatedRequest('/api/users/me');
        console.log('Perfil do usuário:', userProfile);
      } catch (error) {
        console.warn('Não foi possível buscar perfil do usuário:', error.message);
      }

      window.location.href = '../user_dashboard/user-dashboard.html';
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Verifique suas credenciais.');
      hideLoading();
    } finally {
      // Garante que o loading nunca fique travado
      setTimeout(hideLoading, 5000); // fallback: oculta após 5s se algo der errado
    }
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', function(event) {
      event.preventDefault();
      showLoading();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      login(email, password);
    });
  }

  // Permitir login com Enter
  [emailInput, passwordInput].forEach(input => {
    if (input) {
      input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          showLoading();
          loginBtn.click();
        }
      });
    }
  });
}); 