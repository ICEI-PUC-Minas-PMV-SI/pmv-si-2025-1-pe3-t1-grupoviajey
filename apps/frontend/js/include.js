// include.js
function includeHTML(id, file, callback) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
      if (typeof callback === 'function') callback();
    });
}

document.addEventListener('DOMContentLoaded', function() {
  includeHTML('header', 'components/header/header.html');
  includeHTML('footer', 'components/footer/footer.html');
  includeHTML('place-details-modal-include', 'components/modal/PlaceDetailsModal.html', function() {
    var script = document.createElement('script');
    script.src = 'components/modal/PlaceDetailsModal.js';
    document.body.appendChild(script);
  });
}); 