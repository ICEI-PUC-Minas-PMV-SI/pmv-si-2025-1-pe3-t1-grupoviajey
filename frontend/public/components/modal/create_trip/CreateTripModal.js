import { includeSearchBar } from '../../../js/utils/include.js';
import { loadGoogleMapsScript } from '../../../js/core/map/loader.js';
import { searchDestinationImage } from '../../../js/services/unsplash.js';

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
        datePicker = flatpickr(input, {
            mode: 'range',
            minDate: 'today',
            dateFormat: 'd/m/Y',
            locale: 'pt',
            showMonths: 2,
            position: 'auto',
            onChange: function (selectedDates) {
                if (selectedDates.length === 2) {
                    const start = selectedDates[0];
                    const end = selectedDates[1];
                    input.value = `${start.getDate()}/${start.getMonth() + 1}/${start.getFullYear()} - ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
                }
            }
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
        alert('Por favor, selecione um destino primeiro.');
        return;
    }

    const searchButton = document.getElementById('search-destination-photo');
    const originalText = searchButton.innerHTML;
    searchButton.disabled = true;
    searchButton.innerHTML = '<span>Buscando...</span>';

    try {
        const imageData = await searchDestinationImage(destination);
        if (imageData) {
            const photoPreview = document.getElementById('photo-preview');
            const photoCredits = document.getElementById('photo-credits');

            photoPreview.innerHTML = `<img src="${imageData.url}" alt="Foto do destino">`;
            photoPreview.classList.add('active');

            photoCredits.innerHTML = `Foto por <a href="${imageData.photographerUrl}" target="_blank" rel="noopener">${imageData.photographer}</a> no Unsplash`;

            // Atualiza o FormData com a URL da imagem
            const form = document.getElementById('create-trip-form');
            const formData = new FormData(form);
            formData.set('photo_url', imageData.url);
            document.getElementById('photo-url-hidden').value = imageData.url;
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

    // Pega as datas do flatpickr
    const input = document.getElementById('trip-dates');
    const fp = input && input._flatpickr;
    let startDate = '', endDate = '';
    if (fp && fp.selectedDates.length === 2) {
        startDate = fp.selectedDates[0].toISOString().split('T')[0];
        endDate = fp.selectedDates[1].toISOString().split('T')[0];
    }

    // Pega a foto (pode ser upload ou URL do Unsplash)
    const photoFile = formData.get('photo');
    const photoUrl = formData.get('photo_url');
    let photoData = null;

    if (photoFile && photoFile.size > 0) {
        // Upload do usuário
        photoData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(photoFile);
        });
    } else if (photoUrl) {
        // Foto do Unsplash
        photoData = String(photoUrl); // Garante que é string
    }

    const tripData = {
        title: formData.get('title'),
        destination: formData.get('destination'),
        description: formData.get('description'),
        id: Date.now(),
        startDate,
        endDate,
        photo: photoData
    };

    try {
        const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
        trips.push(tripData);
        localStorage.setItem('userTrips', JSON.stringify(trips));

        closeModal();
        if (typeof window.renderTrips === 'function') {
            window.renderTrips();
        } else {
            window.dispatchEvent(new Event('trips-updated'));
        }
    } catch (error) {
        console.error('Erro ao salvar viagem:', error);
        alert('Erro ao salvar viagem. Tente novamente.');
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

export async function initCreateTripModal() {
    if (modalInitialized) return;

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

        modalInitialized = true;
    } catch (error) {
        console.error('Erro ao inicializar modal:', error);
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