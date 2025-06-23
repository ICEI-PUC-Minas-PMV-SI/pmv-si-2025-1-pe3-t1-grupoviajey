import { onAuthChange, logoutUser } from '../../js/config/firebase-config.js';
import { apiService } from '../../services/api/apiService.js';
import { getUserProfile } from '../../js/utils/auth-protection.js';

// Função para obter elementos do DOM
function getHeaderElements() {
  return {
    userActions: document.getElementById('user-actions'),
    userGreeting: document.getElementById('user-greeting'),
    userNameEl: document.getElementById('user-name'),
    userAvatarEl: document.getElementById('user-avatar'),
    userMenu: document.getElementById('user-menu'),
    logoutBtn: document.getElementById('logout-btn')
  };
}

// --- Funções de UI ---

/**
 * Atualiza a UI para o estado "logado", mostrando os dados do usuário.
 * @param {object} userData - Dados do usuário (ex: { firstName, lastName, avatarUrl }).
 */
function updateUIAfterLogin(userData) {
  console.log('🔄 Atualizando UI para usuário logado:', userData);
  
  const elements = getHeaderElements();
  
  if (elements.userActions) {
    elements.userActions.style.display = 'none';
    console.log('✅ userActions ocultado');
  } else {
    console.log('❌ userActions não encontrado');
  }

  if (elements.userGreeting) {
    elements.userGreeting.style.display = 'inline';
    console.log('✅ userGreeting exibido');
  } else {
    console.log('❌ userGreeting não encontrado');
  }
  
  if (elements.userNameEl) {
    const firstName = userData.firstName || userData.name?.split(' ')[0] || 'Usuário';
    elements.userNameEl.textContent = firstName;
    elements.userNameEl.style.display = 'inline';
    console.log('✅ userName definido como:', firstName);
  } else {
    console.log('❌ userNameEl não encontrado');
  }
  
  if (elements.userAvatarEl) {
    elements.userAvatarEl.src = userData.avatarUrl || '/assets/images/Default_pfp.svg';
    elements.userAvatarEl.style.display = 'block';
    console.log('✅ Avatar atualizado');
  } else {
    console.log('❌ userAvatarEl não encontrado');
  }
}

/**
 * Atualiza a UI para o estado "deslogado".
 */
function updateUIAfterLogout() {
  console.log('🔄 Atualizando UI para usuário deslogado');
  
  const elements = getHeaderElements();
  
  if (elements.userActions) {
    elements.userActions.style.display = 'flex';
    console.log('✅ userActions exibido');
  } else {
    console.log('❌ userActions não encontrado');
  }

  if (elements.userGreeting) {
    elements.userGreeting.style.display = 'none';
    console.log('✅ userGreeting ocultado');
  } else {
    console.log('❌ userGreeting não encontrado');
  }
  
  if (elements.userNameEl) {
    elements.userNameEl.style.display = 'none';
    console.log('✅ userName ocultado');
  } else {
    console.log('❌ userNameEl não encontrado');
  }
  
  if (elements.userAvatarEl) {
    elements.userAvatarEl.style.display = 'none';
    console.log('✅ userAvatar ocultado');
  } else {
    console.log('❌ userAvatarEl não encontrado');
  }
  
  if (elements.userMenu) {
    elements.userMenu.style.display = 'none';
    console.log('✅ userMenu ocultado');
  } else {
    console.log('❌ userMenu não encontrado');
  }
}

// --- Lógica de Autenticação e Dados ---

/**
 * Busca os dados do perfil do usuário no backend.
 */
async function fetchUserProfile() {
  try {
    console.log('🔍 Buscando perfil do usuário no backend...');
    const response = await apiService.getUserProfile();
    console.log('✅ Perfil obtido:', response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Falha ao buscar perfil do usuário:", error);
    await handleLogout();
    return null;
  }
}

/**
 * Gerencia a mudança de estado de autenticação.
 * @param {object|null} user - Objeto do usuário do Firebase ou null.
 */
async function handleAuthStateChange(user) {
  console.log('🔄 Mudança de estado de autenticação:', user ? 'logado' : 'deslogado');
  
  if (user) {
    // Primeiro tentar buscar do localStorage
    let userProfile = getUserProfile();
    
    if (!userProfile) {
      // Se não estiver no localStorage, buscar do backend
      userProfile = await fetchUserProfile();
      if (userProfile) {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
      }
    }
    
    if (userProfile) {
      updateUIAfterLogin(userProfile);
    } else {
      console.warn('⚠️ Não foi possível obter perfil do usuário');
      updateUIAfterLogout();
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
    console.log('🚪 Iniciando logout...');
    await logoutUser();
    console.log('✅ Logout realizado com sucesso');
  } catch (error) {
    console.error("❌ Erro durante o logout:", error);
    // Mesmo com erro, limpar dados locais
    localStorage.removeItem('authToken');
    localStorage.removeItem('userUid');
    localStorage.removeItem('userProfile');
    window.location.href = '/pages/login/login.html';
  }
}

// --- Inicialização e Event Listeners ---

function setupEventListeners() {
  const elements = getHeaderElements();
  
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('🖱️ Botão logout clicado');
      handleLogout();
    });
  }

  if (elements.userAvatarEl) {
    elements.userAvatarEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (elements.userMenu) {
        // Alterna a visibilidade baseado no 'display'
        const isVisible = elements.userMenu.style.display === 'flex';
        elements.userMenu.style.display = isVisible ? 'none' : 'flex';
        console.log('🖱️ Menu do usuário:', isVisible ? 'fechado' : 'aberto');
      }
    });
  }

  // Botão Criar Roteiro
  const btnCriarRoteiro = document.getElementById('btn-criar-roteiro');
  if (btnCriarRoteiro) {
    btnCriarRoteiro.addEventListener('click', async () => {
      // Carrega e abre o modal de criação de viagem
      const module = await import('../modal/create_trip/CreateTripModal.js');
      if (module && typeof module.initCreateTripModal === 'function') {
        await module.initCreateTripModal();
      }
      if (module && typeof module.openCreateTripModal === 'function') {
        module.openCreateTripModal();
      }
    });
  }

  document.addEventListener('click', (e) => {
    const elements = getHeaderElements();
    if (elements.userMenu && !elements.userAvatarEl?.contains(e.target) && !elements.userMenu.contains(e.target)) {
      elements.userMenu.style.display = 'none';
    }
  });
}

function initializeHeader() {
  console.log('🚀 Inicializando header...');
  
  // Marcar que o header foi inicializado
  window.headerInitialized = true;
  
  // Debug: verificar se os elementos foram encontrados
  const elements = getHeaderElements();
  console.log('🔍 Elementos do DOM encontrados:');
  console.log('userActions:', elements.userActions);
  console.log('userGreeting:', elements.userGreeting);
  console.log('userNameEl:', elements.userNameEl);
  console.log('userAvatarEl:', elements.userAvatarEl);
  console.log('userMenu:', elements.userMenu);
  console.log('logoutBtn:', elements.logoutBtn);
  
  // Verificar se há usuário logado no carregamento da página
  const token = localStorage.getItem('authToken');
  if (token) {
    console.log('🔑 Token encontrado, verificando perfil...');
    const userProfile = getUserProfile();
    if (userProfile) {
      console.log('👤 Perfil encontrado no localStorage:', userProfile);
      updateUIAfterLogin(userProfile);
    } else {
      console.log('⚠️ Token existe mas perfil não encontrado, buscando no backend...');
      // Buscar perfil do backend
      fetchUserProfile().then(profile => {
        if (profile) {
          updateUIAfterLogin(profile);
        }
      });
    }
  } else {
    console.log('🔓 Nenhum token encontrado, usuário deslogado');
    updateUIAfterLogout();
  }

  // Configurar listener para mudanças de autenticação
  onAuthChange(handleAuthStateChange);

  // Configurar event listeners
  setupEventListeners();
  
  console.log('✅ Header inicializado');
}

// Função para tentar inicializar novamente se os elementos não foram encontrados
function retryInitialization() {
  const elements = getHeaderElements();
  const hasAllElements = elements.userActions && elements.userGreeting && elements.userNameEl && elements.userAvatarEl;
  
  if (!hasAllElements) {
    console.log('🔄 Elementos não encontrados, tentando novamente em 500ms...');
    setTimeout(() => {
      if (!window.headerInitialized) {
        initializeHeader();
      }
    }, 500);
  } else {
    initializeHeader();
  }
}

// Aguardar o DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', retryInitialization);
} else {
  // DOM já está pronto
  retryInitialization();
} 