import { apiService } from '../../services/api/apiService.js';
import { showSuccessToast, showErrorToast } from '../../js/utils/ui-utils.js';
import { getTrashSVG } from '../../pages/user_roadmap/roadmap-utils.js';
import { getAuthToken } from '../../js/config/firebase-config.js';

export function createResultCard({
  id,
  image,
  title,
  rating,
  tags,
  address,
  price_level,
  type,
  mode = 'search', // 'search' or 'dashboard'
  onDelete = null, // Callback for dashboard mode
  placeId = null // For favorites, the placeId is in a nested property
}) {
  const card = document.createElement('div');
  card.className = 'result-card';
  card.dataset.placeId = id;

  const imgDiv = document.createElement('div');
  imgDiv.className = 'result-image';
  if (image) {
    imgDiv.style.backgroundImage = `url('${image}')`;
  }

  const effectivePlaceId = mode === 'dashboard' ? placeId : id;

  const isLoggedIn = !!getAuthToken();

  if (mode === 'search') {
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    imgDiv.appendChild(favoriteBtn);

    const setupFavoriteButton = async () => {
      if (!isLoggedIn) return;

      try {
        const favStatus = await apiService.isFavorite(effectivePlaceId);
        if (favStatus.data.isFavorite) {
          favoriteBtn.classList.add('active');
          favoriteBtn.querySelector('path').setAttribute('fill', '#ff4d4d');
          favoriteBtn.querySelector('path').setAttribute('stroke', '#ff4d4d');
        }
      } catch (error) {
        // Don't log expected "invalid token" errors on public pages.
        // These can occur if a user's session has expired.
        if (!error.message.includes('Token inválido ou expirado')) {
          console.error(`Failed to check favorite status for place ${effectivePlaceId}:`, error);
        }
      }
    };

    setupFavoriteButton();

    favoriteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();

      if (!isLoggedIn) {
        showErrorToast('Você precisa estar logado para adicionar favoritos.');
        return;
      }

      const isFavorited = favoriteBtn.classList.contains('active');
      const path = favoriteBtn.querySelector('path');

      try {
        if (isFavorited) {
          await apiService.removeFavoriteByPlaceId(effectivePlaceId);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', 'currentColor');
          favoriteBtn.classList.remove('active');
          showSuccessToast('Removido dos favoritos!');
        } else {
          const placeData = { placeId: effectivePlaceId, name: title, address, rating, type };
          await apiService.addFavorite(placeData);
          path.setAttribute('fill', '#ff4d4d');
          path.setAttribute('stroke', '#ff4d4d');
          favoriteBtn.classList.add('active');
          showSuccessToast('Adicionado aos favoritos!');
        }
      } catch (error) {
        showErrorToast('Erro ao atualizar favoritos.');
      }
    });
  } else if (mode === 'dashboard' && onDelete) {
    const trashBtn = document.createElement('button');
    trashBtn.className = 'favorite-btn trash-btn'; // Use same base class for positioning
    trashBtn.innerHTML = getTrashSVG();
    trashBtn.title = 'Remover dos favoritos';
    trashBtn.onclick = (e) => {
      e.stopPropagation();
      onDelete(effectivePlaceId); // Pass the placeId to the handler
    };
    imgDiv.appendChild(trashBtn);
  }

  const info = document.createElement('div');
  info.className = 'result-info';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'result-title';
  titleDiv.textContent = title;

  // Add type tag only in dashboard mode
  let typeDiv = null;
  if (type && mode === 'dashboard') {
    typeDiv = document.createElement('div');
    typeDiv.className = 'result-type';
    typeDiv.textContent = type;
  }

  const ratingDiv = document.createElement('div');
  ratingDiv.className = 'result-rating';
  ratingDiv.textContent = rating ? ('★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))) : 'Sem avaliação';

  let priceDiv = null;
  if (typeof price_level === 'number') {
    priceDiv = document.createElement('div');
    priceDiv.className = 'result-price';
    priceDiv.textContent = 'Preço: ' + '$'.repeat(price_level);
  }

  const addressDiv = document.createElement('div');
  addressDiv.className = 'result-address';
  addressDiv.title = address || '';
  addressDiv.textContent = address || '';

  const actions = document.createElement('div');
  actions.className = 'result-actions';
  actions.innerHTML = `
    <button class="result-btn">Adicionar ao roteiro</button>
  `;

  info.appendChild(titleDiv);
  if (typeDiv) info.appendChild(typeDiv);
  info.appendChild(ratingDiv);
  if (priceDiv) info.appendChild(priceDiv);
  info.appendChild(addressDiv);
  info.appendChild(actions);

  card.appendChild(imgDiv);
  card.appendChild(info);

  return card;
} 