// profile-security.js
// Handles password change logic for the security tab

window.ProfileSecurity = (function() {
  function init() {
    const form = document.getElementById('security-form');
    const saveBtn = document.getElementById('save-password-btn');
    if (!form || !saveBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = form.currentPassword.value.trim();
      const newPassword = form.newPassword.value.trim();
      const confirmPassword = form.confirmPassword.value.trim();

      // Simple validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('Preencha todos os campos.', false);
        return;
      }
      if (newPassword.length < 8) {
        showMessage('A nova senha deve ter pelo menos 8 caracteres.', false);
        return;
      }
      if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
        showMessage('A senha deve conter letras maiúsculas, minúsculas e números.', false);
        return;
      }
      if (newPassword !== confirmPassword) {
        showMessage('As senhas não coincidem.', false);
        return;
      }
      if (newPassword === currentPassword) {
        showMessage('A nova senha deve ser diferente da atual.', false);
        return;
      }

      // Simular chamada ao backend
      try {
        await mockChangePassword(currentPassword, newPassword);
        showMessage('Senha alterada com sucesso!', true);
        saveBtn.textContent = 'Senha alterada!';
        saveBtn.disabled = true;
        setTimeout(() => {
          saveBtn.textContent = 'Salvar nova senha';
          saveBtn.disabled = false;
          form.reset();
        }, 2000);
      } catch (err) {
        showMessage('Erro ao alterar senha.', false);
      }
    });
  }

  // Mock async backend call
  async function mockChangePassword(current, newPass) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simule erro se senha atual for "errada"
        if (current !== '********') reject(new Error('Senha atual incorreta.'));
        else resolve({ success: true });
      }, 600);
    });
  }

  function showMessage(msg, success) {
    let el = document.getElementById('security-msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'security-msg';
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