import { createResultCard } from '../../components/cards/result-card.js';
import { getTrashSVG } from '../user_roadmap/roadmap-utils.js';
import { apiService } from '../../services/api/apiService.js';
import { showLoading, hideLoading, showErrorToast, showSuccessToast } from '../../js/utils/ui-utils.js';

export async function renderFavorites() {
  const favoritesSection = document.getElementById('dashboard-favorites');
  if (!favoritesSection) return;

  const grid = favoritesSection.querySelector('.results-grid');
  if (!grid) return;

  try {
    showLoading('Carregando favoritos...');

  grid.innerHTML = '';
    
    // Busca favoritos do backend e extrai do campo 'data'
    const response = await apiService.getFavorites();
    const favs = response.data || [];

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
        favBtn.onclick = async (e) => {
        e.stopPropagation();
          
          try {
            await apiService.removeFavorite(fav.id);
            
            showSuccessToast('Removido dos favoritos');

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

            // Recarrega a lista
            await renderFavorites();
          } catch (error) {
            console.error('Erro ao remover favorito:', error);
            showErrorToast('Erro ao remover favorito. Tente novamente.');
          }
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
  } catch (error) {
    console.error('Erro ao carregar favoritos:', error);
    showErrorToast('Erro ao carregar favoritos. Tente novamente.');
    grid.innerHTML = '<p>Erro ao carregar favoritos. Tente novamente.</p>';
  } finally {
    hideLoading();
  }
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