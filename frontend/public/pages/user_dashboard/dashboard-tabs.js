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
  // Exibir conteúdo da aba (mock)
  const trips = document.getElementById('dashboard-trips');
  const actions = document.querySelector('.dashboard-actions');
  if (tabId === 'trips') {
    trips.style.display = '';
    if (actions) actions.style.display = '';
  } else {
    trips.style.display = 'none';
    if (actions) actions.style.display = 'none';
  }
} 