import { createLocalCard, attachLocalCardActions, formatTripPeriod } from './roadmap-utils.js';
import { initNearbyAutocomplete } from '../../js/utils/nearby-autocomplete.js';
import { roadmapStorage, saveTripData } from './roadmap-storage.js';
import { saveRoadmapToStorage, createDaysFromStorage, createTimeline, loadRoadmapFromStorage } from './roadmap-core.js';
import { initializeGoogleMapsAutocomplete, getLastSelectedPlace, clearLastSelectedPlace, updateMap } from './roadmap-map.js';
import { handleAddToTimeline, getPlaceData } from './roadmap-core.js';
import { handleAddToSavedPlaces, loadSavedPlacesFromStorage, renderSavedPlacesTab } from './roadmap-storage.js';
import { searchDestinationImage } from '../../services/api/unsplash.js';
import { updateFinanceSummary } from './roadmap-finance.js';
import { initEventListeners, attachRoadmapEventListeners, initLocalCardDnD } from './roadmap-events.js';


// Estado dos modais
const modalState = {
  targetDayContent: null,
  isAddingToSavedPlaces: true,
  lastSelectedPlace: null
};

// Funções de utilidade
function getRandomPlaceImage() {
  const rand = Math.floor(Math.random() * 10000);
  return `https://source.unsplash.com/400x300/?travel,city,landscape&sig=${rand}`;
}

// =============================================
// MODAL DE EDIÇÃO DE VIAGEM
// =============================================

// Funções de abertura/fechamento
export function openEditTripModal() {
  const modal = document.getElementById('editTripModal');
  if (!modal) return;

  // Garante que o popup de recomendações está fechado
  const popup = document.getElementById('edit-photo-requirements-popup');
  if (popup) popup.classList.remove('active');
  const overlay = document.getElementById('edit-photo-requirements-overlay');
  if (overlay) overlay.style.display = 'none';

  // Preenche os campos com dados atuais
  const tripNameInput = document.getElementById('tripName');
  const tripDestinationInput = document.getElementById('tripDestination');
  const tripNameBanner = document.getElementById('tripNameBanner');
  const tripDestinationBanner = document.getElementById('tripDestinationBanner');
  const tripDateBanner = document.getElementById('tripDateBanner');
  const tripDescriptionInput = document.getElementById('edit-trip-description');
  const tripDescriptionBanner = document.getElementById('tripDescriptionBanner');

  if (tripNameInput && tripNameBanner) {
    tripNameInput.value = tripNameBanner.textContent;
  }

  if (tripDestinationInput && tripDestinationBanner) {
    tripDestinationInput.value = tripDestinationBanner.innerText.trim();
  }

  if (tripDescriptionInput && tripDescriptionBanner) {
    tripDescriptionInput.value = tripDescriptionBanner.textContent;
  }

  // Configura datas
  const tripDateInput = document.getElementById('editTripDateRange');
  if (tripDateInput && window.flatpickr) {
    let start = null, end = null;
    if (tripDateBanner && tripDateBanner.textContent && tripDateBanner.textContent.includes('-')) {
      const parts = tripDateBanner.textContent.split('-').map(p => p.trim());
      if (parts.length === 2) {
        const parseDate = (str) => {
          const [dia, mes, ano] = str.split(' ');
          const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
          const idx = meses.findIndex(m => mes.toLowerCase().startsWith(m));
          if (idx !== -1) {
            return new Date(Number(ano), idx, parseInt(dia));
          }
          return null;
        };
        start = parseDate(parts[0]);
        end = parseDate(parts[1]);
      }
    }

    if (tripDateInput._flatpickr) {
      tripDateInput._flatpickr.set('minDate', 'today');
      tripDateInput._flatpickr.setDate([start, end].filter(Boolean), true);
      tripDateInput._flatpickr.set('position', 'below');
    } else {
      window.flatpickr(tripDateInput, {
        mode: 'range',
        dateFormat: 'd M Y',
        locale: 'pt',
        minDate: 'today',
        defaultDate: [start, end].filter(Boolean),
        position: 'below'
      });
    }
  }

  // Configura autocomplete do destino
  let selectedPlace = null;
  if (window.google?.maps?.places) {
    if (!tripDestinationInput._autocompleteInitialized) {
      const autocomplete = new google.maps.places.Autocomplete(tripDestinationInput, {
        types: ['(cities)'],
      });
      autocomplete.addListener('place_changed', () => {
        selectedPlace = autocomplete.getPlace();
      });
      tripDestinationInput._autocompleteInitialized = true;
    }
  } else {
    let tries = 0;
    const maxTries = 20;
    const tryInit = () => {
      if (window.google?.maps?.places) {
        if (!tripDestinationInput._autocompleteInitialized) {
          const autocomplete = new google.maps.places.Autocomplete(tripDestinationInput, {
            types: ['(cities)'],
          });
          autocomplete.addListener('place_changed', () => {
            selectedPlace = autocomplete.getPlace();
          });
          tripDestinationInput._autocompleteInitialized = true;
        }
      } else if (tries < maxTries) {
        tries++;
        setTimeout(tryInit, 300);
      }
    };
    tryInit();
  }

  // Configura o botão de busca de foto
  const searchPhotoBtn = document.getElementById('edit-search-destination-photo');
  if (searchPhotoBtn) {
    searchPhotoBtn.onclick = async function () {
      const destination = document.getElementById('tripDestination').value;
      if (!destination) {
        alert('Por favor, selecione um destino primeiro.');
        return;
      }

      const searchButton = this;
      const originalText = searchButton.innerHTML;
      searchButton.disabled = true;
      searchButton.innerHTML = '<span>Buscando...</span>';

      try {
        const imageData = await searchDestinationImage(destination);
        if (imageData && imageData.length > 0) {
          const photoPreview = document.getElementById('edit-photo-preview');
          photoPreview.innerHTML = `
                        <div class="unsplash-gallery">
                            ${imageData.map((img, idx) => `
                                <img src="${img.thumb}"
                                     data-url="${img.url}"
                                     data-photographer="${img.photographer}"
                                     data-photographer-link="${img.photographerLink}"
                                     class="unsplash-thumb"
                                     style="cursor:pointer; border-radius:8px; margin:4px; border:2px solid transparent;"
                                     ${idx === 0 ? 'data-selected="true" style="border:2px solid #004954;"' : ''}
                                />
                            `).join('')}
                        </div>
                    `;
          photoPreview.classList.add('active');

          // Seleciona a primeira por padrão
          document.getElementById('edit-photo-url-hidden').value = imageData[0].url;

          // Adiciona evento de clique para cada thumb
          document.querySelectorAll('.unsplash-thumb').forEach(img => {
            img.addEventListener('click', function () {
              // Remove seleção anterior
              document.querySelectorAll('.unsplash-thumb').forEach(i => i.style.border = '2px solid transparent');
              this.style.border = '2px solid #004954';
              document.getElementById('edit-photo-url-hidden').value = this.dataset.url;
            });
          });
        } else {
          alert('Não foi possível encontrar uma imagem para este destino.');
        }
      } catch (error) {
        console.error('Erro ao buscar imagem:', error);
        alert('Erro ao buscar imagem do destino. Tente novamente.');
      } finally {
        searchButton.disabled = false;
        searchButton.innerHTML = originalText;
      }
    };
  }

  modal.style.display = 'flex';
}

export function closeEditTripModal() {
  const modal = document.getElementById('editTripModal');
  if (modal) modal.style.display = 'none';
}

// Manipulação do formulário
function handleEditTripFormSubmit(event) {
  event.preventDefault();

  try {
    const name = document.getElementById('tripName')?.value;
    const dest = document.getElementById('tripDestination')?.value;
    const dateInput = document.getElementById('editTripDateRange');
    const tripNameBanner = document.getElementById('tripNameBanner');
    const tripDestinationBanner = document.getElementById('tripDestinationBanner');
    const tripDateBanner = document.getElementById('tripDateBanner');
    const tripDescriptionInput = document.getElementById('edit-trip-description');
    const tripDescriptionBanner = document.getElementById('tripDescriptionBanner');
    const photoUrl = document.getElementById('edit-photo-url-hidden')?.value;

    if (!name || !dest) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Atualiza na tela
    if (tripNameBanner) tripNameBanner.textContent = name;
    if (tripDestinationBanner) tripDestinationBanner.textContent = dest;
    if (tripDescriptionBanner && tripDescriptionInput) tripDescriptionBanner.textContent = tripDescriptionInput.value;

    // Prepara os dados da viagem
    const tripId = localStorage.getItem('selectedTripId');
    if (tripId) {
      const tripData = {
        id: tripId,
        tripName: name,
        tripDestination: dest,
        tripDescription: tripDescriptionInput?.value || ''
      };

      // Atualiza as datas se houver seleção
      if (dateInput?._flatpickr?.selectedDates?.length === 2) {
        const startDate = dateInput._flatpickr.selectedDates[0];
        const endDate = dateInput._flatpickr.selectedDates[1];
        tripData.startDate = startDate.toISOString();
        tripData.endDate = endDate.toISOString();

        // Atualiza o banner de datas
        if (tripDateBanner) {
          tripDateBanner.textContent = formatTripPeriod(startDate, endDate);
        }

        // Recria os dias com as novas datas
        createDaysFromStorage(startDate.toISOString(), endDate.toISOString());
      }

      // Atualiza a foto se houver uma nova
      if (photoUrl) {
        tripData.photo = photoUrl;
        const coverImg = document.getElementById('cover-img');
        if (coverImg) coverImg.src = photoUrl;
      }

      // Salva os dados
      if (saveTripData(tripData)) {
        // Fecha o modal
        closeEditTripModal();

        // Restaura o conteúdo da tab ativa
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
          const tabText = activeTab.textContent.trim();
          if (tabText === 'Roteiro') {
            document.getElementById('tab-itinerary').style.display = 'block';
          } else if (tabText === 'Check-list') {
            document.getElementById('tab-checklist').style.display = 'block';
          } else if (tabText === 'Locais salvos') {
            document.getElementById('tab-saved-places').style.display = 'block';
          }
        }
      } else {
        throw new Error('Falha ao salvar dados da viagem');
      }
    }

  } catch (error) {
    console.error('Erro ao salvar edição da viagem:', error);
    alert('Erro ao salvar edição da viagem. Por favor, tente novamente.');
  }
}

// Upload e preview de foto
function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const photoPreview = document.getElementById('edit-photo-preview');
    if (photoPreview) {
      photoPreview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; border-radius: 8px;">`;
      photoPreview.classList.add('active');
    }
    document.getElementById('edit-photo-url-hidden').value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// =============================================
// MODAL DE COMPARTILHAMENTO
// =============================================

export function openShareModal() {
  const modal = document.getElementById('shareModal');
  const input = document.getElementById('shareLinkInput');
  const copyBtn = document.getElementById('copyShareLinkBtn');

  if (modal && input && copyBtn) {
    input.value = window.location.href;
    modal.style.display = 'flex';
    copyBtn.textContent = 'Copiar link';
    input.select();
  }
}

export function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.style.display = 'none';
}

function handleCopyShareLink() {
  // ... existing code ...
}

// =============================================
// MODAL DE COLABORAÇÃO
// =============================================

export function openCollabModal() {
  const modal = document.getElementById('collabModal');
  const input = document.getElementById('collabLinkInput');
  const copyBtn = document.getElementById('copyCollabLinkBtn');

  if (modal && input && copyBtn) {
    input.value = window.location.href;
    modal.style.display = 'flex';
    copyBtn.textContent = 'Copiar';
    input.select();
    renderCollabList();
  }
}

export function closeCollabModal() {
  const modal = document.getElementById('collabModal');
  if (modal) modal.style.display = 'none';
}

function handleCopyCollabLink() {
  // ... existing code ...
}

// =============================================
// MODAL DE ADIÇÃO DE LOCAL
// =============================================

export function openAddPlaceModal(targetDayContent = null, isAddingToSavedPlaces = false) {
  const modal = document.getElementById('addPlaceModal');
  const container = document.getElementById('modalSearchBarContainer');
  if (!modal || !container) {
    console.error('Required modal elements not found');
    return;
  }

  // Atualiza estado
  modalState.targetDayContent = targetDayContent;
  modalState.isAddingToSavedPlaces = isAddingToSavedPlaces;
  clearLastSelectedPlace();

  // Limpa conteúdo anterior
  container.innerHTML = '';

  // Carrega search bar
  loadSearchBar(container)
    .then(() => {
      // Remove elementos desnecessários
      const calendarBtn = container.querySelector('.calendar-btn');
      const searchBtn = container.querySelector('.search-btn');
      if (calendarBtn) calendarBtn.style.display = 'none';
      if (searchBtn) searchBtn.style.display = 'none';

      // Inicializa autocomplete restrito à cidade de destino, aguardando input existir
      const city = document.querySelector('#tripDestinationBanner')?.textContent?.trim() || '';
      let tries = 0;
      const maxTries = 20;
      const tryInitAutocomplete = () => {
        const input = container.querySelector('input');
        if (input && window.google && window.google.maps && window.google.maps.places) {
          initializeGoogleMapsAutocomplete(city, '#modalSearchBarContainer input');
        } else if (tries < maxTries) {
          tries++;
          setTimeout(tryInitAutocomplete, 50);
        } else {
          console.error('Erro ao inicializar autocomplete: Input não encontrado para autocomplete após várias tentativas');
        }
      };
      tryInitAutocomplete();
    })
    .catch(error => {
      console.error('Error loading search bar:', error);
    });

  // Mostra modal
  modal.style.display = 'flex';

  // Adiciona event listener ao botão Adicionar
  const confirmBtn = document.getElementById('confirmAddPlaceModal');
  if (confirmBtn) {
    confirmBtn.onclick = function (e) {
      e.preventDefault();
      handleAddPlaceConfirm();
    };
  }
}

async function loadSearchBar(container) {
  try {
    const response = await fetch('/components/search-bar/search-bar.html');
    if (!response.ok) throw new Error('Failed to load search bar');

    const html = await response.text();
    container.innerHTML = html;

    // Garante CSS
    if (!document.querySelector('link[href*="search-bar/search-bar.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/components/search-bar/search-bar.css';
      document.head.appendChild(link);
    }
  } catch (error) {
    console.error('Error loading search bar:', error);
    throw error;
  }
}

export function closeAddPlaceModal() {
  const modal = document.getElementById('addPlaceModal');
  if (modal) {
    modal.style.display = 'none';
    // Limpa estado
    clearLastSelectedPlace();
    modalState.targetDayContent = null;
    modalState.isAddingToSavedPlaces = false;
  }
}

function handleAddPlaceConfirm() {
  const place = getLastSelectedPlace();
  console.log('[DEBUG] getLastSelectedPlace', place);
  let placeData;

  if (place) {
    placeData = getPlaceData(null, place);
  } else {
    const input = document.querySelector('#modalSearchBarContainer input');
    placeData = getPlaceData(input, null);
  }

  if (!placeData || !placeData.name) {
    alert('Selecione ou digite um local válido.');
    return;
  }

  if (modalState.isAddingToSavedPlaces) {
    handleAddToSavedPlaces(placeData);
    const savedPlaces = loadSavedPlacesFromStorage() || [];
    updateMap(savedPlaces);
  } else {
    const dayContent = modalState.targetDayContent;
    if (!dayContent || !(dayContent instanceof Element)) {
      console.error('targetDayContent não é um elemento DOM válido:', dayContent);
      return;
    }
    console.log('Adicionando ao dayContent:', dayContent);
    handleAddToTimeline(placeData, dayContent);
  }

  closeAddPlaceModal();
}

// =============================================
// MODAL DE ALERTA DE LOCAIS MOVIDOS
// =============================================

export function showPlacesMovedAlert() {
  const modal = document.getElementById('placesMovedAlertModal');
  if (!modal) return;

  modal.style.display = 'flex';
}

export function closePlacesMovedAlert() {
  const modal = document.getElementById('placesMovedAlertModal');
  if (!modal) return;

  modal.style.display = 'none';
}

function initPlacesMovedAlertModal() {
  const closeBtn = document.getElementById('closePlacesMovedAlertModal');
  const confirmBtn = document.getElementById('confirmPlacesMovedAlert');
  const modal = document.getElementById('placesMovedAlertModal');

  if (closeBtn) {
    closeBtn.onclick = closePlacesMovedAlert;
  }

  if (confirmBtn) {
    confirmBtn.onclick = closePlacesMovedAlert;
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        closePlacesMovedAlert();
      }
    };
  }
}

// =============================================
// INICIALIZAÇÃO DOS MODAIS
// =============================================

export function initModals() {
  // Configura handlers de fechamento para todos os modais
  const modals = {
    'addPlaceModal': closeAddPlaceModal,
    'editTripModal': closeEditTripModal,
    'shareModal': closeShareModal,
    'collabModal': closeCollabModal
  };

  // Fecha ao clicar fora
  window.addEventListener('click', (e) => {
    Object.entries(modals).forEach(([id, closeFn]) => {
      const modal = document.getElementById(id);
      if (modal && e.target === modal) {
        closeFn();
      }
    });
  });

  // Fecha com ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      Object.entries(modals).forEach(([id, closeFn]) => {
        const modal = document.getElementById(id);
        if (modal && modal.style.display === 'flex') {
          closeFn();
        }
      });
    }
  });

  // Configura botões de fechar
  Object.entries(modals).forEach(([id, closeFn]) => {
    const closeBtn = document.getElementById(`close${id.charAt(0).toUpperCase() + id.slice(1)}`);
    if (closeBtn) {
      closeBtn.onclick = closeFn;
    }
  });

  document.querySelectorAll('.add-place-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const dayContent = this.closest('.day-content');
      if (!dayContent) {
        console.error('dayContent não encontrado');
        return;
      }
      console.log('dayContent encontrado:', dayContent);
      modalState.targetDayContent = dayContent;
      openAddPlaceModal(dayContent);
    });
  });

  // Configura os botões de abrir modais
  const settingsBtn = document.querySelector('.cover-action-btn[title="Configurações"]');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openEditTripModal);
  }

  const shareBtn = document.querySelector('.cover-action-btn[title="Compartilhar"]');
  if (shareBtn) {
    shareBtn.addEventListener('click', openShareModal);
  }

  const collabBtn = document.querySelector('.cover-action-btn[title="Adicionar pessoa"]');
  if (collabBtn) {
    collabBtn.addEventListener('click', openCollabModal);
  }

  // Configura os botões de fechar modais
  const closeEditBtn = document.getElementById('closeEditTripModal');
  if (closeEditBtn) {
    closeEditBtn.onclick = closeEditTripModal;
  }

  const closeShareBtn = document.getElementById('closeShareModal');
  if (closeShareBtn) {
    closeShareBtn.onclick = closeShareModal;
  }

  const closeCollabBtn = document.getElementById('closeCollabModal');
  if (closeCollabBtn) {
    closeCollabBtn.onclick = closeCollabModal;
  }

  // Configura os botões de copiar link
  const copyBtn = document.getElementById('copyShareLinkBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      const shareInput = document.getElementById('shareLinkInput');
      if (shareInput) {
        shareInput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Link copiado!';
        setTimeout(() => copyBtn.textContent = 'Copiar link', 1800);
      }
    });
  }

  const copyCollabBtn = document.getElementById('copyCollabLinkBtn');
  if (copyCollabBtn) {
    copyCollabBtn.addEventListener('click', function () {
      const collabInput = document.getElementById('collabLinkInput');
      if (collabInput) {
        collabInput.select();
        document.execCommand('copy');
        copyCollabBtn.textContent = 'Link copiado!';
        setTimeout(() => copyCollabBtn.textContent = 'Copiar', 1800);
      }
    });
  }

  // Configura o fechamento dos modais ao clicar fora
  window.addEventListener('click', function (e) {
    const editModal = document.getElementById('editTripModal');
    const shareModal = document.getElementById('shareModal');
    const collabModal = document.getElementById('collabModal');
    const addPlaceModal = document.getElementById('addPlaceModal');

    if (editModal && e.target === editModal) closeEditTripModal();
    if (shareModal && e.target === shareModal) closeShareModal();
    if (collabModal && e.target === collabModal) closeCollabModal();
    if (addPlaceModal && e.target === addPlaceModal) closeAddPlaceModal();
  });

  // Configura o fechamento dos modais com ESC
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const editModal = document.getElementById('editTripModal');
      const shareModal = document.getElementById('shareModal');
      const collabModal = document.getElementById('collabModal');
      const addPlaceModal = document.getElementById('addPlaceModal');

      if (editModal && editModal.style.display === 'flex') closeEditTripModal();
      if (shareModal && shareModal.style.display === 'flex') closeShareModal();
      if (collabModal && collabModal.style.display === 'flex') closeCollabModal();
      if (addPlaceModal && addPlaceModal.style.display === 'flex') closeAddPlaceModal();
    }
  });

  // Configura o formulário de edição da viagem
  const editTripForm = document.getElementById('editTripForm');
  if (editTripForm) {
    editTripForm.addEventListener('submit', handleEditTripFormSubmit);
  }

  // Configura o upload de foto
  const photoInput = document.getElementById('edit-trip-photo');
  if (photoInput) {
    photoInput.addEventListener('change', handlePhotoUpload);
  }

  // Configura o popup de requisitos da foto
  setupEditPhotoRequirementsPopup();

  initPlacesMovedAlertModal();
}

// Função para configurar o popup de requisitos da foto
function setupEditPhotoRequirementsPopup() {
  const uploadLabel = document.querySelector('.photo-upload-label');
  const popup = document.getElementById('edit-photo-requirements-popup');
  const closeBtn = popup?.querySelector('.close-popup');
  const fileInput = document.getElementById('edit-trip-photo');
  const overlay = document.getElementById('edit-photo-requirements-overlay');

  if (uploadLabel && popup && closeBtn && fileInput) {
    uploadLabel.addEventListener('click', (e) => {
      e.preventDefault();
      popup.classList.add('active');
      popup.style.display = 'block';
      if (overlay) {
        overlay.style.display = 'block';
        overlay.style.pointerEvents = 'none';
      }
    });

    closeBtn.addEventListener('click', () => {
      popup.classList.remove('active');
      if (overlay) {
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
      }
      setTimeout(() => fileInput.click(), 50);
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        popup.classList.remove('active');
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'none';
      });
    }
  }
}
