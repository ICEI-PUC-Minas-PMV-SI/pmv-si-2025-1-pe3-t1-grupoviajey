import { includeHeader, includeFooter } from '../../js/utils/include.js';

document.addEventListener('DOMContentLoaded', () => {
  includeHeader();
  includeFooter();
  const loginBtn = document.getElementById('login-btn');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  async function login(email, password) {
    // Simulação de chamada ao backend
    try {
      // Aqui você pode integrar com o backend real futuramente
      // const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      // if (!response.ok) throw new Error('Login inválido');
      // const data = await response.json(); // use data conforme necessário

      // Mock: aceita qualquer email/senha
      if (!email || !password) {
        alert('Preencha e-mail e senha.');
        return;
      }
      window.localStorage.setItem('isAuthenticated', 'true');
      window.location.href = '../../pages/user_dashboard/user-dashboard.html';
    } catch (err) {
      alert('Erro ao fazer login.');
    }
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
      login(email, password);
    });
  }
}); 