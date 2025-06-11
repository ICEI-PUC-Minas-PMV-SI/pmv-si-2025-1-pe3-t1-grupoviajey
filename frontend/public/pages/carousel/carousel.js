class ViajeyCarousel {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      title: options.title || '',
      apiEndpoint: options.apiEndpoint || '',
      dataSource: options.dataSource || 'api', // 'api' or 'localStorage'
      storageKey: options.storageKey || 'viajey_posts',
      dataType: options.dataType || 'post',
      maxItems: options.maxItems || 5,
      autoSlide: options.autoSlide !== false,
      interval: options.interval || 5000,
      onCardClick: options.onCardClick || null,
      filter: options.filter || null,
      ...options
    };
    
    this.carouselId = `carousel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.init();
  }

  async init() {
    await this.loadHTML();
    this.setupCarousel();
    await this.loadData();
  }

  async loadHTML() {
    try {
      // Use relative path based on current page location
      const response = await fetch('../../components/carousel/carousel.html');
      const html = await response.text();
      this.container.innerHTML = html;
      
      // Set unique IDs and configure
      const carousel = this.container.querySelector('.carousel');
      carousel.id = this.carouselId;
      carousel.setAttribute('data-bs-target', `#${this.carouselId}`);
      
      const prevBtn = this.container.querySelector('.carousel-control-prev');
      const nextBtn = this.container.querySelector('.carousel-control-next');
      prevBtn.setAttribute('data-bs-target', `#${this.carouselId}`);
      nextBtn.setAttribute('data-bs-target', `#${this.carouselId}`);
      
      // Set title
      if (this.options.title) {
        this.container.querySelector('.section-title').textContent = this.options.title;
      }
    } catch (error) {
      console.error('Erro ao carregar template do carousel:', error);
    }
  }

  async loadData() {
    try {
      let data = [];
      
      if (this.options.dataSource === 'localStorage') {
        const storedData = localStorage.getItem(this.options.storageKey);
        data = storedData ? JSON.parse(storedData) : [];
      } else if (this.options.apiEndpoint) {
        const response = await fetch(this.options.apiEndpoint);
        data = await response.json();
      } else {
        this.showEmptyState('Nenhuma fonte de dados configurada');
        return;
      }
      
      if (this.options.filter) {
        data = data.filter(this.options.filter);
      }
      
      if (data && data.length > 0) {
        const limitedData = data.slice(0, this.options.maxItems);
        this.createCarouselItems(limitedData);
      } else {
        this.showEmptyState('Nenhum item encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showEmptyState('Erro ao carregar dados');
    }
  }

  createCarouselItems(items) {
    const carouselInner = this.container.querySelector('.carousel-inner');
    carouselInner.innerHTML = ''; // Clear existing content
    
    // Create slides with up to 3 cards per slide for better responsive display
    const itemsPerSlide = window.innerWidth > 768 ? 3 : 1;
    const slides = [];
    
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      slides.push(items.slice(i, i + itemsPerSlide));
    }
    
    slides.forEach((slideItems, slideIndex) => {
      const carouselItem = document.createElement('div');
      carouselItem.className = `carousel-item ${slideIndex === 0 ? 'active' : ''}`;
      
      const row = document.createElement('div');
      row.className = 'row g-3 justify-content-center';
      
      slideItems.forEach(item => {
        const col = document.createElement('div');
        col.className = `col-12 col-md-${12/itemsPerSlide}`;
        
        const card = this.createCard(item);
        col.appendChild(card);
        row.appendChild(col);
      });
      
      carouselItem.appendChild(row);
      carouselInner.appendChild(carouselItem);
    });
  }

  createCard(item) {
    const card = document.createElement('div');
    card.className = 'content-card h-100 shadow-sm';
    card.style.cursor = 'pointer';
    
    const defaultImage = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80';
    const imageUrl = item.image || defaultImage;
    const stars = this.generateStars(item.rating || 5);
    
    const truncatedDescription = item.description && item.description.length > 100 
      ? item.description.substring(0, 100) + '...' 
      : (item.description || '');
    
    card.innerHTML = `
      <div class="card h-100">
        <img src="${imageUrl}" class="card-img-top" alt="${item.title}" 
             style="height: 200px; object-fit: cover;" 
             onerror="this.src='${defaultImage}'">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${item.title}</h5>
          <p class="card-text flex-grow-1">${truncatedDescription}</p>
          <div class="mt-auto">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="rating-stars text-warning">${stars}</span>
              <small class="text-muted">(${item.rating || 5})</small>
            </div>
            <span class="badge bg-primary">${this.getCategoryName(item.category)}</span>
            ${item.address ? `<div class="text-muted mt-1"><small><i class="fas fa-map-marker-alt"></i> ${item.address}</small></div>` : ''}
          </div>
        </div>
      </div>
    `;
    
    card.addEventListener('click', () => {
      if (this.options.onCardClick) {
        this.options.onCardClick(item, this.options.dataType);
      }
    });
    
    // Add hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
      card.style.transition = 'transform 0.3s ease';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
    
    return card;
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

  showEmptyState(message) {
    const carouselInner = this.container.querySelector('.carousel-inner');
    const carouselItem = document.createElement('div');
    carouselItem.className = 'carousel-item active';
    
    carouselItem.innerHTML = `
      <div class="text-center py-5">
        <div class="empty-state">
          <i class="fas fa-info-circle fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">${message}</h5>
        </div>
      </div>
    `;
    
    carouselInner.appendChild(carouselItem);
  }

  setupCarousel() {
    if (this.options.autoSlide && window.bootstrap) {
      const carouselElement = this.container.querySelector('.carousel');
      new bootstrap.Carousel(carouselElement, {
        interval: this.options.interval,
        ride: 'carousel'
      });
    }
  }
}

window.ViajeyCarousel = ViajeyCarousel;
