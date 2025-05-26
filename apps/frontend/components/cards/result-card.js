window.createResultCard = function({ image, title, rating, tags, address, price_level }) {
  const card = document.createElement('div');
  card.className = 'result-card';

  const imgDiv = document.createElement('div');
  imgDiv.className = 'result-image';
  if (image) {
    imgDiv.style.backgroundImage = `url('${image}')`;
    imgDiv.style.backgroundSize = 'cover';
    imgDiv.style.backgroundPosition = 'center';
  }

  const info = document.createElement('div');
  info.className = 'result-info';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'result-title';
  titleDiv.textContent = title;

  const ratingDiv = document.createElement('div');
  ratingDiv.className = 'result-rating';
  ratingDiv.textContent = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

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
  info.appendChild(ratingDiv);
  if (priceDiv) info.appendChild(priceDiv);
  info.appendChild(addressDiv);
  info.appendChild(actions);

  card.appendChild(imgDiv);
  card.appendChild(info);

  return card;
} 