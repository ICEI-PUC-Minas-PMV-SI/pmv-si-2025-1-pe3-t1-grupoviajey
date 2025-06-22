import { renderFavorites } from './dashboard-favorites.js';
import { renderTrips } from './dashboard-trips.js';
import { renderReviews } from './dashboard-reviews.js';

export function initDashboardTabs() {
  const tabs = document.querySelectorAll('.dashboard-tabs [data-tab]');
  const contentIds = {
    trips: 'dashboard-trips',
    favorites: 'dashboard-favorites',
    reviews: 'dashboard-reviews',
  };

  function showTab(tabName) {
    Object.values(contentIds).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    const activeEl = document.getElementById(contentIds[tabName]);
    if (activeEl) activeEl.style.display = 'block';

    // Renderização dinâmica
    if (tabName === 'favorites') renderFavorites();
    if (tabName === 'trips') renderTrips();
    if (tabName === 'reviews') renderReviews();
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      showTab(tab.dataset.tab);
    });
  });

  // Exibe a primeira aba por padrão
  showTab('trips');
  tabs[0].classList.add('active');
} 