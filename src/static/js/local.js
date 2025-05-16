// Variáveis globais
let map;
let service;
let placeDetails = null;
let marker;

// Inicialização do mapa
function initMap() {
    // Inicializar o mapa com uma localização padrão (Brasil)
    const defaultLocation = { lat: -14.235, lng: -51.9253 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 15,
        mapId: 'viajey_place_map',
        styles: [
            // Estilo escuro para compatibilidade com o tema
            { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
            { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
            { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
            { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
            { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
            { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
            { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
            { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
            { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
            { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
            { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
            { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
            { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
            { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
            { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
            { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
        ]
    });
    
    // Inicializar serviço de Places
    service = new google.maps.places.PlacesService(map);
    
    // Obter place_id da URL
    const placeId = getPlaceIdFromUrl();
    if (placeId) {
        loadPlaceDetails(placeId);
    } else {
        document.getElementById('loading-container').innerHTML = 
            '<div class="alert alert-danger">Não foi possível encontrar o ID do local.</div>';
    }
    
    // Configurar evento para o botão de adicionar ao itinerário
    document.getElementById('add-to-itinerary-btn').addEventListener('click', addToItinerary);
}

// Obter ID do local da URL
function getPlaceIdFromUrl() {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    // Formato esperado da URL: /local/{place_id}
    if (pathParts.length >= 3 && pathParts[1] === 'local') {
        return pathParts[2];
    }
    return null;
}

// Carregar detalhes do local
function loadPlaceDetails(placeId) {
    // Configurar requisição para buscar detalhes completos
    const request = {
        placeId: placeId,
        fields: [
            'name', 'rating', 'formatted_phone_number', 'formatted_address',
            'geometry', 'icon', 'photos', 'place_id', 'types', 'url',
            'vicinity', 'website', 'opening_hours', 'reviews',
            'price_level', 'user_ratings_total', 'international_phone_number'
        ]
    };
    
    // Realizar a busca
    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Armazenar detalhes
            placeDetails = place;
            
            // Atualizar interface
            updatePageWithPlaceDetails(place);
            
            // Centralizar mapa
            if (place.geometry && place.geometry.location) {
                map.setCenter(place.geometry.location);
                // Adicionar marcador
                marker = new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: place.name,
                    animation: google.maps.Animation.DROP
                });
            }
        } else {
            document.getElementById('loading-container').innerHTML = 
                `<div class="alert alert-danger">Erro ao carregar detalhes do local: ${status}</div>`;
        }
    });
}

// Atualizar página com os detalhes do local
function updatePageWithPlaceDetails(place) {
    // Esconder loading e mostrar detalhes
    document.getElementById('loading-container').style.display = 'none';
    document.getElementById('place-details').style.display = 'block';
    
    // Informações básicas
    document.getElementById('place-name').textContent = place.name;
    document.title = `${place.name} - Viajey`;
    
    // Tipo de local
    const placeTypeInfo = getPlaceTypeInfo(place.types);
    document.getElementById('place-type-badge').textContent = placeTypeInfo.label;
    document.getElementById('place-type-badge').className = `badge ${placeTypeInfo.class} me-2`;
    
    // Avaliação
    if (place.rating) {
        document.getElementById('rating-value').textContent = place.rating.toFixed(1);
        document.getElementById('place-rating').style.display = 'inline-flex';
    } else {
        document.getElementById('place-rating').style.display = 'none';
    }
    
    // Endereço
    document.getElementById('place-address').textContent = place.formatted_address || place.vicinity || 'Não disponível';
    
    // Telefone
    document.getElementById('place-phone').innerHTML = place.formatted_phone_number ? 
        `<a href="tel:${place.formatted_phone_number}">${place.formatted_phone_number}</a>` : 
        'Não disponível';
    
    // Website
    if (place.website) {
        const domain = new URL(place.website).hostname;
        document.getElementById('place-website').innerHTML = `<a href="${place.website}" target="_blank">${domain}</a>`;
    } else {
        document.getElementById('place-website').textContent = 'Não disponível';
    }
    
    // Link para Google Maps
    document.getElementById('google-maps-link').href = place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
    
    // Horário de funcionamento
    updateOpeningHours(place.opening_hours);
    
    // Fotos
    updatePlacePhotos(place.photos);
    
    // Avaliações
    updatePlaceReviews(place.reviews);
}

// Obter informações de tipo para o local
function getPlaceTypeInfo(types) {
    // Verificar tipos prioritários
    if (!types || types.length === 0) {
        return {
            label: 'Local',
            class: 'bg-secondary'
        };
    }
    
    // Mapear tipos para categorias reconhecíveis
    const typeMapping = {
        'lodging': { label: 'Hotel', class: 'bg-primary' },
        'hotel': { label: 'Hotel', class: 'bg-primary' },
        'restaurant': { label: 'Restaurante', class: 'bg-warning text-dark' },
        'food': { label: 'Restaurante', class: 'bg-warning text-dark' },
        'cafe': { label: 'Café', class: 'bg-warning text-dark' },
        'tourist_attraction': { label: 'Atração Turística', class: 'bg-success' },
        'museum': { label: 'Museu', class: 'bg-success' },
        'park': { label: 'Parque', class: 'bg-success' },
        'amusement_park': { label: 'Parque de Diversões', class: 'bg-success' },
        'beach': { label: 'Praia', class: 'bg-info' },
        'bar': { label: 'Bar', class: 'bg-danger' },
        'night_club': { label: 'Boate', class: 'bg-danger' },
        'shopping_mall': { label: 'Shopping', class: 'bg-info text-dark' },
        'store': { label: 'Loja', class: 'bg-info text-dark' },
        'airport': { label: 'Aeroporto', class: 'bg-dark' },
        'train_station': { label: 'Estação de Trem', class: 'bg-dark' },
        'bus_station': { label: 'Estação de Ônibus', class: 'bg-dark' }
    };
    
    // Procurar pelo primeiro tipo reconhecido
    for (const type of types) {
        if (typeMapping[type]) {
            return typeMapping[type];
        }
    }
    
    // Se não encontrar nenhum tipo reconhecido, usar o primeiro tipo formatado
    const firstType = types[0].replace('_', ' ');
    return {
        label: firstType.charAt(0).toUpperCase() + firstType.slice(1),
        class: 'bg-secondary'
    };
}

// Atualizar horário de funcionamento
function updateOpeningHours(openingHours) {
    const hoursContainer = document.getElementById('place-hours');
    hoursContainer.innerHTML = '';
    
    if (!openingHours || !openingHours.weekday_text || openingHours.weekday_text.length === 0) {
        hoursContainer.innerHTML = '<li>Horário não disponível</li>';
        return;
    }
    
    // Status de aberto/fechado
    if (openingHours.isOpen) {
        const isOpenNow = openingHours.isOpen();
        if (isOpenNow !== undefined) {
            const statusItem = document.createElement('li');
            statusItem.className = isOpenNow ? 'text-success' : 'text-danger';
            statusItem.innerHTML = `<strong>${isOpenNow ? 'Aberto agora' : 'Fechado agora'}</strong>`;
            hoursContainer.appendChild(statusItem);
        }
    }
    
    // Dias da semana
    openingHours.weekday_text.forEach(dayHours => {
        const hourItem = document.createElement('li');
        hourItem.textContent = dayHours;
        hoursContainer.appendChild(hourItem);
    });
}

// Atualizar carrossel de fotos
function updatePlacePhotos(photos) {
    const carouselInner = document.getElementById('carousel-inner');
    carouselInner.innerHTML = '';
    
    if (!photos || photos.length === 0) {
        // Nenhuma foto disponível, mostrar placeholder
        const placeholderItem = document.createElement('div');
        placeholderItem.className = 'carousel-item active';
        placeholderItem.innerHTML = `
            <div class="d-flex justify-content-center align-items-center bg-body-tertiary" style="height: 400px;">
                <div class="text-center">
                    <i class="fas fa-image fa-3x mb-3 text-secondary"></i>
                    <p>Nenhuma foto disponível</p>
                </div>
            </div>
        `;
        carouselInner.appendChild(placeholderItem);
        return;
    }
    
    // Adicionar fotos ao carrossel
    photos.forEach((photo, index) => {
        const photoUrl = photo.getUrl({ maxWidth: 800, maxHeight: 600 });
        const item = document.createElement('div');
        item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        item.innerHTML = `<img src="${photoUrl}" class="d-block w-100" alt="${placeDetails.name} - Foto ${index + 1}">`;
        carouselInner.appendChild(item);
    });
}

// Atualizar avaliações
function updatePlaceReviews(reviews) {
    const reviewsContainer = document.getElementById('place-reviews');
    reviewsContainer.innerHTML = '';
    
    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = 
            '<div class="text-center py-4"><p class="text-secondary">Nenhuma avaliação disponível.</p></div>';
        return;
    }
    
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'card mb-3';
        
        // Formatar data
        const reviewDate = new Date(review.time * 1000);
        const formattedDate = reviewDate.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Gerar estrelas
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= review.rating) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        reviewElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex align-items-center mb-2">
                    <img src="${review.profile_photo_url}" alt="${review.author_name}" class="review-avatar me-3">
                    <div>
                        <h6 class="mb-0">${review.author_name}</h6>
                        <small class="text-body-secondary">${formattedDate}</small>
                    </div>
                </div>
                <div class="rating-stars mb-2">${starsHtml}</div>
                <p class="card-text">${review.text}</p>
            </div>
        `;
        
        reviewsContainer.appendChild(reviewElement);
    });
}

// Função para mostrar modal de seleção de dia
function showDaySelectionModal(days, placeData) {
    // Verificar se já existe um modal e removê-lo
    const existingModal = document.getElementById('daySelectionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Criar modal para seleção de dia
    const modalHtml = `
        <div class="modal fade" id="daySelectionModal" tabindex="-1" aria-labelledby="daySelectionModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="daySelectionModalLabel">Selecionar dia para ${placeData.name}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Em qual dia você deseja adicionar esta atividade?</p>
                        <div class="list-group day-selection-list">
                            ${days.map(day => `
                                <button type="button" class="list-group-item list-group-item-action day-option" data-day-id="${day.id}" data-day-number="${day.day_number}">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Dia ${day.day_number}</strong>
                                            <div class="small text-body-secondary">${formatDate(day.date)}</div>
                                        </div>
                                        <span class="badge bg-primary rounded-pill">${getActivityCount(day)}</span>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                        <div class="form-group mt-3">
                            <label for="activityPeriod" class="form-label">Período</label>
                            <select class="form-select" id="activityPeriod">
                                <option value="manhã">Manhã</option>
                                <option value="tarde">Tarde</option>
                                <option value="noite">Noite</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirmAddActivity" disabled>Adicionar Atividade</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Inicializar modal
    const modal = new bootstrap.Modal(document.getElementById('daySelectionModal'));
    modal.show();
    
    // Configurar eventos
    let selectedDayId = null;
    const dayOptions = document.querySelectorAll('.day-option');
    const confirmButton = document.getElementById('confirmAddActivity');
    
    dayOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remover seleção anterior
            dayOptions.forEach(opt => opt.classList.remove('active'));
            
            // Adicionar seleção atual
            this.classList.add('active');
            
            // Salvar ID do dia selecionado
            selectedDayId = this.getAttribute('data-day-id');
            
            // Habilitar botão de confirmação
            confirmButton.disabled = false;
        });
    });
    
    // Configurar evento de confirmação
    confirmButton.addEventListener('click', function() {
        // Obter período selecionado
        const period = document.getElementById('activityPeriod').value;
        
        // Fechar modal
        modal.hide();
        
        // Mostrar loading no botão que abriu o modal
        const addButton = document.getElementById('add-to-itinerary-btn');
        if (addButton) {
            addButton.disabled = true;
            addButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adicionando...';
        }
        
        // Atualizar dados da atividade com o dia e período selecionados
        const updatedPlaceData = {
            ...placeData,
            itinerary_day_id: parseInt(selectedDayId),
            period: period
        };
        
        // Salvar atividade
        fetch('/api/activities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedPlaceData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao salvar atividade');
            }
            return response.json();
        })
        .then(savedActivity => {
            console.log("Added to itinerary:", placeData.name);
            
            // Armazenar cache local para uso futuro (opcional)
            let savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
            savedPlaces.push(savedActivity);
            localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
            
            // Atualizar o botão
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = '<i class="fas fa-check"></i> Adicionado';
                addButton.classList.remove('btn-success');
                addButton.classList.add('btn-outline-success');
            }
            
            // Notificar usuário com um toast
            const toastContainer = document.getElementById('toast-container') || (() => {
                const container = document.createElement('div');
                container.id = 'toast-container';
                container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                document.body.appendChild(container);
                return container;
            })();
            
            const selectedDay = document.querySelector(`.day-option[data-day-id="${selectedDayId}"]`);
            const dayNumber = selectedDay ? selectedDay.getAttribute('data-day-number') : '';
            
            const toastElement = document.createElement('div');
            toastElement.className = 'toast';
            toastElement.setAttribute('role', 'alert');
            toastElement.setAttribute('aria-live', 'assertive');
            toastElement.setAttribute('aria-atomic', 'true');
            
            toastElement.innerHTML = `
                <div class="toast-header">
                    <strong class="me-auto">Viajey</strong>
                    <small>Agora</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    ${placeData.name} foi adicionado ao Dia ${dayNumber} (${period}) do seu roteiro!
                </div>
            `;
            
            toastContainer.appendChild(toastElement);
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            
            // Remover toast após ser fechado
            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        })
        .catch(error => {
            console.error('Erro ao adicionar lugar ao roteiro:', error);
            
            // Restaurar botão
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = '<i class="fas fa-plus"></i> Adicionar ao Roteiro';
            }
            
            // Mostrar erro
            alert('Erro ao adicionar lugar ao roteiro. Por favor, tente novamente.');
        });
    });
}

// Função auxiliar para formatar datas
function formatDate(dateStr) {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateStr).toLocaleDateString('pt-BR', options);
}

// Função auxiliar para obter o número de atividades por dia (mockup)
function getActivityCount(day) {
    // Na implementação real, você buscaria essa informação do banco de dados
    // Por enquanto, vamos retornar um valor aleatório entre 0 e 5
    return Math.floor(Math.random() * 5);
}

// Adicionar ao itinerário
function addToItinerary() {
    if (!placeDetails) {
        alert('Erro: detalhes do local não encontrados.');
        return;
    }
    
    // Obter o ID do roteiro a partir da URL ou de localStorage
    const urlParams = new URLSearchParams(window.location.search);
    let roteiroId = urlParams.get('roteiroId');
    
    // Se não temos o ID na URL, verificar se temos em localStorage
    if (!roteiroId) {
        const currentItinerary = JSON.parse(localStorage.getItem('currentItinerary') || '{}');
        roteiroId = currentItinerary.id;
    }
    
    if (!roteiroId) {
        // Se ainda não temos ID, perguntar se deseja criar um novo roteiro
        if (confirm('Você ainda não selecionou um roteiro. Deseja criar um agora?')) {
            window.location.href = '/';
            return;
        } else {
            return;
        }
    }
    
    // Mostrar indicador de carregamento no botão
    const addButton = document.getElementById('add-to-itinerary-btn');
    if (addButton) {
        addButton.disabled = true;
        addButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Carregando...';
    }
    
    // Converter o local atual para o formato que nossa API espera
    const placeData = {
        itinerary_id: parseInt(roteiroId),
        name: placeDetails.name,
        type: placeDetails.types && placeDetails.types.length > 0 ? placeDetails.types[0] : 'poi',
        location: placeDetails.formatted_address || placeDetails.vicinity || '',
        period: 'manhã', // Período padrão, será ajustável na visualização Kanban
        notes: `Avaliação: ${placeDetails.rating || 'N/A'}\nTelefone: ${placeDetails.formatted_phone_number || 'N/A'}\nSite: ${placeDetails.website || 'N/A'}`,
        place_id: placeDetails.place_id,
        photo_url: placeDetails.photos && placeDetails.photos.length > 0 ? 
            placeDetails.photos[0].getUrl({maxWidth: 400, maxHeight: 300}) : null,
        position: 0 // Será ajustado no modo Kanban
    };
    
    // Buscar todos os dias do roteiro
    fetch(`/api/itinerary-days?itinerary_id=${roteiroId}`)
        .then(response => response.json())
        .then(days => {
            // Restaurar estado do botão enquanto o modal é exibido
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = '<i class="fas fa-plus"></i> Adicionar ao Roteiro';
            }
            
            // Se não existem dias, criar os dias com base nas datas do roteiro
            if (!days || days.length === 0) {
                // Buscar detalhes do roteiro para saber o número de dias
                return fetch(`/api/itineraries/${roteiroId}`)
                    .then(response => response.json())
                    .then(roteiro => {
                        const startDate = new Date(roteiro.start_date);
                        const endDate = new Date(roteiro.end_date);
                        
                        // Calcular número de dias do roteiro
                        const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                        
                        // Criar os dias do roteiro
                        const createDayPromises = [];
                        for (let i = 0; i < dayCount; i++) {
                            const currentDate = new Date(startDate);
                            currentDate.setDate(startDate.getDate() + i);
                            
                            createDayPromises.push(
                                fetch('/api/itinerary-days', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        itinerary_id: parseInt(roteiroId),
                                        day_number: i + 1,
                                        date: currentDate.toISOString().split('T')[0]
                                    })
                                }).then(response => response.json())
                            );
                        }
                        
                        return Promise.all(createDayPromises);
                    })
                    .then(createdDays => {
                        // Agora temos os dias criados, abrir modal de seleção
                        showDaySelectionModal(createdDays, placeData);
                        return createdDays; // Não é necessário retornar, mas mantém a consistência
                    });
            } else {
                // Já temos dias, abrir modal de seleção
                showDaySelectionModal(days, placeData);
                return days; // Não é necessário retornar, mas mantém a consistência
            }
        })
        .catch(error => {
            console.error('Erro ao processar dias do roteiro:', error);
            
            // Restaurar botão
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = '<i class="fas fa-plus"></i> Adicionar ao Roteiro';
            }
            
            // Mostrar erro
            alert('Erro ao processar dias do roteiro. Por favor, tente novamente.');
        });
}