// include.js
function includeHTML(id, file, callback) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      if (typeof callback === 'function') callback();
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

document.addEventListener('DOMContentLoaded', function() {
  includeHTML('header', '../../components/header/header.html');
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