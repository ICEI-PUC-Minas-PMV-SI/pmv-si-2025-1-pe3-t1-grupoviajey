document.addEventListener('DOMContentLoaded', function() {
  // Load header and footer
  loadComponent('header', '../../components/header/header.html');
  loadComponent('footer', '../../components/footer/footer.html');

  // Form elements
  const form = document.getElementById('createPostForm');
  const imageInput = document.getElementById('postImage');
  const imagePreview = document.getElementById('imagePreview');
  const ratingInput = document.getElementById('postRating');
  const ratingDisplay = document.getElementById('ratingDisplay');
  const cancelBtn = document.getElementById('cancelBtn');

  // Update rating display
  ratingInput.addEventListener('input', function() {
    const value = parseInt(this.value);
    const stars = '★'.repeat(value) + '☆'.repeat(5 - value);
    ratingDisplay.textContent = stars;
  });

  // Image preview
  imageInput.addEventListener('input', function() {
    const url = this.value.trim();
    if (url) {
      imagePreview.style.backgroundImage = `url('${url}')`;
      imagePreview.classList.add('has-image');
      imagePreview.textContent = '';
    } else {
      imagePreview.style.backgroundImage = '';
      imagePreview.classList.remove('has-image');
      imagePreview.textContent = 'Prévia da imagem aparecerá aqui';
    }
  });

  // Handle form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const postData = {
      id: Date.now().toString(),
      title: formData.get('title'),
      description: formData.get('description'),
      image: formData.get('image') || null,
      category: formData.get('category'),
      rating: parseInt(formData.get('rating')),
      address: formData.get('address') || '',
      status: 'pending',
      type: 'user_post', // Distinguish from partner ads
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
    posts.push(postData);
    localStorage.setItem('viajey_posts', JSON.stringify(posts));

    // Show success message
    showMessage('Postagem criada com sucesso! Aguardando aprovação.', 'success');
    
    // Reset form
    form.reset();
    imagePreview.style.backgroundImage = '';
    imagePreview.classList.remove('has-image');
    ratingDisplay.textContent = '★★★★★';
    
    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = 'managePosts.html';
    }, 2000);
  });

  // Cancel button
  cancelBtn.addEventListener('click', function() {
    if (confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.')) {
      window.location.href = '../home/index.html';
    }
  });

  // Check if editing existing post
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  
  if (editId) {
    loadPostForEdit(editId);
  }
});

function loadComponent(elementId, htmlPath) {
  fetch(htmlPath)
    .then(res => res.text())
    .then(html => {
      document.getElementById(elementId).innerHTML = html;
    })
    .catch(err => console.error(`Error loading ${elementId}:`, err));
}

function showMessage(message, type) {
  const existingMessage = document.querySelector('.success-message, .error-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
  messageDiv.textContent = message;
  
  const form = document.querySelector('.post-form');
  form.insertBefore(messageDiv, form.firstChild);
}

function loadPostForEdit(postId) {
  const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postDescription').value = post.description;
    document.getElementById('postImage').value = post.image || '';
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postRating').value = post.rating;
    document.getElementById('postAddress').value = post.address;
    
    // Update displays
    const ratingDisplay = document.getElementById('ratingDisplay');
    const stars = '★'.repeat(post.rating) + '☆'.repeat(5 - post.rating);
    ratingDisplay.textContent = stars;
    
    if (post.image) {
      const imagePreview = document.getElementById('imagePreview');
      imagePreview.style.backgroundImage = `url('${post.image}')`;
      imagePreview.classList.add('has-image');
    }
    
    // Change form title and button text
    document.querySelector('h1').textContent = 'Editar Postagem';
    document.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
    
    // Update form handler for editing
    const form = document.getElementById('createPostForm');
    form.onsubmit = function(e) {
      e.preventDefault();
      updatePost(postId);
    };
  }
}

function updatePost(postId) {
  const form = document.getElementById('createPostForm');
  const formData = new FormData(form);
  
  const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex !== -1) {
    posts[postIndex] = {
      ...posts[postIndex],
      title: formData.get('title'),
      description: formData.get('description'),
      image: formData.get('image') || null,
      category: formData.get('category'),
      rating: parseInt(formData.get('rating')),
      address: formData.get('address') || '',
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('viajey_posts', JSON.stringify(posts));
    
    showMessage('Postagem atualizada com sucesso!', 'success');
    
    setTimeout(() => {
      window.location.href = 'managePosts.html';
    }, 2000);
  }
}
