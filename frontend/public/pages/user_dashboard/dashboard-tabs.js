import { renderFavorites } from './dashboard-favorites.js';
import { renderReviews } from './dashboard-reviews.js';

export function initDashboardTabs() {
  const tabs = [
    { id: 'trips', label: 'Minhas viagens' },
    { id: 'favorites', label: 'Favoritos' },
    { id: 'reviews', label: 'Avaliações' }
  ];
  const tabsContainer = document.getElementById('dashboard-tabs');
  if (!tabsContainer) return;
  tabsContainer.innerHTML = '';
  tabs.forEach(tab => {
    const btn = document.createElement('button');
    btn.className = 'dashboard-tab';
    const h2 = document.createElement('h2');
    h2.textContent = tab.label;
    h2.style.margin = '0';
    h2.style.fontSize = 'inherit';
    btn.appendChild(h2);
    btn.dataset.tab = tab.id;
    btn.addEventListener('click', () => selectTab(tab.id));
    tabsContainer.appendChild(btn);
  });
  selectTab('trips');
}

function selectTab(tabId) {
  document.querySelectorAll('.dashboard-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  const trips = document.getElementById('dashboard-trips');
  const actions = document.querySelector('.dashboard-actions');
  let favorites = document.getElementById('dashboard-favorites');
  if (!favorites) {
    favorites = document.createElement('div');
    favorites.id = 'dashboard-favorites';
    favorites.style.display = 'none';
    const dashboardContent = document.getElementById('dashboard-content');
    dashboardContent.appendChild(favorites);
  }
  let reviews = document.getElementById('dashboard-reviews');
  if (!reviews) {
    reviews = document.createElement('div');
    reviews.id = 'dashboard-reviews';
    reviews.style.display = 'none';
    const dashboardContent = document.getElementById('dashboard-content');
    dashboardContent.appendChild(reviews);
  }

  if (tabId === 'trips') {
    trips.style.display = '';
    if (actions) actions.style.display = '';
    favorites.style.display = 'none';
    reviews.style.display = 'none';
  } else if (tabId === 'favorites') {
    trips.style.display = 'none';
    if (actions) actions.style.display = 'none';
    favorites.style.display = '';
    reviews.style.display = 'none';
    renderFavorites();
  } else if (tabId === 'reviews') {
    trips.style.display = 'none';
    if (actions) actions.style.display = 'none';
    favorites.style.display = 'none';
    reviews.style.display = '';
    renderReviews(1);
  } else {
    trips.style.display = 'none';
    if (actions) actions.style.display = 'none';
    favorites.style.display = 'none';
    reviews.style.display = 'none';
  }
} 