// profile-events.js
// Handles button event listeners for the profile page

window.ProfileEvents = (function() {
  function init() {
    const saveBtn = document.getElementById('save-btn');
    const form = document.getElementById('profile-form');

    if (saveBtn && form) {
      saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!window.ProfileForm) return;
        const validation = window.ProfileForm.validate();
        if (!validation.valid) {
          showMessage(validation.message, false);
          return;
        }
        const data = window.ProfileForm.getFormData();
        try {
          if (window.ProfileStorage && typeof window.ProfileStorage.saveProfile === 'function') {
            await window.ProfileStorage.saveProfile(data);
            showMessage('Alterações salvas com sucesso!', true);
            // Change button text to 'Alterações salvas' and disable temporarily
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Alterações salvas';
            saveBtn.disabled = true;
            saveBtn.classList.add('btn-saved');
            setTimeout(() => {
              saveBtn.textContent = originalText;
              saveBtn.disabled = false;
              saveBtn.classList.remove('btn-saved');
            }, 2000);
          }
        } catch (err) {
          showMessage('Erro ao salvar alterações.', false);
        }
      });
    }
  }

  // Simple feedback message (could be improved with a modal/toast)
  function showMessage(msg, success) {
    let el = document.getElementById('profile-msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'profile-msg';
      el.style.position = 'fixed';
      el.style.top = '24px';
      el.style.left = '50%';
      el.style.transform = 'translateX(-50%)';
      el.style.zIndex = '9999';
      el.style.padding = '12px 24px';
      el.style.borderRadius = '8px';
      el.style.fontWeight = '600';
      el.style.fontSize = '1rem';
      el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.background = success ? '#E6F0EE' : '#FFD6D6';
    el.style.color = success ? '#15332B' : '#B00020';
    el.style.border = success ? '2px solid #15332B' : '2px solid #B00020';
    el.style.display = 'block';
    setTimeout(() => {
      el.style.display = 'none';
    }, 2200);
  }

  return { init };
})();
