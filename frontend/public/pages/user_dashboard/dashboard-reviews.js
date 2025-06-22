import { openReviewModal } from '../../components/modal/review_modal/ReviewModal.js';
import { apiService } from '../../services/api/apiService.js';
import { showLoading, hideLoading, showErrorToast, showSuccessToast } from '../../js/utils/ui-utils.js';

const ITEMS_PER_PAGE = 5;

export async function renderReviews(page = 1) {
  const el = document.getElementById('dashboard-reviews');
  if (!el) return;

  try {
    showLoading('Carregando avaliações...');
    
    // Busca avaliações do backend
    const response = await apiService.getUserReviews(page, ITEMS_PER_PAGE);
    
    // Garante que 'reviews' seja sempre um array
    const reviews = response?.data?.reviews || [];
    const total = response?.data?.total || 0;
    
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    // Limpa o container e cria a estrutura
    el.innerHTML = `
      <div class="reviews-container">
        <div class="reviews-list"></div>
        <div class="reviews-pagination"></div>
        <button id="btn-create-review" class="action-btn">Nova avaliação</button>
      </div>
    `;

    const list = el.querySelector('.reviews-list');
    const paginationContainer = el.querySelector('.reviews-pagination');
    const createBtn = el.querySelector('#btn-create-review');

    if (!reviews.length) {
      list.innerHTML = '<p>Você ainda não avaliou nenhum lugar.</p>';
    } else {
      list.innerHTML = '';
      reviews.forEach(review => {
        const card = createReviewCard(review);
        list.appendChild(card);
      });
    }

    // Paginação
    if (totalPages > 1) {
      renderReviewsPagination(paginationContainer, page, total, ITEMS_PER_PAGE);
    }

    // Botão de nova avaliação
    createBtn.onclick = () => openReviewForm();
  } catch (error) {
    console.error('Erro ao carregar avaliações:', error);
    showErrorToast('Erro ao carregar avaliações. Tente novamente.');
    el.innerHTML = '<p>Erro ao carregar avaliações. Tente novamente.</p>';
  } finally {
    hideLoading();
  }
}

function openReviewForm() {
  const el = document.getElementById('dashboard-reviews');
  el.innerHTML = `
    <div class="review-form">
      <h3>Nova avaliação</h3>
      <form id="form-review">
        <label>Nome do lugar:<input type="text" name="placeId" required></label><br>
        <label>Nota:<input type="number" name="rating" min="1" max="5" required></label><br>
        <label>Comentário:<textarea name="comment"></textarea></label><br>
        <button type="submit" class="action-btn">Salvar</button>
        <button type="button" id="cancel-review" class="action-btn">Cancelar</button>
      </form>
    </div>
  `;
  document.getElementById('cancel-review').onclick = () => renderReviews();
  document.getElementById('form-review').onsubmit = async function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    try {
      showLoading('Salvando avaliação...');
      await apiService.createReview(data.placeId, {
        rating: data.rating,
        comment: data.comment
      });
      showSuccessToast('Avaliação criada com sucesso!');
      renderReviews();
    } catch (error) {
      showErrorToast('Erro ao criar avaliação. Tente novamente.');
    } finally {
      hideLoading();
    }
  };
}

function createReviewCard(review) {
  const card = document.createElement('div');
  card.className = 'review-card';
  card.innerHTML = `
    <div class="review-info">
      <div class="review-place">${review.placeName || review.place || ''}</div>
      <div class="review-rating">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5 - Number(review.rating))}</div>
      <div class="review-comment">${review.comment || ''}</div>
      <button class="edit-btn">Editar</button>
      <button class="delete-btn">Excluir</button>
    </div>
  `;

  // Editar avaliação
  card.querySelector('.edit-btn').onclick = () => openEditReviewForm(review);
  // Excluir avaliação
  card.querySelector('.delete-btn').onclick = async () => {
    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        showLoading('Excluindo avaliação...');
        await apiService.deleteReview(review.placeId, review.id);
        showSuccessToast('Avaliação excluída com sucesso!');
        renderReviews();
      } catch (error) {
        showErrorToast('Erro ao excluir avaliação. Tente novamente.');
      } finally {
        hideLoading();
      }
    }
  };

  // Modal de detalhes
  card.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn') || e.target.classList.contains('delete-btn')) return;
    openReviewModal({
      local: {
        name: review.placeName,
        address: review.address || ''
      },
      userReview: {
        rating: review.rating,
        comment: review.comment
      },
      otherReviews: [],
      onSave: async (data) => {
        try {
          showLoading('Atualizando avaliação...');
          await apiService.updateReview(review.placeId, review.id, {
            rating: data.rating,
            comment: data.comment
          });
          showSuccessToast('Avaliação atualizada!');
          renderReviews();
        } catch (error) {
          showErrorToast('Erro ao atualizar avaliação.');
        } finally {
          hideLoading();
        }
      }
    });
  });

  return card;
}

function openEditReviewForm(review) {
  const el = document.getElementById('dashboard-reviews');
  el.innerHTML = `
    <div class="review-form">
      <h3>Editar avaliação</h3>
      <form id="form-edit-review">
        <label>Nota:<input type="number" name="rating" min="1" max="5" value="${review.rating}" required></label><br>
        <label>Comentário:<textarea name="comment">${review.comment || ''}</textarea></label><br>
        <button type="submit" class="action-btn">Salvar</button>
        <button type="button" id="cancel-edit-review" class="action-btn">Cancelar</button>
      </form>
    </div>
  `;
  document.getElementById('cancel-edit-review').onclick = () => renderReviews();
  document.getElementById('form-edit-review').onsubmit = async function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    try {
      showLoading('Atualizando avaliação...');
      await apiService.updateReview(review.placeId, review.id, {
        rating: data.rating,
        comment: data.comment
      });
      showSuccessToast('Avaliação atualizada!');
      renderReviews();
    } catch (error) {
      showErrorToast('Erro ao atualizar avaliação.');
    } finally {
      hideLoading();
    }
  };
}

function renderReviewsPagination(container, page, total, perPage) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return;

  container.innerHTML = '';

  function createPageBtn(p, label = null) {
    const btn = document.createElement('button');
    btn.textContent = label || p;
    btn.disabled = p === page;
    btn.addEventListener('click', () => renderReviews(p));
    return btn;
  }

  // Prev
  if (page > 1) {
    container.appendChild(createPageBtn(Math.max(1, page - 1), '‹'));
  }

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      container.appendChild(createPageBtn(p));
    } else if (p === page - 2 || p === page + 2) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      container.appendChild(dots);
    }
  }

  // Next
  if (page < totalPages) {
    container.appendChild(createPageBtn(Math.min(totalPages, page + 1), '›'));
  }
} 