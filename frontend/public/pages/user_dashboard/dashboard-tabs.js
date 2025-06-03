import { renderFavorites } from './dashboard-favorites.js';
import { renderTrips } from './dashboard-trips.js';
import { renderReviews } from './dashboard-reviews.js';

// Inicializa dados mockados no localStorage se não existirem
function initMockData() {
  if (!localStorage.getItem('userTrips')) {
    localStorage.setItem('userTrips', JSON.stringify([
      {
        id: 1,
        title: 'Viagem a Paris',
        date: '2025-05-15/2025-05-25',
        descricao: 'Uma viagem inesquecível pela capital francesa.',
        isPast: false
      },
      {
        id: 2,
        title: 'Férias no Rio',
        date: '2025-05-15/2025-05-25',
        descricao: 'Aproveite as praias e o clima carioca.',
        isPast: false
      }
    ]));
  }

  if (!localStorage.getItem('userReviews')) {
    localStorage.setItem('userReviews', JSON.stringify([
      {
        id: 1,
        place: 'Museu do Amanhã',
        rating: 4,
        comment: 'Museu incrível com exposições interativas!'
      },
      {
        id: 2,
        place: 'Cristo Redentor',
        rating: 5,
        comment: 'Vista deslumbrante da cidade!'
      }
    ]));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMockData();

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
}); 