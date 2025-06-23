import { createResultCard } from '../../components/cards/result-card.js';
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

    const handleDelete = async (placeId) => {
      try {
        showLoading('Removendo...');
        await apiService.removeFavoriteByPlaceId(placeId);
        showSuccessToast('Removido dos favoritos');
        await renderFavorites(); // Recarrega a lista
      } catch (error) {
        console.error('Erro ao remover favorito:', error);
        showErrorToast('Erro ao remover favorito. Tente novamente.');
      } finally {
        hideLoading();
      }
    };

    favs.forEach(fav => {
      const card = createResultCard({
        ...fav,
        title: fav.name,
        type: fav.type,
        mode: 'dashboard',
        onDelete: handleDelete
      });

      // Adiciona evento de clique no card para abrir o modal de detalhes
      card.addEventListener('click', () => {
        if (window.openPlaceDetailsModal) {
          window.openPlaceDetailsModal({
            name: fav.name,
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
