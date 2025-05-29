// ReviewsModal.js
(function() {
  const reviewsModal = document.getElementById('reviews-modal');
  const closeBtn = reviewsModal.querySelector('.reviews-modal-close');
  const title = reviewsModal.querySelector('.reviews-modal-title');
  const reviewStars = reviewsModal.querySelector('#review-stars');
  const stars = reviewStars.querySelectorAll('.star');
  let selectedRating = 0;

  stars.forEach(star => {
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.getAttribute('data-value'));
      stars.forEach(s => {
        const sVal = parseInt(s.getAttribute('data-value'));
        if (sVal <= selectedRating) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
    });
  });

  window.openReviewsModal = function(localName) {
    if (localName) {
      title.textContent = `Avaliações de ${localName}`;
    }
    reviewsModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    reviewsModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  closeBtn.onclick = closeModal;
  reviewsModal.onclick = function(e) {
    if (e.target === reviewsModal) closeModal();
  };

  // Adicionar listener para tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && reviewsModal.style.display === 'flex') {
      closeModal();
    }
  });
})(); 