let currentFilter = 'all';
let currentPage = 1;
const adsPerPage = 6;
const userId = 'partner_001'; // Simulated partner ID

document.addEventListener('DOMContentLoaded', function() {
  // Load header and footer
  loadComponent('header', '../../components/header/header.html');
  loadComponent('footer', '../../components/footer/footer.html');

  // Initialize page
  initializeEventListeners();
  loadPartnerAds();
});

function initializeEventListeners() {
  // Create ad button
  document.getElementById('createAdBtn').addEventListener('click', function() {
    window.location.href = 'createAd.html';
  });

  // Filter tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.status;
      currentPage = 1;
      loadPartnerAds();
    });
  });
}

function loadPartnerAds() {
  const allAds = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  let partnerAds = allAds.filter(ad => ad.userId === userId);

  // Apply filter
  if (currentFilter !== 'all') {
    partnerAds = partnerAds.filter(ad => ad.status === currentFilter);
  }

  // Sort by creation date (newest first)
  partnerAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const totalPages = Math.ceil(partnerAds.length / adsPerPage);
  const startIndex = (currentPage - 1) * adsPerPage;
  const endIndex = startIndex + adsPerPage;
  const paginatedAds = partnerAds.slice(startIndex, endIndex);

  // Render ads
  renderPartnerAds(paginatedAds);
  renderPagination(totalPages);
}

function renderPartnerAds(ads) {
  const adsGrid = document.getElementById('adsGrid');
  
  if (ads.length === 0) {
    adsGrid.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum anúncio encontrado</h3>
        <p>Você ainda não criou anúncios ${currentFilter === 'all' ? '' : `com status "${getStatusLabel(currentFilter)}"`}.</p>
        <button class="btn-primary" onclick="window.location.href='createAd.html'">Criar meu primeiro anúncio</button>
      </div>
    `;
    return;
  }

  adsGrid.innerHTML = ads.map(ad => createPartnerAdCard(ad)).join('');
  
  // Add event listeners to action buttons
  addAdActionListeners();
}

function createPartnerAdCard(ad) {
  const imageHtml = ad.image 
    ? `<div class="ad-image" style="background-image: url('${ad.image}')"></div>`
    : `<div class="ad-image">Sem imagem</div>`;

  const rating = '★'.repeat(ad.rating) + '☆'.repeat(5 - ad.rating);
  
  return `
    <div class="ad-card" data-id="${ad.id}">
      ${imageHtml}
      <div class="ad-status-badge ${ad.status}">${getStatusLabel(ad.status)}</div>
      <div class="ad-content">
        <h3 class="ad-title">${ad.title}</h3>
        <p class="ad-description">${ad.description}</p>
        <div class="ad-meta">
          <span class="ad-category">${ad.category}</span>
          <span class="ad-rating">${rating}</span>
        </div>
        ${ad.address ? `<div class="ad-address">${ad.address}</div>` : ''}
        <div class="ad-actions">
          <button class="btn-action btn-edit" data-action="edit">Editar</button>
          <button class="btn-action btn-delete" data-action="delete">Excluir</button>
        </div>
      </div>
    </div>
  `;
}

function addAdActionListeners() {
  document.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', function() {
      const adCard = this.closest('.ad-card');
      const adId = adCard.dataset.id;
      const action = this.dataset.action;
      
      handleAdAction(adId, action);
    });
  });
}

function handleAdAction(adId, action) {
  switch (action) {
    case 'edit':
      window.location.href = `editAd.html?edit=${adId}`;
      break;
    case 'delete':
      if (confirm('Tem certeza que deseja excluir este anúncio?')) {
        deleteAd(adId);
      }
      break;
  }
}

function deleteAd(adId) {
  const ads = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  const filteredAds = ads.filter(ad => ad.id !== adId);
  localStorage.setItem('viajey_posts', JSON.stringify(filteredAds));
  
  showToast('Anúncio excluído com sucesso!');
  loadPartnerAds();
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
  loadPartnerAds();
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado'
  };
  return labels[status] || status;
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
