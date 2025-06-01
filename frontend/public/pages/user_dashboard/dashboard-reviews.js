import { openReviewModal } from '../../components/modal/review_modal/ReviewModal.js';

export async function renderReviews(page = 1) {
  const reviewsContainer = document.getElementById('dashboard-reviews');
  if (!reviewsContainer) return;
  reviewsContainer.innerHTML = '';
  const { reviews, total, perPage } = await fetchUserReviews(page);

  reviews.forEach((review, idx) => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.style.background = '#fff';
    card.style.borderRadius = '12px';
    card.style.marginBottom = '20px';
    card.style.padding = '20px';
    card.style.display = 'flex';
    card.style.gap = '24px';
    card.style.alignItems = 'flex-start';

    const avatar = document.createElement('div');
    avatar.className = 'review-avatar';
    avatar.style.width = '60px';
    avatar.style.height = '60px';
    avatar.style.borderRadius = '50%';
    avatar.style.background = '#e0e0e0';
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.style.fontSize = '2.2rem';
    avatar.textContent = '';

    const info = document.createElement('div');
    info.style.flex = '1';

    const title = document.createElement('div');
    title.style.fontWeight = '600';
    title.style.fontSize = '1.1rem';
    title.style.marginBottom = '8px';
    title.textContent = review.name;

    const rating = document.createElement('div');
    rating.style.fontSize = '1.1rem';
    rating.style.marginBottom = '8px';
    rating.innerHTML = `<span style="color:#f5b50a;font-size:1.2rem;">${'★'.repeat(Math.round(review.rating))}${'☆'.repeat(5 - Math.round(review.rating))}</span> <span style="color:#222;font-size:1rem;vertical-align:middle;">${review.rating.toFixed(1)}</span>`;

    const comment = document.createElement('div');
    comment.style.fontSize = '1rem';
    comment.style.color = '#222';
    comment.textContent = review.comment;

    info.appendChild(title);
    info.appendChild(rating);
    info.appendChild(comment);

    card.appendChild(avatar);
    card.appendChild(info);
    reviewsContainer.appendChild(card);

    // Abrir modal ao clicar no card
    card.addEventListener('click', () => {
      openReviewModal({
        local: { name: review.name, address: 'Endereço do local' },
        userReview: { rating: review.rating, comment: review.comment },
        otherReviews: [
          { user: 'Maria', rating: 4.5, comment: 'Ótimo local!' },
          { user: 'João', rating: 4, comment: 'Gostei bastante.' }
        ],
        onSave: async ({ rating, comment }) => {
          // Aqui você faria a chamada ao backend para salvar
          return new Promise(resolve => setTimeout(resolve, 800));
        }
      });
    });
  });

  // Paginação
  renderReviewsPagination(reviewsContainer, page, total, perPage);
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