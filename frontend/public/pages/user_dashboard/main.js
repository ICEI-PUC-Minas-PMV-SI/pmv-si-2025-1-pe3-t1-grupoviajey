import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';
import './dashboard-tabs.js';
import { initDashboardTrips } from './dashboard-trips.js';
import { initDashboardEvents } from './dashboard-events.js';
import { createFavoritesComponent } from '../../components/favorites/favorites.js';

// Ponto de entrada da página
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard: Inicializando...');

  // Incluir componentes
  includeHeader();
  includeFooter();
  includeSearchBar();

  // Inicializar funcionalidades
  initDashboardTrips();

  if (typeof initDashboardEvents === 'function') {
    initDashboardEvents();
  }

  console.log('Dashboard: Inicialização concluída');
}); 