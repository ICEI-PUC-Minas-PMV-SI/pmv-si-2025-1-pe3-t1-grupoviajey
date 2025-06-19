// auth-protection.js
// Script para proteger páginas que requerem autenticação e perfil válido

import { isUserLoggedIn, verifyUserProfile, logoutUser } from '../config/firebase-config.js';

export async function protectPage() {
  // Verificar se o usuário está logado
  if (!isUserLoggedIn()) {
    console.log('Usuário não está logado, redirecionando para login...');
    window.location.href = '/pages/login-usuario/login.html';
    return false;
  }

  // Verificar se o usuário tem perfil válido
  try {
    const verifyResult = await verifyUserProfile();
    if (!verifyResult.success) {
      console.log('Usuário sem perfil válido:', verifyResult.message);
      
      // Fazer logout
      await logoutUser();
      
      // Mostrar mensagem e redirecionar
      alert('Usuário não encontrado no sistema. Por favor, faça o cadastro primeiro.');
      window.location.href = '/pages/login-usuario/login.html';
      return false;
    }
    
    console.log('Usuário autenticado e com perfil válido');
    return true;
  } catch (error) {
    console.error('Erro na verificação do perfil:', error);
    
    // Em caso de erro, fazer logout por segurança
    await logoutUser();
    alert('Erro na verificação do perfil. Por favor, faça login novamente.');
    window.location.href = '/pages/login-usuario/login.html';
    return false;
  }
}

// Função para verificar autenticação em intervalos regulares
export function startAuthMonitoring(intervalMs = 30000) { // 30 segundos
  setInterval(async () => {
    if (isUserLoggedIn()) {
      const verifyResult = await verifyUserProfile();
      if (!verifyResult.success) {
        console.log('Perfil do usuário se tornou inválido durante a sessão');
        await logoutUser();
        alert('Sua sessão expirou ou foi invalidada. Por favor, faça login novamente.');
        window.location.href = '/pages/login-usuario/login.html';
      }
    }
  }, intervalMs);
} 