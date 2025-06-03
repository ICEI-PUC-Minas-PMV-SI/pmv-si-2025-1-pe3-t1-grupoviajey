import { openReviewModal } from '../../components/modal/review_modal/ReviewModal.js';

export function renderReviews() {
  const el = document.getElementById('dashboard-reviews');
  if (!el) return;

  // Busca avaliações do localStorage
  const reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');

  el.innerHTML = `
    <div class="reviews-list"></div>
  `;

  const list = el.querySelector('.reviews-list');
  if (!reviews.length) {
    list.innerHTML = '<p>Você ainda não avaliou nenhum lugar.</p>';
    return;
  }

  reviews.forEach(review => {
    const card = createReviewCard(review);
    list.appendChild(card);
  });
}

function openReviewForm() {
  const el = document.getElementById('dashboard-reviews');
  el.innerHTML = `
    <div class="review-form">
      <h3>Nova avaliação (mock)</h3>
      <form id="form-review">
        <label>Nome do lugar:<input type="text" name="place" required></label><br>
        <label>Nota:<input type="number" name="rating" min="1" max="5" required></label><br>
        <label>Comentário:<textarea name="comment"></textarea></label><br>
        <button type="submit" class="action-btn">Salvar</button>
        <button type="button" id="cancel-review" class="action-btn">Cancelar</button>
      </form>
    </div>
  `;
  document.getElementById('cancel-review').onclick = renderReviews;
  document.getElementById('form-review').onsubmit = function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    addReview(data);
    renderReviews();
  };
}

function addReview(review) {
  const reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
  review.id = Date.now();
  reviews.push(review);
  localStorage.setItem('userReviews', JSON.stringify(reviews));
}

function createReviewCard(review) {
  const card = document.createElement('div');
  card.className = 'review-card';
  card.innerHTML = `
    <div class="review-info">
      <div class="review-place">${review.place}</div>
      <div class="review-rating">${'★'.repeat(Number(review.rating))}${'☆'.repeat(5 - Number(review.rating))}</div>
      <div class="review-comment">${review.comment || ''}</div>
    </div>
  `;

  // Adiciona evento de clique para abrir o modal
  card.addEventListener('click', () => {
    openReviewModal({
      local: {
        name: review.place,
        address: review.address || ''
      },
      userReview: {
        rating: review.rating,
        comment: review.comment
      },
      otherReviews: [
        {
          user: 'João Silva',
          rating: 4.5,
          comment: 'Lugar incrível! Vale muito a pena visitar.'
        },
        {
          user: 'Maria Santos',
          rating: 5,
          comment: 'Experiência única, superou minhas expectativas!'
        }
      ],
      onSave: async (data) => {
        // Atualiza a avaliação no localStorage
        const reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
        const index = reviews.findIndex(r => r.id === review.id);
        if (index !== -1) {
          reviews[index] = { ...reviews[index], ...data };
          localStorage.setItem('userReviews', JSON.stringify(reviews));
          renderReviews(); // Atualiza a lista
        }
      }
    });
  });

  return card;
}

function deleteReview(id) {
  let reviews = JSON.parse(localStorage.getItem('userReviews') || '[]');
  reviews = reviews.filter(review => review.id !== id);
  localStorage.setItem('userReviews', JSON.stringify(reviews));
  renderReviews();
}

async function fetchUserReviews(page = 1, perPage = 4) {
  // Para integração real, descomente a linha abaixo e ajuste a rota da sua API:
  // return fetch(`/api/avaliacoes?page=${page}&perPage=${perPage}`).then(res => res.json());
  const total = 10;
  const reviews = Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    name: '[Nome do local avaliado]',
    rating: 4.5,
    comment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    avatar: '',
    highlight: i === 2
  }));
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return {
    reviews: reviews.slice(start, end),
    total,
    page,
    perPage
  };
}

function renderReviewsPagination(container, page, total, perPage) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return;
  const nav = document.createElement('nav');
  nav.className = 'reviews-pagination';
  nav.style.display = 'flex';
  nav.style.justifyContent = 'center';
  nav.style.gap = '8px';
  nav.style.margin = '24px 0 0 0';

  function createPageBtn(p, label = null) {
    const btn = document.createElement('button');
    btn.textContent = label || p;
    btn.disabled = p === page;
    btn.style.minWidth = '36px';
    btn.style.height = '36px';
    btn.style.borderRadius = '50%';
    btn.style.border = '1px solid #ccc';
    btn.style.background = p === page ? '#222' : '#fff';
    btn.style.color = p === page ? '#fff' : '#222';
    btn.style.fontWeight = '600';
    btn.style.cursor = p === page ? 'default' : 'pointer';
    btn.addEventListener('click', () => renderReviews(p));
    return btn;
  }

  // Prev
  nav.appendChild(createPageBtn(Math.max(1, page - 1), '‹'));

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      nav.appendChild(createPageBtn(p));
    } else if (p === page - 2 || p === page + 2) {
      const dots = document.createElement('span');
      dots.textContent = '...';
      dots.style.padding = '0 8px';
      nav.appendChild(dots);
    }
  }

  // Next
  nav.appendChild(createPageBtn(Math.min(totalPages, page + 1), '›'));

  container.appendChild(nav);
} 