  if (!document.querySelector('link[href*="user-review.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../../components/modal/user_review_modal/user-review.css';
    document.head.appendChild(link);
  }
  // Carregar HTML se necessário
  fetch('../../components/modal/user_review_modal/user-review.html') 