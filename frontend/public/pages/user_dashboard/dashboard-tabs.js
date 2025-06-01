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
    btn.textContent = tab.label;
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
  // Exibir conteúdo da aba (mock)
  const trips = document.getElementById('dashboard-trips');
  if (tabId === 'trips') {
    trips.style.display = '';
  } else {
    trips.style.display = 'none';
  }
} 