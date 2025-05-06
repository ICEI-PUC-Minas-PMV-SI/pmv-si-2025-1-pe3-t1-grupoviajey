/**
 * Gerenciamento de Autenticação no Cliente
 * Funções para login, registro e gerenciamento de tokens JWT
 */

// Armazenamento dos dados do usuário e token
const auth = {
  token: null,
  user: null,
  initialized: false
};

// Inicializar o estado de autenticação a partir do localStorage
function initAuth() {
  if (auth.initialized) return;
  
  try {
    // Recuperar token do localStorage
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token) {
      auth.token = token;
      if (userData) {
        auth.user = JSON.parse(userData);
      }
      
      // Verificar o token no servidor
      verifyToken();
    }
  } catch (error) {
    console.error('Erro ao inicializar autenticação:', error);
    logout(); // Limpar dados em caso de erro
  }
  
  auth.initialized = true;
}

// Verificar o token JWT no servidor
async function verifyToken() {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Token inválido');
    }
    
    const data = await response.json();
    if (data.valid && data.user) {
      // Atualizar dados do usuário
      auth.user = data.user;
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Atualizar UI se necessário
      updateAuthUI();
      return true;
    } else {
      throw new Error('Token inválido ou expirado');
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    logout();
    return false;
  }
}

// Login do usuário
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer login');
    }
    
    const data = await response.json();
    
    // Armazenar token e dados do usuário
    auth.token = data.token;
    auth.user = data.user;
    
    // Salvar no localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    // Atualizar UI
    updateAuthUI();
    
    return data;
  } catch (error) {
    console.error('Erro de login:', error);
    throw error;
  }
}

// Registro de novo usuário
async function register(userData) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao registrar');
    }
    
    const data = await response.json();
    
    // Armazenar token e dados do usuário
    auth.token = data.token;
    auth.user = data.user;
    
    // Salvar no localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));
    
    // Atualizar UI
    updateAuthUI();
    
    return data;
  } catch (error) {
    console.error('Erro de registro:', error);
    throw error;
  }
}

// Logout do usuário
function logout() {
  // Limpar dados de autenticação
  auth.token = null;
  auth.user = null;
  
  // Remover do localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  
  // Atualizar UI
  updateAuthUI();
  
  // Redirecionar para a página inicial
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
    window.location.href = '/';
  }
}

// Função para adicionar token de autenticação às requisições fetch
function fetchWithAuth(url, options = {}) {
  // Verificar se o usuário está autenticado
  if (!auth.token) {
    // Se não estiver autenticado e a opção requireAuth for true, rejeitar
    if (options.requireAuth) {
      return Promise.reject(new Error('Token de autenticação não fornecido. Por favor, tente novamente.'));
    }
  }
  
  // Configurar headers
  const headers = options.headers || {};
  
  // Adicionar token se disponível
  if (auth.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }
  
  // Configurar Content-Type se não especificado e houver body
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Retornar fetch com headers atualizados
  return fetch(url, {
    ...options,
    headers
  });
}

// Atualizar elementos da UI baseados no estado de autenticação
function updateAuthUI() {
  // Implementar de acordo com os elementos da interface
  const isLoggedIn = !!auth.user;
  
  // Atualizar elementos com classe .auth-logged-in
  document.querySelectorAll('.auth-logged-in').forEach(el => {
    el.style.display = isLoggedIn ? '' : 'none';
  });
  
  // Atualizar elementos com classe .auth-logged-out
  document.querySelectorAll('.auth-logged-out').forEach(el => {
    el.style.display = isLoggedIn ? 'none' : '';
  });
  
  // Atualizar nome do usuário onde necessário
  document.querySelectorAll('.user-name').forEach(el => {
    if (isLoggedIn && auth.user.username) {
      el.textContent = auth.user.username;
    }
  });
  
  // Atualizar hero section greeting se existir
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && isLoggedIn && auth.user.username) {
    heroTitle.textContent = `Olá, ${auth.user.username}! Vamos planejar sua próxima aventura?`;
  }
}

// Verificar se o usuário está autenticado
function isAuthenticated() {
  return !!auth.token && !!auth.user;
}

// Obter o usuário atual
function getCurrentUser() {
  return auth.user;
}

// Obter o token atual
function getToken() {
  return auth.token;
}

// Exportar as funções para uso global
window.AuthManager = {
  init: initAuth,
  login,
  register,
  logout,
  isAuthenticated,
  getCurrentUser,
  getToken,
  fetchWithAuth,
  verifyToken
};

// Inicializar automaticamente
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});