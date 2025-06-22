// auth-protection.js
// Script para proteger páginas que requerem autenticação e perfil válido

import { checkAuthAndRedirect, isUserLoggedIn, logoutUser } from '../config/firebase-config.js';
import { apiService } from '../../services/api/apiService.js';

// Função para proteger uma página
export async function protectPage() {
  try {
    const isAuthenticated = await checkAuthAndRedirect();
    return isAuthenticated;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
}

// Função para verificar se o usuário está logado sem redirecionar
export function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  return !!token;
}

// Função para obter perfil do usuário do localStorage
export function getUserProfile() {
  const profile = localStorage.getItem('userProfile');
  return profile ? JSON.parse(profile) : null;
}

// Função para verificar se o usuário é admin
export function isAdmin() {
  const profile = getUserProfile();
  return profile && profile.userType === 'admin';
}

// Função para verificar se o usuário é parceiro
export function isPartner() {
  const profile = getUserProfile();
  return profile && profile.userType === 'partner';
}

// Função para verificar se o usuário é viajante
export function isTraveler() {
  const profile = getUserProfile();
  return profile && profile.userType === 'traveler';
}

// Função para aplicar proteção em páginas que requerem autenticação
export async function applyAuthProtection() {
  // Lista de páginas que requerem autenticação
  const protectedPages = [
    '/pages/user_dashboard/user-dashboard.html',
    '/pages/user_profile/user-profile.html',
    '/pages/user_roadmap/user-roadmap.html',
    '/pages/partner/partner.html',
    '/pages/partner/createAd.html',
    '/pages/partner/editAd.html',
    '/pages/posts/createPost.html',
    '/pages/posts/editPost.html',
    '/pages/posts/managePosts.html',
    '/pages/ads/approveAds.html'
  ];

  const currentPath = window.location.pathname;
  
  // Verificar se a página atual requer autenticação
  const requiresAuth = protectedPages.some(page => currentPath.includes(page));
  
  if (requiresAuth) {
    await protectPage();
  }
}

// Aplicar proteção automaticamente quando o script é carregado
document.addEventListener('DOMContentLoaded', () => {
  applyAuthProtection();
});

// Função para verificar autenticação em intervalos regulares
export function startAuthMonitoring(intervalMs = 30000) { // 30 segundos
  setInterval(async () => {
    if (isUserLoggedIn()) {
      try {
        await apiService.verifyToken();
      } catch (error) {
        console.log('Token do usuário se tornou inválido durante a sessão');
        await logoutUser();
        alert('Sua sessão expirou ou foi invalidada. Por favor, faça login novamente.');
        window.location.href = '/pages/login-usuario/login.html';
      }
    }
  }, intervalMs);
} 