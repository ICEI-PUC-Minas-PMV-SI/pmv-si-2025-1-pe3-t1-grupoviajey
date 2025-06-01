window.createResultCard = function({ image, title, rating, tags, address, favorite = false }) {
  const card = document.createElement('div');
  card.className = 'result-card';

  const imgDiv = document.createElement('div');
  imgDiv.className = 'result-image';
  if (image) {
    imgDiv.style.backgroundImage = `url('${image}')`;
    imgDiv.style.backgroundSize = 'cover';
    imgDiv.style.backgroundPosition = 'center';
  }

  // Add favorite button
  const favoriteBtn = document.createElement('button');
  favoriteBtn.className = 'favorite-btn';
  favoriteBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // Preencher o coração por padrão se favorite=true
  const path = favoriteBtn.querySelector('path');
  if (favorite) {
    favoriteBtn.classList.add('active');
    path.setAttribute('fill', '#ff4d4d');
    path.setAttribute('stroke', '#ff4d4d');
  }

  favoriteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    favoriteBtn.classList.toggle('active');
    const path = favoriteBtn.querySelector('path');
    
    // Create feedback message
    const feedbackMsg = document.createElement('div');
    feedbackMsg.className = 'favorite-feedback';
    
    if (favoriteBtn.classList.contains('active')) {
      path.setAttribute('fill', '#ff4d4d');
      path.setAttribute('stroke', '#ff4d4d');
      feedbackMsg.textContent = 'Adicionado aos favoritos';
    } else {
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'currentColor');
      feedbackMsg.textContent = 'Removido dos favoritos';
    }

    // Position the feedback message next to the button
    const rect = favoriteBtn.getBoundingClientRect();
    feedbackMsg.style.top = `${rect.top}px`;
    feedbackMsg.style.right = `${window.innerWidth - rect.left}px`;

    // Add to body and show
    document.body.appendChild(feedbackMsg);
    feedbackMsg.classList.add('show');
    
    // Remove after animation
    setTimeout(() => {
      feedbackMsg.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(feedbackMsg);
      }, 300);
    }, 2000);
  });
  imgDiv.appendChild(favoriteBtn);

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