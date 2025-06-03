import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';
import { loadGoogleMapsScript } from '../../js/core/map/loader.js';

document.addEventListener('DOMContentLoaded', () => {
  includeHeader();
  includeFooter();
  includeSearchBar();

  // Carregar o modal de IA (adaptado do seu inline)
  function waitForFlatpickr(cb) {
    if (window.flatpickr && window.flatpickr.l10ns && window.flatpickr.l10ns.pt) {
      cb();
    } else {
      setTimeout(() => waitForFlatpickr(cb), 50);
    }
  }

  function waitForGoogleMaps(cb) {
    if (window.google && window.google.maps && window.google.maps.places) {
      cb();
    } else {
      setTimeout(() => waitForGoogleMaps(cb), 50);
    }
  }

  waitForGoogleMaps(() => {
    waitForFlatpickr(() => {
      fetch('../../components/modal/ai_modal/ai-modal.html')
        .then(res => res.text())
        .then(html => {
          const temp = document.createElement('div');
          temp.innerHTML = html;
          const overlay = temp.querySelector('#ai-modal-overlay');
          document.getElementById('ai-modal-root').appendChild(overlay);

          // Carrega o CSS do modal
          var link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = '../../components/modal/ai_modal/ai-modal.css';
          document.head.appendChild(link);

          // Carrega o JS do modal
          var script = document.createElement('script');
          script.src = '../../components/modal/ai_modal/ai-modal.js';
          document.body.appendChild(script);

          // Garante que o botão do banner abre o modal
          const openBtn = document.getElementById('open-ai-modal');
          if (openBtn) {
            openBtn.addEventListener('click', function () {
              if (window.openAiModal) {
                window.openAiModal();
              }
            });
          }
        });
    });
  });

  loadGoogleMapsScript();
});
