// profile-avatar.js
// Handles avatar editing and preview

window.ProfileAvatar = (function() {
  function init() {
    const editBtn = document.getElementById('edit-avatar-btn');
    const avatarImg = document.getElementById('user-avatar');
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
          // Mostra preview local imediatamente (opcional)
          const reader = new FileReader();
          reader.onload = function(ev) {
            avatarImg.src = ev.target.result;
          };
          reader.readAsDataURL(file);

          // Faz upload para o backend
          const newAvatarUrl = await uploadAvatar(file);
          avatarImg.src = newAvatarUrl; // Atualiza para a URL real do backend
          // (Opcional) Atualize o perfil do usuário com o novo avatarUrl
        } catch (err) {
          alert('Erro ao enviar avatar');
        }
      }
      fileInput.value = '';
    });
  }

  async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('<SUA_ROTA_DE_UPLOAD_AQUI>', {
      method: 'POST', // ou PUT, conforme seu backend
      body: formData,
      // headers: { 'Authorization': 'Bearer ...' } // se precisar de auth
    });

    if (!response.ok) throw new Error('Erro ao enviar avatar');
    const data = await response.json();
    return data.avatarUrl; // backend deve retornar a URL do novo avatar
  }

  return { init, uploadAvatar };
})();
