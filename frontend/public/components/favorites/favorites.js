import { userService } from '../../js/services/user-service.js';

export function createFavoritesComponent() {
    const container = document.createElement('div');
    container.className = 'favorites-container';

    function renderFavorites() {
        const favorites = userService.getFavorites();

        if (favorites.length === 0) {
            container.innerHTML = `
        <div class="empty-favorites">
          <p>Você ainda não tem lugares favoritos.</p>
          <p>Explore lugares e adicione aos favoritos clicando no coração!</p>
        </div>
      `;
            return;
        }

        container.innerHTML = `
      <div class="favorites-grid">
        ${favorites.map(place => `
          <div class="favorite-card" data-id="${place.id}">
            <div class="favorite-image" style="background-image: url('${place.image}')">
              <button class="favorite-btn active">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                    fill="#ff4d4d" stroke="#ff4d4d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="favorite-info">
              <h3 class="favorite-title">${place.title}</h3>
              <div class="favorite-rating">${'★'.repeat(Math.round(place.rating))}${'☆'.repeat(5 - Math.round(place.rating))}</div>
              <p class="favorite-address">${place.address}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

        // Add event listeners to favorite buttons
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.favorite-card');
                const placeId = card.dataset.id;

                if (userService.removeFromFavorites(placeId)) {
                    renderFavorites(); // Re-render the list
                }
            });
        });
    }

    // Initial render
    renderFavorites();

    return container;
} 