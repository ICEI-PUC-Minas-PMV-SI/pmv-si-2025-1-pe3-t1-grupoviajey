import { includeSearchBar } from '../../../js/utils/include.js';
import { loadGoogleMapsScript } from '../../../js/core/map/loader.js';
import { searchDestinationImage } from '../../../services/api/unsplash.js';
import { apiService } from '../../../services/api/apiService.js';
import { showLoading, hideLoading, showErrorToast, showSuccessToast } from '../../../js/utils/ui-utils.js';

let modalInitialized = false;
let datePicker = null;
let autocomplete = null;

async function waitForGoogleMaps(cb) {
    if (window.google && window.google.maps && window.google.maps.places) {
        cb();
    } else {
        setTimeout(() => waitForGoogleMaps(cb), 100);
    }
}

function waitForFlatpickr() {
    return new Promise((resolve) => {
        if (window.flatpickr) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.flatpickr) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

function initAutocomplete() {
    const input = document.getElementById('trip-destination');
    if (input && window.google && window.google.maps && window.google.maps.places) {
        const autocomplete = new google.maps.places.Autocomplete(input, {
            types: ['(cities)'],
        });
        autocomplete.addListener('place_changed', function () {
            const place = autocomplete.getPlace();
            let city = '', state = '', country = '';
            if (place.address_components) {
                for (const comp of place.address_components) {
                    if (comp.types.includes('locality')) city = comp.long_name;
                    if (comp.types.includes('administrative_area_level_1')) state = comp.short_name;
                    if (comp.types.includes('country')) country = comp.long_name;
                }
            }
            input.value = [city, state, country].filter(Boolean).join(', ');
        });
    }
}

function initDatePicker() {
    const input = document.getElementById('trip-dates');
    if (!input) return;

    try {
        // Lógica simplificada: Apenas inicializa o calendário.
        // A leitura das datas será feita no momento do envio do formulário.
        datePicker = flatpickr(input, {
            mode: 'range',
            minDate: 'today',
            dateFormat: 'd/m/Y', // Formato para exibição no campo
            locale: 'pt',
            allowInput: true
        });
    } catch (error) {
        console.error('Erro ao inicializar date picker:', error);
    }
}

function closeModal() {
    const modal = document.getElementById('create-trip-modal-overlay');
    const form = document.getElementById('create-trip-form');
    const photoPreview = document.getElementById('photo-preview');

    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    if (datePicker) datePicker.clear();
    if (photoPreview) {
        photoPreview.innerHTML = '';
        photoPreview.classList.remove('active');
    }

    document.body.style.overflow = '';
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        event.target.value = '';
        return;
    }

    // Verifica o tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        event.target.value = '';
        return;
    }

    // Verifica as dimensões da imagem
    const img = new Image();
    img.onload = function () {
        const minWidth = 800;
        const minHeight = 600;

        if (img.width < minWidth || img.height < minHeight) {
            alert(`A imagem deve ter no mínimo ${minWidth}x${minHeight} pixels. Sua imagem tem ${img.width}x${img.height} pixels.`);
            event.target.value = '';
            return;
        }

        // Verifica se a imagem está em formato paisagem
        if (img.width < img.height) {
            alert('Por favor, use uma imagem em formato paisagem (horizontal).');
            event.target.value = '';
            return;
        }

        // Se passou em todas as validações, mostra o preview
        const reader = new FileReader();
        const photoPreview = document.getElementById('photo-preview');

        reader.onload = function (e) {
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview da foto">`;
            photoPreview.classList.add('active');
        };

        reader.readAsDataURL(file);
    };

    img.src = URL.createObjectURL(file);
}

async function handleDestinationPhotoSearch() {
    const destination = document.getElementById('trip-destination').value;
    if (!destination) {
        alert('Por favor, digite um destino primeiro.');
        return;
    }

    const searchButton = document.getElementById('search-destination-photo');
    const originalText = searchButton.innerHTML;
    
    searchButton.disabled = true;
    searchButton.innerHTML = '<span>Buscando...</span>';

    try {
        console.log(`Buscando imagem para: "${destination}"`);
        const imageData = await searchDestinationImage(destination);
        
        if (imageData && imageData.length > 0) {
            const photoPreview = document.getElementById('photo-preview');
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
            
            // Seleciona a primeira imagem por padrão
            document.querySelector('input[name="photo_url"]').value = imageData[0].url;

            // Adiciona evento de clique para cada miniatura
            document.querySelectorAll('.unsplash-thumb').forEach(img => {
                img.addEventListener('click', function () {
                    // Remove seleção anterior e seleciona a nova
                    document.querySelectorAll('.unsplash-thumb').forEach(i => i.style.border = '2px solid transparent');
                    this.style.border = '2px solid #004954';
                    document.querySelector('input[name="photo_url"]').value = this.dataset.url;
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
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    let startDate = '', endDate = '';

    // Lógica definitiva: Lê as datas diretamente da instância do calendário.
    // Esta é a fonte de verdade, imune a bugs visuais do campo de texto.
    if (datePicker && datePicker.selectedDates.length > 0) {
        const selectedDates = datePicker.selectedDates;

        if (selectedDates.length === 1) {
            // Caso 1: Se apenas uma data está selecionada, trata como viagem de um dia.
            startDate = selectedDates[0].toISOString();
            endDate = selectedDates[0].toISOString();
        } else {
            // Caso 2: Se um intervalo foi selecionado.
            startDate = selectedDates[0].toISOString();
            endDate = selectedDates[1].toISOString();
        }
    }
    
    const photoUrl = formData.get('photo_url') || null;

    if (!photoUrl) {
        const photoAlertModal = document.getElementById('photo-alert-modal-overlay');
        if (photoAlertModal) {
            photoAlertModal.style.display = 'flex';
        }
        return; // Impede o envio do formulário
    }

    const tripData = {
        title: formData.get('title'),
        destination: formData.get('destination'),
        description: formData.get('description'),
        startDate,
        endDate,
        photo: photoUrl
    };

    // Antes de enviar, remova description se estiver vazio
    if (tripData.description === "") {
        delete tripData.description;
    }

    try {
        showLoading('Criando viagem...');
        
        const newTrip = await apiService.createTrip(tripData);
        
        showSuccessToast('Viagem criada com sucesso!');
        // Redireciona para o dashboard do usuário
        window.location.href = '/pages/user_dashboard/user-dashboard.html';
    } catch (error) {
        console.error('Erro ao salvar viagem:', error);
        showErrorToast(`Erro ao criar viagem: ${error.message}`);
    } finally {
        hideLoading();
    }
}

function waitForInputAndGoogleMaps(cb) {
    let tries = 0;
    function check() {
        const input = document.getElementById('trip-destination');
        if (input && window.google && window.google.maps && window.google.maps.places) {
            cb();
        } else if (tries < 30) {
            tries++;
            setTimeout(check, 100);
        }
    }
    check();
}

// Adiciona evento para abrir o popup de recomendações ao clicar no label de upload
function setupPhotoRequirementsPopup() {
    const uploadLabel = document.querySelector('.photo-upload-label');
    const popup = document.getElementById('photo-requirements-popup');
    const closeBtn = popup?.querySelector('.close-popup');
    const fileInput = document.getElementById('trip-photo');
    if (uploadLabel && popup && closeBtn && fileInput) {
        uploadLabel.addEventListener('click', (e) => {
            e.preventDefault();
            popup.classList.add('active');
        });
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('active');
            // Abre o seletor de arquivo
            fileInput.click();
        });
    }
}

export async function initCreateTripModal() {
    if (!modalInitialized) {
        try {
            // Carrega CSS
            if (!document.querySelector('link[href*="CreateTripModal.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '../../components/modal/create_trip/CreateTripModal.css';
                document.head.appendChild(link);
            }

            // Carrega HTML
            if (!document.getElementById('create-trip-modal-overlay')) {
                const response = await fetch('../../components/modal/create_trip/CreateTripModal.html');
                const html = await response.text();
                document.body.insertAdjacentHTML('beforeend', html);
            }

            // Aguarda Google Maps e Flatpickr
            await loadGoogleMapsScript();
            waitForGoogleMaps(() => {
                initAutocomplete();
            });
            await waitForFlatpickr();
            initDatePicker();

            // Configura event listeners
            const modal = document.getElementById('create-trip-modal-overlay');
            const closeBtn = document.getElementById('create-trip-modal-close');
            const cancelBtn = document.getElementById('cancel-trip');
            const form = document.getElementById('create-trip-form');
            const photoInput = document.getElementById('trip-photo');
            const searchPhotoBtn = document.getElementById('search-destination-photo');

            if (closeBtn) closeBtn.onclick = closeModal;
            if (cancelBtn) cancelBtn.onclick = closeModal;
            if (modal) {
                modal.onclick = (e) => {
                    if (e.target === modal) closeModal();
                };
            }
            if (form) {
                form.onsubmit = handleFormSubmit;
            }
            if (photoInput) {
                photoInput.onchange = handlePhotoUpload;
            }
            if (searchPhotoBtn) {
                searchPhotoBtn.onclick = handleDestinationPhotoSearch;
            }

            // Fechar com ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal?.style.display === 'flex') {
                    closeModal();
                }
            });

            // Configura o modal de alerta de foto
            const photoAlertModal = document.getElementById('photo-alert-modal-overlay');
            const photoAlertCloseBtn = document.getElementById('photo-alert-close');

            if (photoAlertModal && photoAlertCloseBtn) {
                photoAlertCloseBtn.onclick = () => {
                    photoAlertModal.style.display = 'none';
                };
            }

            setupPhotoRequirementsPopup();

            modalInitialized = true;
        } catch (error) {
            console.error('Erro ao inicializar modal:', error);
        }
    } else {
        // Mesmo já inicializado, sempre reatribua o evento de submit para garantir
        const form = document.getElementById('create-trip-form');
        if (form) {
            form.onsubmit = handleFormSubmit;
        }
    }
}

export function openCreateTripModal() {
    const modal = document.getElementById('create-trip-modal-overlay');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.getElementById('trip-title')?.focus();
        waitForInputAndGoogleMaps(initAutocomplete);
    }
} 