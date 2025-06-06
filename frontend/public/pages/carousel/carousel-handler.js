class CarouselHandler {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadPosts();
    await this.loadAds();
    this.initializeCarousels();
  }

  async loadPosts() {
    try {
      const response = await fetch('/api/posts');
      const posts = await response.json();
      
      if (posts && posts.length > 0) {
        const limitedPosts = posts.slice(0, 5);
        this.createCarouselItems('postsCarouselInner', limitedPosts, 'post');
      } else {
        this.showEmptyState('postsCarouselInner', 'Nenhuma postagem encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      this.showEmptyState('postsCarouselInner', 'Erro ao carregar postagens');
    }
  }

  async loadAds() {
    try {
      const response = await fetch('/api/ads');
      const ads = await response.json();
      
      if (ads && ads.length > 0) {
        const approvedAds = ads.filter(ad => ad.status === 'approved').slice(0, 5);
        this.createCarouselItems('adsCarouselInner', approvedAds, 'ad');
      } else {
        this.showEmptyState('adsCarouselInner', 'Nenhum anúncio encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error);
      this.showEmptyState('adsCarouselInner', 'Erro ao carregar anúncios');
    }
  }

  createCarouselItems(containerId, items, type) {
    const container = document.getElementById(containerId);
    const carouselItem = document.createElement('div');
    carouselItem.className = 'carousel-item active';
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'carousel-cards';
    
    items.forEach(item => {
      const card = this.createCard(item, type);
      cardsContainer.appendChild(card);
    });
    
    carouselItem.appendChild(cardsContainer);
    container.appendChild(carouselItem);
  }

  createCard(item, type) {
    const card = document.createElement('div');
    card.className = 'content-card';
    card.onclick = () => this.showModal(item, type);

    const defaultImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80';
    const imageUrl = item.image || defaultImage;
    
    const stars = this.generateStars(item.rating || 5);
    
    card.innerHTML = `
      <img src="${imageUrl}" alt="${item.title}" onerror="this.src='${defaultImage}'">
      <div class="card-body">
        <h5 class="card-title">${item.title}</h5>
        <p class="card-description">${item.description || ''}</p>
        <div class="card-rating">
          <span class="rating-stars">${stars}</span>
          <span class="rating-text">(${item.rating || 5})</span>
        </div>
        <span class="card-category">${this.getCategoryName(item.category)}</span>
      </div>
    `;
    
    return card;
  }

  showModal(item, type) {
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = item.title;
    
    const defaultImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80';
    const imageUrl = item.image || defaultImage;
    const stars = this.generateStars(item.rating || 5);
    
    let linkHtml = '';
    if (item.link) {
      linkHtml = `<a href="${item.link}" target="_blank" class="modal-link">Visitar Link</a>`;
    }
    
    modalBody.innerHTML = `
      <img src="${imageUrl}" alt="${item.title}" class="modal-image" onerror="this.src='${defaultImage}'">
      <div class="modal-rating">
        <span class="rating-stars">${stars}</span>
        <span class="rating-text">(${item.rating || 5} estrelas)</span>
      </div>
      <span class="modal-category">${this.getCategoryName(item.category)}</span>
      ${item.address ? `<div class="modal-address">📍 ${item.address}</div>` : ''}
      <div class="modal-description">${item.description || 'Sem descrição disponível.'}</div>
      ${linkHtml}
    `;
    
    modal.show();
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }
    
    if (hasHalfStar) {
      stars += '☆';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars += '☆';
    }
    
    return stars;
  }

  getCategoryName(category) {
    const categories = {
      'hotel': 'Hotel',
      'restaurante': 'Restaurante',
      'atividade': 'Atividade',
      'transporte': 'Transporte',
      'outros': 'Outros'
    };
    return categories[category] || category || 'Sem categoria';
  }

  showEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    const carouselItem = document.createElement('div');
    carouselItem.className = 'carousel-item active';
    
    carouselItem.innerHTML = `
      <div class="text-center py-5">
        <h5 class="text-muted">${message}</h5>
      </div>
    `;
    
    container.appendChild(carouselItem);
  }

  initializeCarousels() {
    // Initialize Bootstrap carousels
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
      new bootstrap.Carousel(carousel, {
        interval: 5000,
        ride: 'carousel'
      });
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CarouselHandler();
});
