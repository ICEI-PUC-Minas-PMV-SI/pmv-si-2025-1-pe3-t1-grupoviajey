export function openReviewModal({ local, userReview, otherReviews, onSave }) {
  // Carregar CSS se necessário
  if (!document.querySelector('link[href*="UserReviewModal.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../../components/modal/user_review_modal/UserReviewModal.css';
    document.head.appendChild(link);
  }
  // Carregar HTML se necessário
  fetch('../../components/modal/user_review_modal/UserReviewModal.html')
    .then(res => res.text())
    .then(html => {
      let modalDiv = document.createElement('div');
      modalDiv.innerHTML = html;
      document.body.appendChild(modalDiv);
      const overlay = document.getElementById('review-modal-overlay');
      const closeBtn = document.getElementById('review-modal-close');
      const title = document.getElementById('review-modal-title');
      const locationInfo = document.getElementById('review-modal-location-info');
      const othersDiv = document.getElementById('review-modal-others');
      const starsDiv = document.getElementById('review-modal-user-stars');
      const commentInput = document.getElementById('review-modal-user-comment');
      const form = document.getElementById('review-modal-user-form');
      const feedback = document.getElementById('review-modal-feedback');

      // Preencher dados do local
      title.textContent = local?.name || '[Nome do local avaliado]';
      locationInfo.textContent = local?.address || '';

      // Renderizar outras avaliações
      othersDiv.innerHTML = '';
      (otherReviews || []).forEach(r => {
        const div = document.createElement('div');
        div.className = 'review-modal-other';
        div.innerHTML = `
          <div class="review-modal-other-name">${r.user}</div>
          <div class="review-modal-other-stars">${'★'.repeat(Math.round(r.rating))}${'☆'.repeat(5 - Math.round(r.rating))} <span style='color:#222;font-size:1rem;'>${r.rating.toFixed(1)}</span></div>
          <div class="review-modal-other-comment">${r.comment}</div>
        `;
        othersDiv.appendChild(div);
      });

      // Renderizar avaliação do usuário logado
      let userStars = userReview?.rating || 0;
      function renderStars() {
        starsDiv.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
          const star = document.createElement('span');
          star.className = 'star' + (i <= userStars ? ' selected' : '');
          star.textContent = '★';
          star.tabIndex = 0;
          star.setAttribute('aria-label', `${i} estrela${i > 1 ? 's' : ''}`);
          star.addEventListener('mouseenter', () => highlightStars(i));
          star.addEventListener('mouseleave', () => highlightStars(userStars));
          star.addEventListener('click', () => {
            userStars = i;
            renderStars();
          });
          star.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
              userStars = i;
              renderStars();
            }
          });
          starsDiv.appendChild(star);
        }
      }
      function highlightStars(n) {
        Array.from(starsDiv.children).forEach((star, idx) => {
          star.classList.toggle('hovered', idx < n);
        });
      }
      renderStars();
      commentInput.value = userReview?.comment || '';
      setTimeout(() => commentInput.focus(), 100);

      // Fechar modal
      function closeModal() {
        overlay.remove();
      }
      closeBtn.onclick = closeModal;
      overlay.onclick = e => { if (e.target === overlay) closeModal(); };
      document.addEventListener('keydown', escListener);
      function escListener(e) {
        if (e.key === 'Escape') closeModal();
      }
      // Salvar avaliação
      form.onsubmit = async e => {
        e.preventDefault();
        feedback.textContent = '';
        if (!userStars) {
          feedback.textContent = 'Selecione uma nota.';
          return;
        }
        if (!commentInput.value.trim()) {
          feedback.textContent = 'Digite um comentário.';
          return;
        }
        feedback.textContent = 'Salvando...';
        try {
          await onSave?.({ rating: userStars, comment: commentInput.value });
          feedback.textContent = 'Avaliação salva com sucesso!';
        } catch {
          feedback.textContent = 'Erro ao salvar avaliação.';
        }
      };
      // Limpar listeners ao fechar
      overlay.addEventListener('remove', () => {
        document.removeEventListener('keydown', escListener);
      });
    });
} 