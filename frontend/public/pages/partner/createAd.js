const userId = 'partner_001'; // Simulated partner ID

document.addEventListener('DOMContentLoaded', function() {
  // Load header and footer
  loadComponent('header', '../../components/header/header.html');
  loadComponent('footer', '../../components/footer/footer.html');

  // Form elements
  const form = document.getElementById('createAdForm');
  const imageInput = document.getElementById('adImage');
  const imagePreview = document.getElementById('imagePreview');
  const ratingInput = document.getElementById('adRating');
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
      // Test if image loads
      const img = new Image();
      img.onload = function() {
        imagePreview.style.backgroundImage = `url('${url}')`;
        imagePreview.classList.add('has-image');
        imagePreview.textContent = '';
      };
      img.onerror = function() {
        imagePreview.style.backgroundImage = '';
        imagePreview.classList.remove('has-image');
        imagePreview.textContent = 'URL de imagem inválida';
      };
      img.src = url;
    } else {
      imagePreview.style.backgroundImage = '';
      imagePreview.classList.remove('has-image');
      imagePreview.textContent = 'Prévia da imagem aparecerá aqui';
    }
  });

  // Handle form submission
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = new FormData(form);
    const adData = {
      adId: Date.now().toString(),
      userId: userId,
      adTitle: formData.get('title'),
      adDescription: formData.get('description'),
      adImage: formData.get('image'),
      adCategory: formData.get('category'),
      adRating: parseInt(formData.get('rating')),
      adAddress: formData.get('address'),
      adPhone: formData.get('phone') || '',
      adWebsite: formData.get('website') || '',
      adStatus: 'pending',
      adType: 'partner_ad',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate required fields
    if (!adData.adTitle || !adData.adDescription || !adData.adImage || !adData.adCategory || !adData.adAddress) {
      showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    // Save to localStorage
    const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
    posts.push(adData);
    localStorage.setItem('viajey_posts', JSON.stringify(posts));

    // Show success message
    showMessage('Anúncio criado com sucesso! Aguardando aprovação da equipe.', 'success');
    
    // Reset form
    form.reset();
    imagePreview.style.backgroundImage = '';
    imagePreview.classList.remove('has-image');
    imagePreview.textContent = 'Prévia da imagem aparecerá aqui';
    ratingDisplay.textContent = '★★★★★';
    
    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = 'partner.html';
    }, 2000);
  });

  // Cancel button
  cancelBtn.addEventListener('click', function() {
    if (confirm('Tem certeza que deseja cancelar? Todas as alterações serão perdidas.')) {
      window.location.href = 'partner.html';
    }
  });

  // Check if editing existing ad
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  
  if (editId) {
    loadAdForEdit(editId);
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

function loadAdForEdit(adId) {
  const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  const ad = posts.find(p => p.adId === adId && p.userId === userId);
  
  if (ad) {
    document.getElementById('adTitle').value = ad.adTitle;
    document.getElementById('adDescription').value = ad.adDescription;
    document.getElementById('adImage').value = ad.adImage;
    document.getElementById('adCategory').value = ad.adCategory;
    document.getElementById('adRating').value = ad.adRating;
    document.getElementById('adAddress').value = ad.adAddress;
    document.getElementById('adPhone').value = ad.adPhone || '';
    document.getElementById('adWebsite').value = ad.adWebsite || '';
    
    // Update displays
    const ratingDisplay = document.getElementById('ratingDisplay');
    const stars = '★'.repeat(ad.adRating) + '☆'.repeat(5 - ad.adRating);
    ratingDisplay.textContent = stars;
    
    if (ad.adImage) {
      const imagePreview = document.getElementById('imagePreview');
      imagePreview.style.backgroundImage = `url('${ad.adImage}')`;
      imagePreview.classList.add('has-image');
    }
    
    // Change form title and button text
    document.querySelector('h1').textContent = 'Editar Anúncio';
    document.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
    
    // Update form handler for editing
    const form = document.getElementById('createAdForm');
    form.onsubmit = function(event) {
      event.preventDefault();
      updateAd(adId);
    };
  }
}

function updateAd(adId) {
  const form = document.getElementById('createAdForm');
  const formData = new FormData(form);
  
  const posts = JSON.parse(localStorage.getItem('viajey_posts') || '[]');
  const adIndex = posts.findIndex(p => p.adId === adId && p.userId === userId);
  
  if (adIndex !== -1) {
    posts[adIndex] = {
      ...posts[adIndex],
      adTitle: formData.get('title'),
      adDescription: formData.get('description'),
      adImage: formData.get('image'),
      adCategory: formData.get('category'),
      adRating: parseInt(formData.get('rating')),
      adAddress: formData.get('address'),
      adPhone: formData.get('phone') || '',
      adWebsite: formData.get('website') || '',
      adStatus: 'pending', // Reset to pending after edit
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('viajey_posts', JSON.stringify(posts));
    
    showMessage('Anúncio atualizado com sucesso! Aguardando nova aprovação.', 'success');
    
    setTimeout(() => {
      window.location.href = 'partner.html';
    }, 2000);
  }
}
