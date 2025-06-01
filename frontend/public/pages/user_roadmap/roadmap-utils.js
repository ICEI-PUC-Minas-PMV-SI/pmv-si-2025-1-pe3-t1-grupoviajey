// Utilitários para roadmap

export function getTrashSVG() {
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8.5V14.5C6 15.3284 6.67157 16 7.5 16H12.5C13.3284 16 14 15.3284 14 14.5V8.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 5.5H16" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M11.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M7 5.5V4.5C7 3.94772 7.44772 3.5 8 3.5H12C12.5523 3.5 13 3.94772 13 4.5V5.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

export function getDragHandleSVG() {
  return `<span class="drag-handle" title="Arraste para mover">&#9776;</span>`;
}

export function parseCurrencyToNumber(str) {
  if (!str) return 0;
  str = str.replace(/(BRL|USD|EUR)/g, '').trim();
  str = str.replace(/[^\d,\.]/g, '');
  if (str.indexOf(',') > -1 && str.indexOf('.') === -1) {
    str = str.replace(',', '.');
  } else if (str.indexOf('.') > -1 && str.indexOf(',') > -1) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  return parseFloat(str) || 0;
}

// Utilitário para gerar estrelas exatas com meia estrela
function getStarsHtml(rating) {
  rating = Number(rating);
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  let stars = '★'.repeat(fullStars);
  if (halfStar) stars += '½';
  stars += '☆'.repeat(emptyStars);
  return `<span class="stars">${stars}</span> <span class="rating-value">${rating.toFixed(1)}</span>`;
}

export function createLocalCard({ name, address, rating, img, key, placeName, placeAddress, placeRating }) {
  // rating pode ser string ("★★★☆☆") ou número
  let ratingHtml = '';
  // Prioriza rating numérico
  const ratingNumber = typeof rating === 'number' ? rating : (typeof placeRating === 'number' ? placeRating : null);
  if (ratingNumber) {
    ratingHtml = `<div class="local-rating">${getStarsHtml(ratingNumber)}</div>`;
  } else if (rating) {
    ratingHtml = `<div class="local-rating"><span class="stars">${rating}</span></div>`;
  }
  const card = document.createElement('div');
  card.className = 'local-card';
  card.innerHTML = `
    ${getDragHandleSVG()}
    <button class="remove-place-btn" title="Remover local">
      ${getTrashSVG()}
    </button>
    <div class="local-img" style="min-height:90px;">${img ? `<img src="${img}" alt="Imagem do local" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : ''}</div>
    <div class="local-info">
      <div class="local-title">${name || placeName || ''}</div>
      <div class="local-address">${address || placeAddress || ''}</div>
      ${ratingHtml}
      <div class="local-actions">
        <button class="local-note-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 4h12v12H4z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M6 8h8M6 12h5" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> + Anotação</button>
        <button class="local-expense-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v7A2.5 2.5 0 0 1 14.5 16h-9A2.5 2.5 0 0 1 3 13.5v-7Z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M7 10h6M10 8v4" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> + Gastos</button>
      </div>
    </div>
  `;
  return card;
}

export function createChecklistItem(text) {
  const li = document.createElement('li');
  li.className = 'checklist-item';
  li.setAttribute('draggable', 'true');
  li.innerHTML = `
    ${getDragHandleSVG()}
    <label><input type="checkbox"> ${text}</label>
    <button class="remove-checklist-btn" title="Remover item">${getTrashSVG()}</button>
  `;
  return li;
} 