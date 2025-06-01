export async function getAuthenticatedUser() {
  try {
    // Monta a URL absoluta do avatar baseada na localização atual do frontend
    const avatarUrl = `${window.location.origin}/pages/user_profile/profile-avatar.png`;
    return {
      nome: 'Rita',
      avatarUrl
    };
  } catch (error) {
    console.error('Erro ao buscar usuário autenticado:', error);
    throw error;
  }
} 