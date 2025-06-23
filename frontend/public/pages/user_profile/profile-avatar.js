// profile-avatar.js
// Handles avatar editing and preview
import { apiService } from '../../services/api/apiService.js';

window.ProfileAvatar = (function() {
  function init() {
    const editBtn = document.getElementById('edit-avatar-btn');
    const avatarImg = document.getElementById('user-profile-avatar');
    if (!editBtn || !avatarImg) return;

    // Create hidden file input
    let fileInput = document.getElementById('avatar-file-input');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.id = 'avatar-file-input';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }

    editBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        try {
          // Mostra preview local imediatamente
          const reader = new FileReader();
          reader.onload = function(ev) {
            avatarImg.src = ev.target.result;
          };
          reader.readAsDataURL(file);

          // Faz upload para o backend
          const newAvatarUrl = await uploadAvatar(file);

          // Atualiza para a URL real do backend
          avatarImg.src = newAvatarUrl; 

          // Atualiza o perfil no localStorage para refletir em outras partes
          const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
          userProfile.avatarUrl = newAvatarUrl;
          localStorage.setItem('userProfile', JSON.stringify(userProfile));

          // Atualiza o avatar no header, se existir
          const headerAvatar = document.querySelector('.header-avatar-img');
          if(headerAvatar) {
            headerAvatar.src = newAvatarUrl;
          }
          
        } catch (err) {
          console.error('Erro ao enviar avatar:', err)
          alert('Erro ao enviar avatar: ' + err.message);
          // Opcional: reverter para a imagem antiga se o upload falhar
          // window.ProfileUtils.loadUserProfile(); 
        }
      }
      // Limpa o valor para permitir selecionar o mesmo arquivo novamente
      fileInput.value = ''; 
    });
  }

  async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await apiService.uploadAvatar(formData);
      if (response && response.success && response.data.avatarUrl) {
        return response.data.avatarUrl;
      } else {
        throw new Error(response.message || 'A resposta da API não continha a URL do avatar.');
      }
    } catch (error) {
      throw error;
    }
  }

  return { init, uploadAvatar };
})();
