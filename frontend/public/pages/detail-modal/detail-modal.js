class DetailModal {
  constructor(container) {
    this.container = container;
    this.modalId = `detailModal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.modal = null;
    this.init();
  }

  async init() {
    await this.loadHTML();
    this.setupModal();
  }

  async loadHTML() {
    try {
      // Use relative path based on current page location
      const response = await fetch('../../components/modal/detail-modal/detail-modal.html');
      const html = await response.text();
      this.container.innerHTML = html;
      
      // Set unique ID
      const modalElement = this.container.querySelector('.modal');
      modalElement.id = this.modalId;
    } catch (error) {
      console.error('Erro ao carregar template do modal:', error);
    }
  }

  setupModal() {
    const modalElement = this.container.querySelector('.modal');
    if (window.bootstrap) {
      this.modal = new bootstrap.Modal(modalElement);
    }
  }

  show(item, type = 'post') {
    if (!this.modal) return;

    const modalTitle = this.container.querySelector('.modal-title');
    const modalBody = this.container.querySelector('.modal-body');
    
    modalTitle.textContent = item.title;
    
    const content = this.generateModalContent(item, type);
    modalBody.innerHTML = content;
    
    this.modal.show();
  }

  generateModalContent(item, type) {
    const defaultImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80';
    const imageUrl = item.image || defaultImage;
    const stars = this.generateStars(item.rating || 5);
    
    let linkHtml = '';
    if (item.link) {
      linkHtml = `<a href="${item.link}" target="_blank" class="modal-link">Visitar Link</a>`;
    }
    
    return `
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
}

window.DetailModal = DetailModal;
