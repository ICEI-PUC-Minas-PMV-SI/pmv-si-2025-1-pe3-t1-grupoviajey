(function() {
  const modal = document.getElementById('place-details-modal');
  if (!modal) return;
  const closeBtn = modal.querySelector('.place-details-modal-close');
  const overlay = modal;
  const abrirRoteiroBtn = modal.querySelector('#abrir-roteiro-dropdown');
  const roteiroDropdown = modal.querySelector('#roteiro-dropdown');
  const roteiroLista = roteiroDropdown.querySelector('.roteiro-lista');
  const roteiroCriar = roteiroDropdown.querySelector('.roteiro-criar');
  const roteiroInput = roteiroDropdown.querySelector('.roteiro-input');
  const roteiroSalvar = roteiroDropdown.querySelector('.roteiro-salvar');
  const roteiroFeedback = modal.querySelector('#roteiro-feedback');

  // Função global para abrir o modal
  window.openPlaceDetailsModal = function() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    roteiroDropdown.style.display = 'none';
    roteiroCriar.style.display = 'none';
    roteiroFeedback.style.display = 'none';
  };

  // Fechar modal
  closeBtn.onclick = fecharModal;
  overlay.onclick = function(e) {
    if (e.target === overlay) fecharModal();
  };
  function fecharModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Dropdown de roteiros
  abrirRoteiroBtn.onclick = function(e) {
    e.stopPropagation();
    roteiroDropdown.style.display = roteiroDropdown.style.display === 'block' ? 'none' : 'block';
    roteiroCriar.style.display = 'none';
    roteiroFeedback.style.display = 'none';
  };
  // Fechar dropdown ao clicar fora
  document.addEventListener('click', function(e) {
    if (!roteiroDropdown.contains(e.target) && e.target !== abrirRoteiroBtn) {
      roteiroDropdown.style.display = 'none';
    }
  });
  // Selecionar roteiro existente
  roteiroLista.querySelectorAll('.roteiro-item').forEach(item => {
    if (item.textContent === '+ Criar novo roteiro') {
      item.onclick = function(e) {
        e.stopPropagation();
        roteiroCriar.style.display = 'flex';
        roteiroInput.value = '';
        roteiroInput.focus();
      };
    } else {
      item.onclick = function(e) {
        e.stopPropagation();
        roteiroDropdown.style.display = 'none';
        mostrarFeedback(`Adicionado ao roteiro <b>${item.textContent}</b> <span style='color:green;font-size:1.2em;'>✔️</span>`);
      };
    }
  });
  // Salvar novo roteiro
  roteiroSalvar.onclick = function(e) {
    e.stopPropagation();
    const nome = roteiroInput.value.trim();
    if (nome) {
      roteiroDropdown.style.display = 'none';
      roteiroCriar.style.display = 'none';
      mostrarFeedback(`Adicionado ao roteiro <b>${nome}</b> <span style='color:green;font-size:1.2em;'>✔️</span>`);
    }
  };
  function mostrarFeedback(msg) {
    roteiroFeedback.innerHTML = msg;
    roteiroFeedback.style.display = 'flex';
    setTimeout(() => { roteiroFeedback.style.display = 'none'; }, 2200);
  }
})();
