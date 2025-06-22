import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';
import { protectPage, startAuthMonitoring } from '../../js/utils/auth-protection.js';
import { initDashboardTabs } from './dashboard-tabs.js';
import { initDashboardTrips } from './dashboard-trips.js';
import { initDashboardEvents } from './dashboard-events.js';
import { createFavoritesComponent } from '../../components/favorites/favorites.js';

// Ponto de entrada da página
export async function initDashboard() {
  console.log('Dashboard: Inicializando...');

  // Verificar autenticação e perfil válido
  const isAuthenticated = await protectPage();
  if (!isAuthenticated) {
    return; // A função protectPage já redireciona se necessário
  }

  // Incluir componentes
  includeHeader();
  includeFooter();
  includeSearchBar();

  // Inicializar funcionalidades
  initDashboardTabs();
  await initDashboardTrips();

  if (typeof initDashboardEvents === 'function') {
    initDashboardEvents();
  }

  // Iniciar monitoramento de autenticação
  startAuthMonitoring();

  console.log('Dashboard: Inicialização concluída');
}

// Inicialização automática
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
} 