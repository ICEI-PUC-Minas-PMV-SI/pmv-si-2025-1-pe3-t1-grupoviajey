/**
 * Results management module for search results page
 */
import { selectedType, isTypeMatch, markers } from './map-config.js';
import { updateMarkerAnimation } from '../../js/core/map/markers.js';

let floatingDropdown = null;
let allResults = [];

/**
 * Gets the persisted search data from localStorage
 * @returns {Object} The search data
 */
function getBuscaPersistida() {
  try {
    const data = localStorage.getItem('buscaViajey');
    console.log('Dados da busca:', data);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Erro ao ler dados da busca:', error);
    return {};
  }
}

/**
 * Shows feedback message for adding to itinerary
 * @param {string} msg - The message to show
 * @param {HTMLElement} feedback - The feedback element
 */
function mostrarFeedback(msg, feedback) {
  feedback.innerHTML = msg;
  feedback.style.display = 'flex';
  clearTimeout(feedback._timeout);
  feedback._timeout = setTimeout(() => {
    feedback.style.display = 'none';
  }, 2200);
}

/**
 * Shows the floating dropdown near a button
 * @param {HTMLElement} btn - The button element
 */
function showFloatingDropdown(btn) {
  if (!floatingDropdown) {
    floatingDropdown = document.createElement('div');
    floatingDropdown.id = 'floating-roteiro-dropdown';
    floatingDropdown.className = 'floating-roteiro-dropdown';
    floatingDropdown.innerHTML = `
      <div class="roteiro-lista">
        <div class="roteiro-item">Viagem SC</div>
        <div class="roteiro-item">Férias 2024</div>
        <div class="roteiro-item">+ Criar novo roteiro</div>
      </div>
      <div class="roteiro-criar" style="display:none;">
        <input type="text" placeholder="Nome do roteiro" class="roteiro-input" />
        <button class="roteiro-salvar">Salvar</button>
      </div>
      <div class="roteiro-feedback" style="display:none;"></div>
    `;
    document.body.appendChild(floatingDropdown);
  }

  floatingDropdown.style.display = 'none';

  const rect = btn.getBoundingClientRect();
  floatingDropdown.style.top = `${rect.top}px`;
  floatingDropdown.style.right = `${window.innerWidth - rect.right + 56}px`;
  floatingDropdown.style.display = 'block';

  const criar = floatingDropdown.querySelector('.roteiro-criar');
  const feedback = floatingDropdown.querySelector('.roteiro-feedback');
  criar.style.display = 'none';
  feedback.style.display = 'none';

  const lista = floatingDropdown.querySelector('.roteiro-lista');
  const input = floatingDropdown.querySelector('.roteiro-input');
  const salvar = floatingDropdown.querySelector('.roteiro-salvar');

  lista.querySelectorAll('.roteiro-item').forEach(item => {
    item.onclick = function(ev) {
      ev.stopPropagation();
      if (item.textContent === '+ Criar novo roteiro') {
        criar.style.display = 'flex';
        input.value = '';
        input.focus();
      } else {
        mostrarFeedback(`Adicionado ao roteiro <b>${item.textContent}</b>`, feedback);
        setTimeout(() => {
          floatingDropdown.style.display = 'none';
        }, 2200);
      }
    };
  });

  salvar.onclick = function(ev) {
    ev.stopPropagation();
    const nome = input.value.trim();
    if (nome) {
      mostrarFeedback(`Adicionado ao roteiro <b>${nome}</b>`, feedback);
      setTimeout(() => {
        floatingDropdown.style.display = 'none';
        criar.style.display = 'none';
      }, 2200);
    }
  };

  document.addEventListener('click', function closeDropdown(e) {
    if (!floatingDropdown.contains(e.target) && e.target !== btn) {
      floatingDropdown.style.display = 'none';
      document.removeEventListener('click', closeDropdown);
    }
  });
}

/**
 * Binds floating dropdown events to result cards
 */
function bindFloatingDropdownToCards() {
  document.querySelectorAll('.add-roteiro-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      showFloatingDropdown(btn);
    };
  });
}

/**
 * Renders the search results
 * @param {Array} results - Array of place results
 */
function renderResults(results) {
  console.log('Renderizando resultados:', results);
  allResults = results;
  const grid = document.querySelector('.results-grid');
  if (!grid) {
    console.error('Elemento .results-grid não encontrado');
    return;
  }

  // Limpa marcadores antigos do mapa
  if (Array.isArray(markers)) {
    markers.forEach(marker => marker.setMap(null));
    markers.length = 0;
  }

  grid.innerHTML = '';
  
  const filtered = results.filter(place => isTypeMatch(place, selectedType));
  console.log('Resultados filtrados:', filtered);
  
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-results">Nenhum resultado encontrado para o tipo selecionado.</div>';
    return;
  }
  
  filtered.forEach((place, index) => {
    const card = window.createResultCard({
      image: '',
      title: place.name,
      rating: place.rating || 0,
      tags: place.types ? place.types.slice(0, 2) : [],
      address: place.vicinity || '',
      price_level: place.price_level
    });
    
    card.classList.add('result-card');
    card.dataset.placeIndex = index;

    const addRoteiroBtn = card.querySelector('.result-btn');
    if (addRoteiroBtn) {
      addRoteiroBtn.classList.remove('result-btn');
      addRoteiroBtn.classList.add('add-roteiro-btn');
    }

    card.addEventListener('mouseenter', () => {
      if (markers[index]) {
        updateMarkerAnimation(markers[index], true);
      }
    });
    
    card.addEventListener('mouseleave', () => {
      if (markers[index]) {
        updateMarkerAnimation(markers[index], false);
      }
    });

    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('add-roteiro-btn')) {
        if (typeof openPlaceDetailsModal === 'function') {
          const buscaAtual = getBuscaPersistida();
          const dadosAtualizados = {
            ...buscaAtual,
            rating: place.rating || 0,
            address: place.vicinity || '',
            placeName: place.name,
            price_level: place.price_level
          };
          localStorage.setItem('buscaViajey', JSON.stringify(dadosAtualizados));

          openPlaceDetailsModal({
            name: place.name,
            address: place.vicinity || '',
            rating: place.rating || 0,
            price_level: place.price_level
          });
        }
      }
    });

    grid.appendChild(card);
  });

  // Cria marcadores apenas para os resultados filtrados
  if (window.map && typeof window.createMarkers === 'function') {
    const newMarkers = window.createMarkers(window.map, filtered);
    if (Array.isArray(markers)) {
      markers.push(...newMarkers);
    }
  }

  bindFloatingDropdownToCards();
}

export { renderResults, getBuscaPersistida }; 