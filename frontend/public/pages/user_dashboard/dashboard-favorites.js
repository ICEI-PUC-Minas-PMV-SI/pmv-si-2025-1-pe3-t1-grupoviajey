import { createResultCard } from '../../components/cards/result-card.js';
import { userService } from '../../js/services/user-service.js';
import { getTrashSVG } from '../user_roadmap/roadmap-utils.js';

export async function renderFavorites() {
  const favoritesSection = document.getElementById('dashboard-favorites');
  if (!favoritesSection) return;

  const grid = favoritesSection.querySelector('.results-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const favs = userService.getFavorites();

  if (favs.length === 0) {
    grid.innerHTML = `
      <div class="empty-favorites">
        <p>Você ainda não tem lugares favoritos.</p>
        <p>Explore lugares e adicione aos favoritos clicando no coração!</p>
      </div>
    `;
    return;
  }

  favs.forEach(fav => {
    // Bloqueia o feedback do coração apenas durante a criação do card
    const originalAppend = document.body.appendChild;
    document.body.appendChild = function (node) {
      if (node && node.classList && node.classList.contains('favorite-feedback')) {
        return node; // não adiciona o feedback do coração
      }
      return originalAppend.call(this, node);
    };
    const card = createResultCard(fav);
    document.body.appendChild = originalAppend; // restaura

    // Substitui o botão de favorito por uma lixeira
    const favBtn = card.querySelector('.trash-btn, .favorite-btn');
    if (favBtn) {
      favBtn.innerHTML = getTrashSVG();
      favBtn.title = 'Remover dos favoritos';
      favBtn.classList.add('trash-btn');
      favBtn.classList.remove('favorite-btn', 'active');
      favBtn.onclick = (e) => {
        e.stopPropagation();
        userService.removeFromFavorites(fav.id);

        // Remove qualquer feedback antigo do DOM antes de mostrar o novo
        document.querySelectorAll('.favorite-feedback').forEach(el => el.remove());

        // Feedback visual
        const feedbackMsg = document.createElement('div');
        feedbackMsg.className = 'favorite-feedback show';
        feedbackMsg.textContent = 'Removido dos favoritos';
        document.body.appendChild(feedbackMsg);

        // Centraliza próximo ao botão
        const rect = favBtn.getBoundingClientRect();
        feedbackMsg.style.position = 'fixed';
        feedbackMsg.style.top = `${rect.top - 10}px`;
        feedbackMsg.style.left = `${rect.right + 10}px`;

        setTimeout(() => {
          feedbackMsg.classList.remove('show');
          setTimeout(() => {
            if (feedbackMsg.parentNode) feedbackMsg.parentNode.removeChild(feedbackMsg);
          }, 300);
        }, 1800);

        renderFavorites();
      };
    }

    // Adiciona evento de clique no card para abrir o modal de detalhes
    card.addEventListener('click', () => {
      if (window.openPlaceDetailsModal) {
        window.openPlaceDetailsModal({
          name: fav.title,
          address: fav.address,
          rating: fav.rating
        });
      }
    });

    grid.appendChild(card);
  });
}

async function fetchUserFavorites() {
  // Para integração real, descomente a linha abaixo e ajuste a rota da sua API:
  // return fetch('/api/favoritos').then(res => res.json());
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

// Troca de abas
document.querySelector('[data-tab="favorites"]').addEventListener('click', () => {
  document.getElementById('dashboard-favorites').style.display = 'block';
  document.getElementById('dashboard-trips').style.display = 'none';
  renderFavorites();
});
document.querySelector('[data-tab="trips"]').addEventListener('click', () => {
  document.getElementById('dashboard-favorites').style.display = 'none';
  document.getElementById('dashboard-trips').style.display = 'block';
}); 