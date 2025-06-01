async function getAuthenticatedUser() {
  // Simule usuário autenticado/deslogado
  const isAuthenticated = true; // Troque para true/false para simular
  if (!isAuthenticated) return null;
  return {
    nome: 'Rita',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
  };
}

async function renderUserInfo() {
  try {
    const user = await getAuthenticatedUser();
    const avatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userMenu = document.getElementById('user-menu');
    const userActions = document.getElementById('user-actions');
    const userGreeting = document.getElementById('user-greeting');

    // Se algum elemento não existe, não faz nada
    if (!avatar || !userName || !userMenu || !userActions || !userGreeting) return;

    // Remove event listeners antigos para evitar múltiplos binds
    avatar.replaceWith(avatar.cloneNode(true));
    const newAvatar = document.getElementById('user-avatar');

    if (user) {
      userName.textContent = user.nome || user.firstName || user.first_name || 'Usuário';
      newAvatar.src = user.avatarUrl || '../../assets/images/default-avatar.png';
      newAvatar.style.display = '';
      userActions.style.display = 'none';
      userGreeting.style.display = '';

      // Adiciona o listener de clique no avatar
      newAvatar.onclick = function(e) {
        e.stopPropagation();
        userMenu.style.display = (userMenu.style.display === 'none' || userMenu.style.display === '') ? 'flex' : 'none';
      };

      // Fecha o menu ao clicar fora
      document.addEventListener('click', function handler(event) {
        if (!userMenu.contains(event.target) && event.target !== newAvatar) {
          userMenu.style.display = 'none';
          document.removeEventListener('click', handler);
        }
      });

      // Listeners para os links do menu
      const profileLink = userMenu.querySelector('.user-menu-link[href*="user_profile"]');
      if (profileLink) {
        profileLink.onclick = function(e) {
          e.preventDefault();
          window.location.href = '../../pages/user_profile/user-profile.html';
        };
      }
      const dashboardLink = userMenu.querySelector('.user-menu-link[href*="user_dashboard"]');
      if (dashboardLink) {
        dashboardLink.onclick = function(e) {
          e.preventDefault();
          window.location.href = '../../pages/user_dashboard/user-dashboard.html';
        };
      }

    } else {
      newAvatar.style.display = 'none';
      userName.textContent = '';
      userMenu.style.display = 'none';
      userActions.style.display = 'flex';
      userGreeting.style.display = 'none';
    }

    // Exemplo de ação para o botão Sair
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = function(e) {
        e.preventDefault();
        alert('Logout realizado!');
        window.location.href = '../../pages/login-usuario/index.html';
      };
    }
  } catch (error) {
    const userName = document.getElementById('user-name');
    if (userName) userName.textContent = 'Usuário';
  }
}

// Chama sempre que o header é incluído
renderUserInfo();

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

  // Fecha o menu ao clicar fora
  document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('user-menu');
    const avatar = document.getElementById('user-avatar');
    if (userMenu && userMenu.style.display !== 'none' && event.target !== avatar && !userMenu.contains(event.target)) {
      userMenu.style.display = 'none';
    }
  });
}); 