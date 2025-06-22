// include.js
import { loadGoogleMapsScript } from '../core/map/loader.js';

// Função genérica para incluir HTML em um elemento, agora baseada em Promises
export function includeHTML(id, file) {
  return new Promise((resolve, reject) => {
    fetch(file)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Falha ao carregar ${file}: ${response.statusText}`);
        }
        return response.text();
      })
      .then(data => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML = data;
          // Executa scripts inline, se houver
          const scripts = el.querySelectorAll('script');
          scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
          });
          resolve(); // Resolve a promessa após o conteúdo ser inserido
        } else {
          reject(new Error(`Elemento com id '${id}' não encontrado.`));
        }
      })
      .catch(error => reject(error));
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

// Funções para incluir header/footer/modal, agora retornam a Promise de includeHTML
export function includeHeader() {
  return includeHTML('header', '/components/header/header.html').then(() => {
    // Após o HTML do header ser carregado, adicionamos seu JS
    const script = document.createElement('script');
    script.src = '/components/header/header.js';
    script.type = 'module';
    document.body.appendChild(script);
  });
}

export function includeFooter() {
  return includeHTML('footer', '/components/footer/footer.html');
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