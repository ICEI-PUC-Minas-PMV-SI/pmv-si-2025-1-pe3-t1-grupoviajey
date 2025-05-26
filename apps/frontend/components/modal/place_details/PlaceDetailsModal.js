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
      
      if (title) title.textContent = data.name || '';
      if (address) {
        address.textContent = data.address || storageData.address || '';
      }
      if (rating) {
        const ratingValue = data.rating || storageData.rating || 0;
        const stars = '★'.repeat(Math.floor(ratingValue)) + '☆'.repeat(5-Math.floor(ratingValue));
        rating.textContent = `${stars} ${ratingValue.toFixed(1)}/5`;
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

  // Função para compartilhar
  shareBtn.onclick = function(e) {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: modal.querySelector('.place-details-title').textContent,
        text: 'Confira este lugar incrível!',
        url: window.location.href
      })
      .catch(console.error);
    } else {
      // Fallback para copiar o link
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          const feedback = document.createElement('div');
          feedback.textContent = 'Link copiado!';
          feedback.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:10px 20px;border-radius:4px;z-index:1000;';
          document.body.appendChild(feedback);
          setTimeout(() => feedback.remove(), 2000);
        })
        .catch(console.error);
    }
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

  document.querySelector('.ver-avaliacoes-btn').onclick = function() {
    if (window.openReviewsModal) {
      const title = document.querySelector('.place-details-title');
      const localName = title ? title.textContent : '';
      window.openReviewsModal(localName);
    }
  };
})();
