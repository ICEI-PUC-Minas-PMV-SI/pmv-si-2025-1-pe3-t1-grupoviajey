// include.js
function includeHTML(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}

document.addEventListener('DOMContentLoaded', function() {
  includeHTML('header', 'components/header/header.html');
  includeHTML('footer', 'components/footer/footer.html');
}); 