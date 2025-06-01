import { includeHeader, includeFooter } from '../../js/utils/include.js';
document.addEventListener('DOMContentLoaded', function() {
  const btnRecovery = document.getElementById('btn-recovery');
  const emailInput = document.getElementById('recovery-email');

  function showModal(message, success = true, callback = null) {
    let modal = document.getElementById('recovery-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'recovery-modal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.35)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '9999';
      modal.innerHTML = `
        <div style="background:#fff;padding:32px 28px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.12);max-width:90vw;width:350px;text-align:center;">
          <p id="recovery-modal-msg" style="font-size:1.1rem;color:${success ? '#15332B' : '#B00020'};margin-bottom:24px;">${message}</p>
          <button id="recovery-modal-close" style="padding:10px 32px;border-radius:6px;border:none;background:${success ? '#15332B' : '#B00020'};color:#fff;font-weight:600;font-size:1rem;cursor:pointer;">OK</button>
        </div>
      `;
      document.body.appendChild(modal);
    } else {
      document.getElementById('recovery-modal-msg').textContent = message;
    }
    modal.style.display = 'flex';
    document.getElementById('recovery-modal-close').onclick = function() {
      modal.style.display = 'none';
      if (typeof callback === 'function') callback();
    };
  }

  async function recuperarSenha(email) {
    // Simulação de chamada ao backend
    try {
      // Aqui você pode integrar com o backend real futuramente
      // const response = await fetch('/api/recuperar-senha', { method: 'POST', body: JSON.stringify({ email }) });
      // if (!response.ok) throw new Error('E-mail não encontrado');
      // const data = await response.json();

      // Mock: aceita qualquer email preenchido
      if (!email) {
        showModal('Preencha o e-mail.', false);
        return;
      }
      // Simula envio de e-mail
      showModal('Se o e-mail estiver cadastrado, você receberá as instruções para recuperar sua senha.', true, function() {
        window.location.href = '../login-usuario/login.html';
      });
    } catch (err) {
      showModal('Erro ao solicitar recuperação de senha.', false);
    }
  }

  if (btnRecovery) {
    btnRecovery.addEventListener('click', function(e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      recuperarSenha(email);
    });
  }
}); 