(function() {
  const modal = document.getElementById('place-details-modal');
  if (!modal) return;
  const closeBtn = modal.querySelector('.place-details-modal-close');
  const overlay = modal;
  const addBtn = modal.querySelector('.place-details-action-btn[title="Adicionar ao roteiro"]');
  const favoriteBtn = modal.querySelector('.place-details-action-btn[title="Favoritar"]');
  const shareBtn = modal.querySelector('.place-details-action-btn[title="Compartilhar"]');
  const abrirRoteiroBtn = modal.querySelector('#abrir-roteiro-dropdown');
  const roteiroDropdown = modal.querySelector('#roteiro-dropdown');
  const roteiroLista = roteiroDropdown.querySelector('.roteiro-lista');
  const roteiroCriar = roteiroDropdown.querySelector('.roteiro-criar');
  const roteiroInput = roteiroDropdown.querySelector('.roteiro-input');
  const roteiroSalvar = roteiroDropdown.querySelector('.roteiro-salvar');
  const roteiroFeedback = modal.querySelector('#roteiro-feedback');

  // Função para buscar dados do local storage
  function getLocalStorageData() {
    try {
      return JSON.parse(localStorage.getItem('buscaViajey')) || {};
    } catch {
      return {};
    }
  }

  // Função para buscar previsão do tempo usando WeatherAPI
  async function getWeatherForecast(city, checkin, checkout) {
    try {
      const API_KEY = '02e99a578428467aa2b61554252605'; // Substitua pela sua chave do WeatherAPI
      const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=3&lang=pt`);
      const data = await response.json();

      const weatherContainer = modal.querySelector('.place-details-weather');
      if (data && data.forecast && data.forecast.forecastday && weatherContainer) {
        let html = `<div class="place-details-weather-title">Previsão do Tempo (3 dias)</div>`;
        data.forecast.forecastday.forEach(day => {
          html += `
            <div class="weather-info" style="margin-bottom:8px;">
              <span>${new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
              <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
              <span>${Math.round(day.day.maxtemp_c)}°C / ${Math.round(day.day.mintemp_c)}°C</span>
              <span>${day.day.condition.text}</span>
            </div>
          `;
        });
        weatherContainer.innerHTML = html;
      } else {
        weatherContainer.innerHTML = '<span>Não foi possível obter a previsão do tempo.</span>';
      }
    } catch (error) {
      console.error('Erro ao buscar previsão do tempo:', error);
    }
  }

  // Função global para abrir o modal
  window.openPlaceDetailsModal = function(data) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    roteiroDropdown.style.display = 'none';
    roteiroCriar.style.display = 'none';
    roteiroFeedback.style.display = 'none';

    // Buscar dados do local storage
    const storageData = getLocalStorageData();

    // Popular nome e endereço
    if (data) {
      const title = modal.querySelector('.place-details-title');
      const address = modal.querySelector('.place-details-list li span');
      const rating = modal.querySelector('.place-details-list li:nth-child(4) span');
      const starsContainer = modal.querySelector('.avaliacoes-estrelas');
      
      if (title) title.textContent = data.name || '';
      if (address) {
        address.textContent = data.address || storageData.address || '';
      }
      if (rating && starsContainer) {
        // Usar a avaliação do data passado pelo card
        const ratingValue = parseFloat(data.rating) || 0;
        
        // Atualizar o texto da avaliação
        rating.textContent = `${ratingValue.toFixed(1)}/5`;
        
        // Atualizar as estrelas
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
          const star = document.createElement('span');
          // Usar Math.round para arredondar corretamente
          star.className = i <= Math.round(ratingValue) ? 'star filled' : 'star';
          star.textContent = '★';
          starsContainer.appendChild(star);
        }
      }

      // Preencher informações adicionais do local storage
      const checkin = storageData.checkin || '';
      const checkout = storageData.checkout || '';

      // Atualizar informações no modal
      const checkinElement = modal.querySelector('.place-details-checkin');
      const checkoutElement = modal.querySelector('.place-details-checkout');

      if (checkinElement) checkinElement.textContent = checkin;
      if (checkoutElement) checkoutElement.textContent = checkout;

      // Buscar previsão do tempo
      const cidadeBusca = storageData.cidade;
      if (cidadeBusca) {
        console.log('Buscando previsão do tempo para cidade:', cidadeBusca); // Debug
        getWeatherForecast(cidadeBusca, checkin, checkout);
      } else {
        console.log('Cidade não disponível para buscar previsão do tempo'); // Debug
      }
    }
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

  // Adicionar listener para tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      fecharModal();
    }
  });

  // Dropdown de roteiros
  function toggleDropdown() {
    const modalBox = document.querySelector('.place-details-modal');
    const isOpen = roteiroDropdown.style.display === 'block';
    
    roteiroDropdown.style.display = isOpen ? 'none' : 'block';
    roteiroCriar.style.display = 'none';
    roteiroFeedback.style.display = 'none';
    
    if (!isOpen) {
      modalBox.classList.add('dropdown-active');
    } else {
      modalBox.classList.remove('dropdown-active');
    }
  }

  abrirRoteiroBtn.onclick = function(e) {
    e.stopPropagation();
    toggleDropdown();
  };
  addBtn.onclick = function(e) {
    e.stopPropagation();
    toggleDropdown();
  };
  // Fechar dropdown ao clicar fora
  document.addEventListener('click', function(e) {
    if (!roteiroDropdown.contains(e.target) && e.target !== abrirRoteiroBtn && e.target !== addBtn) {
      roteiroDropdown.style.display = 'none';
      roteiroCriar.style.display = 'none';
      roteiroFeedback.style.display = 'none';
      const modalBox = document.querySelector('.place-details-modal');
      modalBox.classList.remove('dropdown-active');
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
        mostrarFeedback(`Adicionado ao roteiro <b>${item.textContent}</b>`);
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
      mostrarFeedback(`Adicionado ao roteiro <b>${nome}</b>`);
    }
  };
  function mostrarFeedback(msg) {
    roteiroFeedback.innerHTML = `${msg} <i class="fas fa-check-circle" style="color:#2ecc71;font-size:1.2em;"></i>`;
    roteiroFeedback.style.display = 'flex';
    setTimeout(() => { roteiroFeedback.style.display = 'none'; }, 2200);
  }

  // Função para compartilhar
  shareBtn.onclick = function(e) {
    e.stopPropagation();
    const shareModal = document.getElementById('share-modal');
    const shareLinkInput = document.getElementById('share-link-input');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const closeBtn = shareModal.querySelector('.share-modal-close');

    // Preencher o input com a URL atual
    shareLinkInput.value = window.location.href;

    // Mostrar o modal
    shareModal.style.display = 'flex';

    // Função para copiar o link
    copyLinkBtn.onclick = function() {
      shareLinkInput.select();
      document.execCommand('copy');
      
      // Feedback visual
      const originalText = copyLinkBtn.innerHTML;
      copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
      copyLinkBtn.style.background = '#27ae60';
      
      setTimeout(() => {
        copyLinkBtn.innerHTML = originalText;
        copyLinkBtn.style.background = '';
      }, 2000);
    };

    // Fechar o modal
    closeBtn.onclick = function() {
      shareModal.style.display = 'none';
    };

    // Fechar ao clicar fora
    shareModal.onclick = function(e) {
      if (e.target === shareModal) {
        shareModal.style.display = 'none';
      }
    };

    // Fechar com ESC
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape' && shareModal.style.display === 'flex') {
        shareModal.style.display = 'none';
        document.removeEventListener('keydown', escHandler);
      }
    });
  };

  // Função para favoritar
  favoriteBtn.onclick = function(e) {
    e.stopPropagation();
    const icon = this.querySelector('i');
    if (icon.classList.contains('far')) {
      icon.classList.remove('far');
      icon.classList.add('fas');
      icon.style.color = '#ff4444';
    } else {
      icon.classList.remove('fas');
      icon.classList.add('far');
      icon.style.color = '#333';
    }
  };

  // Tornar o bloco de avaliações clicável para abrir o modal de avaliações
  document.querySelector('.avaliacoes-bloco-clicavel').onclick = function() {
    if (window.openReviewsModal) {
      const title = document.querySelector('.place-details-title');
      const localName = title ? title.textContent : '';
      window.openReviewsModal(localName);
    }
  };
})();
