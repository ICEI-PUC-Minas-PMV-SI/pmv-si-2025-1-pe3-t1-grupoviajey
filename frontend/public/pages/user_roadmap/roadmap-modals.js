import { createLocalCard, attachLocalCardActions } from './roadmap-utils.js';
import { initNearbyAutocomplete } from '../../js/utils/nearby-autocomplete.js';
import { roadmapStorage } from './roadmap-storage.js';
import { saveRoadmapToStorage } from './roadmap-core.js';
import { initializeGoogleMapsAutocomplete, getLastSelectedPlace, clearLastSelectedPlace } from './roadmap-map.js';
import { handleAddToTimeline, getPlaceData } from './roadmap-core.js';
import { handleAddToSavedPlaces } from './roadmap-storage.js';


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
        tripDescriptionInput.value = tripDescriptionBanner.textContent || '';
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
    if (window.google?.maps?.places) {
        if (!tripDestinationInput._autocompleteInitialized) {
            const autocomplete = new google.maps.places.Autocomplete(tripDestinationInput, {
                types: ['(cities)'],
            });
            tripDestinationInput._autocompleteInitialized = true;
        }
    } else {
        let tries = 0;
        const tryInit = () => {
            if (window.google?.maps?.places) {
                if (!tripDestinationInput._autocompleteInitialized) {
                    const autocomplete = new google.maps.places.Autocomplete(tripDestinationInput, {
                        types: ['(cities)'],
                    });
                    tripDestinationInput._autocompleteInitialized = true;
                }
            } else if (tries < 10) {
                tries++;
                setTimeout(tryInit, 300);
            }
        };
        tryInit();
    }

    modal.style.display = 'flex';
}

export function closeEditTripModal() {
    const modal = document.getElementById('editTripModal');
    if (modal) modal.style.display = 'none';
}

// Manipulação do formulário
function handleEditTripFormSubmit(event) {
    // ... existing code ...
}

// Upload e preview de foto
function handlePhotoUpload(event) {
    // ... existing code ...
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

            // Inicializa autocomplete restrito à cidade de destino
            const city = document.querySelector('#tripDestinationBanner')?.textContent?.trim() || '';
            initializeGoogleMapsAutocomplete(city);
        })
        .catch(error => {
            console.error('Error loading search bar:', error);
            // TODO: Adicionar feedback visual para o usuário
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
    // Obter o local selecionado do autocomplete
    const place = getLastSelectedPlace();
    let placeData;

    if (place) {
        // Se veio do autocomplete do Google
        placeData = getPlaceData(null, place);
    } else {
        // Se veio de input manual
        const input = document.querySelector('#modalSearchBarContainer input');
        placeData = getPlaceData(input, null);
    }

    if (!placeData || !placeData.name) {
        alert('Selecione ou digite um local válido.');
        return;
    }

    // Adiciona ao roteiro ou aos salvos
    if (modalState.isAddingToSavedPlaces) {
        handleAddToSavedPlaces(placeData);
    } else if (modalState.targetDayContent) {
        handleAddToTimeline(placeData, modalState.targetDayContent);
    }

    // Fecha o modal
    closeAddPlaceModal();
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

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('add-place-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.add-place-btn');
            if (!btn) return;
            const dayContent = btn.closest('.day-content');
            openAddPlaceModal(dayContent);
        }
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
        editTripForm.onsubmit = function (e) {
            e.preventDefault();
            const name = document.getElementById('tripName').value;
            const dest = document.getElementById('tripDestination').value;
            const dateInput = document.getElementById('editTripDateRange');
            const tripNameBanner = document.getElementById('tripNameBanner');
            const tripDestinationBanner = document.getElementById('tripDestinationBanner');
            const tripDateBanner = document.getElementById('tripDateBanner');
            const tripDescriptionInput = document.getElementById('edit-trip-description');
            const tripDescriptionBanner = document.getElementById('tripDescriptionBanner');
            const photoUrl = document.getElementById('edit-photo-url-hidden').value;

            // Atualiza na tela
            if (tripNameBanner) tripNameBanner.textContent = name;
            if (tripDestinationBanner) tripDestinationBanner.textContent = dest;
            if (tripDescriptionBanner && tripDescriptionInput) tripDescriptionBanner.textContent = tripDescriptionInput.value;

            // Atualiza os dados no localStorage
            const tripId = localStorage.getItem('selectedTripId');
            if (tripId) {
                const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
                const tripIndex = trips.findIndex(t => String(t.id) === String(tripId));

                if (tripIndex !== -1) {
                    // Atualiza os dados básicos
                    trips[tripIndex].title = name;
                    trips[tripIndex].destination = dest;
                    trips[tripIndex].description = tripDescriptionInput.value;

                    // Atualiza a foto se houver uma nova
                    if (photoUrl) {
                        trips[tripIndex].photo = photoUrl;
                        // Atualiza a imagem de capa
                        const coverImg = document.getElementById('cover-img');
                        if (coverImg) coverImg.src = photoUrl;
                    }

                    // Atualiza as datas se houver seleção
                    if (dateInput && dateInput._flatpickr && dateInput._flatpickr.selectedDates.length === 2) {
                        const startDate = dateInput._flatpickr.selectedDates[0];
                        const endDate = dateInput._flatpickr.selectedDates[1];
                        trips[tripIndex].startDate = startDate.toISOString().split('T')[0];
                        trips[tripIndex].endDate = endDate.toISOString().split('T')[0];
                        if (tripDateBanner) tripDateBanner.textContent = formatTripPeriod(startDate, endDate);
                        createDaysFromStorage(trips[tripIndex].startDate, trips[tripIndex].endDate);
                    }

                    // Salva as alterações
                    localStorage.setItem('userTrips', JSON.stringify(trips));
                }
            }

            // Fecha o modal
            closeEditTripModal();

            // Reatribui listeners e atualiza o roteiro
            attachRoadmapEventListeners();
            saveRoadmapToStorage();
            setTimeout(updateFinanceSummary, 100);

            // Atualiza o mapa de forma robusta após DOM atualizado
            setTimeout(() => {
                resetAndInitMap(dest);
            }, 50);
        };
    }

    // Configura o popup de requisitos da foto
    setupEditPhotoRequirementsPopup();
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

