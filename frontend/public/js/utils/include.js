// include.js
import { loadGoogleMapsScript } from '../core/map/loader.js';

// Função genérica para incluir HTML em um elemento
export function includeHTML(id, file, callback) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = data;
        // Executa scripts externos encontrados no HTML incluído
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data;
        const scripts = tempDiv.querySelectorAll('script[src]');
        scripts.forEach(scriptTag => {
          const script = document.createElement('script');
          script.src = scriptTag.src;
          script.defer = scriptTag.defer || false;
          script.type = scriptTag.type || 'text/javascript';
          document.body.appendChild(script);
        });
        if (typeof callback === 'function') callback();
      }
    });
}

// Função para incluir a search bar
export function includeSearchBar(callback) {
  const searchBarContainer = document.getElementById('search-bar-include');
  if (searchBarContainer) {
    fetch('/components/search-bar/search-bar.html')
      .then(res => res.text())
      .then(html => {
        searchBarContainer.innerHTML = html;
        const script = document.createElement('script');
        script.src = '/components/search-bar/search-bar.js';
        script.type = 'module';
        script.defer = true;
        document.body.appendChild(script);
        if (typeof callback === 'function') callback();
      });
  }
}

// Funções para incluir header/footer/modal, se quiser padronizar
export function includeHeader() {
  includeHTML('header', '/components/header/header.html', function () {
    const script = document.createElement('script');
    script.src = '/components/header/header.js';
    script.type = 'module';
    script.defer = true;
    document.body.appendChild(script);
  });
}

export function includeFooter() {
  includeHTML('footer', '/components/footer/footer.html');
}

export function includePlaceDetailsModal() {
  includeHTML('place-details-modal-include', '/components/modal/place_details/PlaceDetailsModal.html', function () {
    const script = document.createElement('script');
    script.src = '/components/modal/place_details/PlaceDetailsModal.js';
    script.type = 'module';
    script.defer = true;
    document.body.appendChild(script);
  });
}

export function includeReviewsModal() {
  includeHTML('reviews-modal-include', '/components/modal/reviews/ReviewsModal.html', function () {
    const script = document.createElement('script');
    script.src = '/components/modal/reviews/ReviewsModal.js';
    script.type = 'module';
    script.defer = true;
    document.body.appendChild(script);
  });
}

export function includeAiModal() {
  includeHTML('ai-modal-root', '/components/modal/ai_modal/ai-modal.html', function () {
    const script = document.createElement('script');
    script.src = '/components/modal/ai_modal/ai-modal.js';
    script.type = 'module';
    script.defer = true;
    document.body.appendChild(script);
  });
}

export function includeUserReviewModal() {
  includeHTML('user-review-modal-include', '/components/modal/user_review_modal/user-review.html', function () {
    const script = document.createElement('script');
    script.src = '/components/modal/user_review_modal/user-review.js';
    script.type = 'module';
    script.defer = true;
    document.body.appendChild(script);
  });
}

// Re-export loadGoogleMapsScript
export { loadGoogleMapsScript };

// Compatibilidade para páginas legadas (opcional)
if (typeof window !== 'undefined') {
  window.includeSearchBar = includeSearchBar;
  window.includeHeader = includeHeader;
  window.includeFooter = includeFooter;
  window.includePlaceDetailsModal = includePlaceDetailsModal;
  window.includeReviewsModal = includeReviewsModal;
  window.includeAiModal = includeAiModal;
  window.includeUserReviewModal = includeUserReviewModal;
}