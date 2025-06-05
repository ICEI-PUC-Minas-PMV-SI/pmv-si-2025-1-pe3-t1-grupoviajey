let currentPage = 1;
const adsPerPage = 6;

document.addEventListener('DOMContentLoaded', function() {
  // Load header and footer
  loadComponent('header', '../../components/header/header.html');
  loadComponent('footer', '../../components/footer/footer.html');

  // Load pending ads
  loadPendingAds();
});

function loadPendingAds() {
  const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  const pendingAds = posts.filter(post => post.status === 'pending');

  // Sort by creation date (newest first)
  pendingAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const totalPages = Math.ceil(pendingAds.length / adsPerPage);
  const startIndex = (currentPage - 1) * adsPerPage;
  const endIndex = startIndex + adsPerPage;
  const paginatedAds = pendingAds.slice(startIndex, endIndex);

  // Render ads
  renderPendingAds(paginatedAds);
  renderPagination(totalPages);
}

function renderPendingAds(ads) {
  const adsGrid = document.getElementById('adsPendingGrid');
  
  if (ads.length === 0) {
    adsGrid.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum anúncio pendente</h3>
        <p>Todos os anúncios foram processados ou não há anúncios para aprovar no momento.</p>
      </div>
    `;
    return;
  }

  adsGrid.innerHTML = ads.map(ad => createAdCard(ad)).join('');
  
  // Add event listeners to action buttons
  addAdActionListeners();
}

function createAdCard(ad) {
  const imageHtml = ad.image 
    ? `<div class="ad-image" style="background-image: url('${ad.image}')"></div>`
    : `<div class="ad-image">Sem imagem</div>`;

  const rating = '★'.repeat(ad.rating) + '☆'.repeat(5 - ad.rating);
  
  return `
    <div class="ad-card" data-id="${ad.id}">
      ${imageHtml}
      <div class="ad-status-badge">Pendente</div>
      <div class="ad-content">
        <h3 class="ad-title">${ad.title}</h3>
        <p class="ad-description">${ad.description}</p>
        <div class="ad-meta">
          <span class="ad-category">${ad.category}</span>
          <span class="ad-rating">${rating}</span>
        </div>
        ${ad.address ? `<div class="ad-address">${ad.address}</div>` : ''}
        <div class="ad-actions">
          <button class="btn-approve" data-action="approve">
            ✓ Aprovar
          </button>
          <button class="btn-reject" data-action="reject">
            ✗ Rejeitar
          </button>
        </div>
      </div>
    </div>
  `;
}

function addAdActionListeners() {
  document.querySelectorAll('.btn-approve, .btn-reject').forEach(btn => {
    btn.addEventListener('click', function() {
      const adCard = this.closest('.ad-card');
      const adId = adCard.dataset.id;
      const action = this.dataset.action;
      
      handleAdAction(adId, action);
    });
  });
}

function handleAdAction(adId, action) {
  const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  const postIndex = posts.findIndex(p => p.id === adId);
  
  if (postIndex !== -1) {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    posts[postIndex].status = newStatus;
    posts[postIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem('viajey_posts', JSON.stringify(posts));
    
    // Show success message
    const message = action === 'approve' ? 'Anúncio aprovado com sucesso!' : 'Anúncio rejeitado com sucesso!';
    showToast(message);
    
    // Reload ads
    loadPendingAds();
  }
}

function renderPagination(totalPages) {
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let paginationHtml = '';
  
  // Previous button
  paginationHtml += `
    <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
      ← Anterior
    </button>
  `;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    paginationHtml += `
      <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }
  
  // Next button
  paginationHtml += `
    <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
      Próxima →
    </button>
  `;
  
  pagination.innerHTML = paginationHtml;
}

function changePage(page) {
  currentPage = page;
  loadPendingAds();
}

function loadComponent(elementId, htmlPath) {
  fetch(htmlPath)
    .then(res => res.text())
    .then(html => {
      document.getElementById(elementId).innerHTML = html;
    })
    .catch(err => console.error(`Error loading ${elementId}:`, err));
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #004954;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}
`;
document.head.appendChild(style);
