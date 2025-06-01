// include.js
function includeHTML(id, file, callback) {
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

function includeSearchBar() {
  fetch('../../components/search-bar/search-bar.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('search-bar-include').innerHTML = html;
      const script = document.createElement('script');
      script.src = '../../components/search-bar/search-bar.js';
      document.body.appendChild(script);
    });
}
window.includeSearchBar = includeSearchBar;

document.addEventListener('DOMContentLoaded', function() {
  includeHTML('header', '../../components/header/header.html', function() {
    // Carrega o script do header após o HTML estar no DOM
    const script = document.createElement('script');
    script.src = '../../components/header/header.js';
    document.body.appendChild(script);
  });
  includeHTML('footer', '../../components/footer/footer.html');
  includeHTML('place-details-modal-include', '../../components/modal/place_details/PlaceDetailsModal.html', function() {
    const script = document.createElement('script');
    script.src = '../../components/modal/place_details/PlaceDetailsModal.js';
    document.body.appendChild(script);
  });
  includeHTML('reviews-modal-include', '../../components/modal/reviews/ReviewsModal.html', function() {
    const script = document.createElement('script');
    script.src = '../../components/modal/reviews/ReviewsModal.js';
    document.body.appendChild(script);
  });
});