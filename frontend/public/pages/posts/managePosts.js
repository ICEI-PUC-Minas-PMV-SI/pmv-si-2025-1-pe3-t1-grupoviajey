let currentFilter = 'all';
let currentPage = 1;
const postsPerPage = 6;

document.addEventListener('DOMContentLoaded', function() {
  // Load header and footer
  loadComponent('header', '../../components/header/header.html');
  loadComponent('footer', '../../components/footer/footer.html');

  // Initialize page
  initializeEventListeners();
  loadPosts();
});

function initializeEventListeners() {
  // Create post button
  document.getElementById('createPostBtn').addEventListener('click', function() {
    window.location.href = 'createPost.html';
  });

  // Filter tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.status;
      currentPage = 1;
      loadPosts();
    });
  });
}

function loadPosts() {
  const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  let filteredPosts = posts;

  // Apply filter
  if (currentFilter !== 'all') {
    filteredPosts = posts.filter(post => post.status === currentFilter);
  }

  // Sort by creation date (newest first)
  filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Render posts
  renderPosts(paginatedPosts);
  renderPagination(totalPages);
}

function renderPosts(posts) {
  const postsGrid = document.getElementById('postsGrid');
  
  if (posts.length === 0) {
    postsGrid.innerHTML = `
      <div class="empty-state">
        <h3>Nenhuma postagem encontrada</h3>
        <p>Não há postagens ${currentFilter === 'all' ? '' : `com status "${getStatusLabel(currentFilter)}"`} no momento.</p>
      </div>
    `;
    return;
  }

  postsGrid.innerHTML = posts.map(post => createPostCard(post)).join('');
  
  // Add event listeners to action buttons
  addPostActionListeners();
}

function createPostCard(post) {
  const imageHtml = post.image 
    ? `<div class="post-image" style="background-image: url('${post.image}')"></div>`
    : `<div class="post-image">Sem imagem</div>`;

  const rating = '★'.repeat(post.rating) + '☆'.repeat(5 - post.rating);
  
  return `
    <div class="post-card" data-id="${post.id}">
      ${imageHtml}
      <div class="post-content">
        <h3 class="post-title">${post.title}</h3>
        <p class="post-description">${post.description}</p>
        <div class="post-meta">
          <span class="post-category">${post.category}</span>
          <span class="post-rating">${rating}</span>
        </div>
        <div class="post-status ${post.status}">${getStatusLabel(post.status)}</div>
        <div class="post-actions">
          ${post.status === 'pending' ? `
            <button class="btn-action btn-approve" data-action="approve">Aprovar</button>
            <button class="btn-action btn-reject" data-action="reject">Rejeitar</button>
          ` : ''}
          <button class="btn-action btn-edit" data-action="edit">Editar</button>
          <button class="btn-action btn-delete" data-action="delete">Excluir</button>
        </div>
      </div>
    </div>
  `;
}

function addPostActionListeners() {
  document.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', function() {
      const postCard = this.closest('.post-card');
      const postId = postCard.dataset.id;
      const action = this.dataset.action;
      
      handlePostAction(postId, action);
    });
  });
}

function handlePostAction(postId, action) {
  switch (action) {
    case 'approve':
      updatePostStatus(postId, 'approved');
      break;
    case 'reject':
      updatePostStatus(postId, 'rejected');
      break;
    case 'edit':
      window.location.href = `createPost.html?edit=${postId}`;
      break;
    case 'delete':
      if (confirm('Tem certeza que deseja excluir esta postagem?')) {
        deletePost(postId);
      }
      break;
  }
}

function updatePostStatus(postId, newStatus) {
  const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    posts[postIndex].status = newStatus;
    posts[postIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('viajey_posts', JSON.stringify(posts));
    
    // Show success message
    showToast(`Postagem ${newStatus === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    
    // Reload posts
    loadPosts();
  }
}

function deletePost(postId) {
  const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  const filteredPosts = posts.filter(p => p.id !== postId);
  localStorage.setItem('viajey_posts', JSON.stringify(filteredPosts));
  
  showToast('Postagem excluída com sucesso!');
  loadPosts();
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
  loadPosts();
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Pendente',
    approved: 'Aprovada',
    rejected: 'Rejeitada'
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
