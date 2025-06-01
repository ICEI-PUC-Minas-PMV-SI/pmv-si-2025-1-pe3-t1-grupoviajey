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

  if (tabId === 'trips') {
    trips.style.display = '';
    if (actions) actions.style.display = '';
    favorites.style.display = 'none';
  } else if (tabId === 'favorites') {
    trips.style.display = 'none';
    if (actions) actions.style.display = 'none';
    favorites.style.display = '';
    renderFavorites();
  } else {
    trips.style.display = 'none';
    if (actions) actions.style.display = 'none';
    favorites.style.display = 'none';
  }
}

async function fetchUserFavorites() {
  // Para integração real, descomente a linha abaixo e ajuste a rota da sua API:
  // return fetch('/api/favoritos').then(res => res.json());

  // Mock de favoritos
  return [
    {
      image: '',
      title: 'Museu do Amanhã',
      rating: 4,
      tags: ['Museu', 'Cultura'],
      address: 'Praça Mauá, Rio de Janeiro',
      favorite: true
    },
    {
      image: '',
      title: 'Cristo Redentor',
      rating: 5,
      tags: ['Ponto turístico'],
      address: 'Alto da Boa Vista, Rio de Janeiro',
      favorite: true
    }
  ];
}

async function renderFavorites() {
  const favorites = document.getElementById('dashboard-favorites');
  if (!favorites) return;
  favorites.innerHTML = '';
  // Buscar favoritos do backend (mock ou real)
  const favs = await fetchUserFavorites();
  // Incluir CSS/JS do card se necessário
  if (!document.querySelector('link[href*="result-card.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../../components/cards/result-card.css';
    document.head.appendChild(link);
  }
  if (!window.createResultCard) {
    const script = document.createElement('script');
    script.src = '../../components/cards/result-card.js';
    document.body.appendChild(script);
    script.onload = () => renderFavorites();
    return;
  }
  favs.forEach(fav => {
    const card = window.createResultCard(fav);
    favorites.appendChild(card);
  });
} 