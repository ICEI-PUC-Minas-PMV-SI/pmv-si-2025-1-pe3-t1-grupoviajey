/**
 * Frontend Authentication Script para ViajeyPlanner
 * Gerencia registro, login, logout e verificação de autenticação
 */

// Funções de Autenticação
const AUTH = {
  // Verificar se o usuário está logado
  isUserLoggedIn: function() {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    return !!token && !!userData;
  },
  
  // Obter o token de autenticação com validação e logs
  getAuthToken: function() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('Token de autenticação não encontrado no localStorage');
      return null;
    }
    
    if (token.length < 20) {
      console.warn('Token de autenticação encontrado, mas parece inválido (muito curto)');
    }
    
    // Verificar se o token está no formato JWT (xxx.yyy.zzz)
    if (!token.includes('.') || token.split('.').length !== 3) {
      console.warn('Token de autenticação encontrado, mas não está no formato JWT esperado');
    }
    
    console.info('Token de autenticação recuperado com sucesso. Primeiros caracteres:', token.substring(0, 15) + '...');
    return token;
  },
  
  // Salvar token e dados do usuário
  saveUserData: function(token, userData) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
  },
  
  // Obter dados do usuário
  getUserData: function() {
    const userDataStr = localStorage.getItem('userData');
    return userDataStr ? JSON.parse(userDataStr) : null;
  },
  
  // Fazer logout (remover token e dados)
  logout: function(redirectPath = '') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Se tiver um caminho de redirecionamento, usá-lo após o login
    if (redirectPath) {
      window.location.href = `/login.html?redirect=${encodeURIComponent(redirectPath)}`;
    } else {
      window.location.href = '/login.html';
    }
  },
  
  // Adicionar token a requisições fetch
  fetchWithAuth: async function(url, options = {}) {
    const token = this.getAuthToken();
    
    if (!token && options.requireAuth) {
      throw new Error('Token de autenticação não fornecido. Por favor, faça login.');
    }
    
    // Configurar headers com o token de autenticação
    const headers = options.headers || {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Se tiver body e não tiver Content-Type, adicionar
    if (options.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Fazer a requisição
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Verificação de autenticação após a resposta (mais simples, sem verificação dupla)
    if (response.status === 401 && options.requireAuth) {
      console.warn('Token de autenticação inválido ou expirado');
      // Limpar o token apenas, sem redirecionamento automático
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
    
    return response;
  },
  
  // Função para mostrar mensagem de erro/sucesso
  showMessage: function(containerId, message, type = 'danger') {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    }
  },
  
  // Realizar registro de usuário
  register: async function(userData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar usuário');
      }
      
      return data;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },
  
  // Realizar login de usuário
  login: async function(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Credenciais inválidas');
      }
      
      // Salvar token e dados do usuário
      this.saveUserData(data.token, data.user);
      
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }
};

// Configurar handlers para as páginas de login e registro
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se é a página de login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    // Verificar se usuário já está logado e redirecionar se estiver
    if (AUTH.isUserLoggedIn()) {
      window.location.href = '/desktop.html';
      return;
    }
    
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const loginBtn = document.getElementById('loginBtn');
      
      // Validação básica
      if (!email || !password) {
        AUTH.showMessage('alert-container', 'Por favor, preencha todos os campos.');
        return;
      }
      
      // Desabilitar botão e mostrar loading
      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Entrando...';
      }
      
      try {
        // Realizar login
        await AUTH.login(email, password);
        
        // Mostrar mensagem de sucesso
        AUTH.showMessage('alert-container', 'Login realizado com sucesso! Redirecionando...', 'success');
        
        // Redirecionar após breve delay
        setTimeout(() => {
          window.location.href = '/desktop.html';
        }, 1000);
      } catch (error) {
        AUTH.showMessage('alert-container', error.message);
        
        // Reativar botão
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.innerHTML = 'Entrar';
        }
      }
    });
  }
  
  // Verificar se é a página de registro
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    // Verificar se usuário já está logado e redirecionar se estiver
    if (AUTH.isUserLoggedIn()) {
      window.location.href = '/desktop.html';
      return;
    }
    
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Obter dados do formulário
      const formData = new FormData(registerForm);
      const userData = {};
      
      for (const [key, value] of formData.entries()) {
        userData[key] = value;
      }
      
      // Validação básica
      if (!userData.username || !userData.email || !userData.password) {
        AUTH.showMessage('alert-container', 'Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      // Verificar se senhas conferem
      if (userData.password !== userData.confirmPassword) {
        AUTH.showMessage('alert-container', 'As senhas não conferem.');
        return;
      }
      
      // Remover confirmação de senha antes de enviar
      delete userData.confirmPassword;
      
      const registerBtn = document.getElementById('registerBtn');
      
      // Desabilitar botão e mostrar loading
      if (registerBtn) {
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...';
      }
      
      try {
        // Realizar registro
        const result = await AUTH.register(userData);
        
        // Mostrar mensagem de sucesso
        AUTH.showMessage('alert-container', 'Registro realizado com sucesso! Redirecionando para login...', 'success');
        
        // Redirecionar para login após breve delay
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1500);
      } catch (error) {
        AUTH.showMessage('alert-container', error.message);
        
        // Reativar botão
        if (registerBtn) {
          registerBtn.disabled = false;
          registerBtn.innerHTML = 'Registrar';
        }
      }
    });
  }
  
  // Configurar botão de logout em todas as páginas
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      AUTH.logout();
    });
  }
  
  // Atualizar elementos da UI baseados no estado de autenticação
  updateAuthUI();
});

// Atualizar elementos da UI baseados no estado de autenticação
function updateAuthUI() {
  const isLoggedIn = AUTH.isUserLoggedIn();
  
  // Atualizar elementos com classe .auth-logged-in
  document.querySelectorAll('.auth-logged-in').forEach(el => {
    el.style.display = isLoggedIn ? '' : 'none';
  });
  
  // Atualizar elementos com classe .auth-logged-out
  document.querySelectorAll('.auth-logged-out').forEach(el => {
    el.style.display = isLoggedIn ? 'none' : '';
  });
  
  // Atualizar nome do usuário onde necessário
  if (isLoggedIn) {
    const userData = AUTH.getUserData();
    if (userData && userData.username) {
      document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = `Olá, ${userData.username}`;
      });
      
      // Atualizar hero section greeting se existir
      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle) {
        heroTitle.textContent = `Olá, ${userData.username}! Vamos planejar sua próxima aventura?`;
      }
    }
  }
}

// Exportar as funções para uso global
window.AUTH = AUTH;