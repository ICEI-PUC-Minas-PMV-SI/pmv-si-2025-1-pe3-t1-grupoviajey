// ReviewsModal.js
(function() {
  const reviewsModal = document.getElementById('reviews-modal');
  const closeBtn = reviewsModal.querySelector('.reviews-modal-close');
  const title = reviewsModal.querySelector('.reviews-modal-title');
  const stars = reviewsModal.querySelectorAll('.star');
  let selectedRating = 0;

  stars.forEach(star => {
    star.addEventListener('mouseenter', function() {
      const val = parseInt(this.getAttribute('data-value'));
      stars.forEach(s => {
        if (parseInt(s.getAttribute('data-value')) <= val) {
          s.classList.add('filled');
        } else {
          s.classList.remove('filled');
        }
      });
    });
    star.addEventListener('mouseleave', function() {
      stars.forEach(s => s.classList.remove('filled'));
      if (selectedRating > 0) {
        stars.forEach(s => {
          if (parseInt(s.getAttribute('data-value')) <= selectedRating) {
            s.classList.add('selected');
          } else {
            s.classList.remove('selected');
          }
        });
      } else {
        stars.forEach(s => s.classList.remove('selected'));
      }
    });
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.getAttribute('data-value'));
      stars.forEach(s => {
        if (parseInt(s.getAttribute('data-value')) <= selectedRating) {
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
})(); 