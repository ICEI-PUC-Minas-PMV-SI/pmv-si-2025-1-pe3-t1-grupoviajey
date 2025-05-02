// Variáveis globais
let map;
let service;
let markers = [];
let infoWindow;
let currentDestination = '';
let placesCache = {}; // Cache para armazenar resultados da API por destino e tipo
let allPlaces = []; // Array para armazenar todos os lugares encontrados

// Tipo de lugar ativo para filtragem (começa com atrações turísticas)
let activeType = 'tourist_attraction';

// Inicialização do mapa
function initMap() {
    // Inicializar o mapa com uma localização padrão (Brasil)
    const defaultLocation = { lat: -14.235, lng: -51.9253 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 5,
        mapId: 'viajey_map',
        styles: [
            // Estilo personalizado para o mapa (tema escuro compatível com o tema do site)
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
    
    // Inicializar InfoWindow para marcadores
    infoWindow = new google.maps.InfoWindow();
    
    // Verificar se há parâmetros na URL
    const urlParams = new URLSearchParams(window.location.search);
    const destination = urlParams.get('destination');
    const roteiroId = urlParams.get('roteiroId');
    
    if (roteiroId) {
        // Buscar dados do roteiro a partir do ID
        fetch(`/api/itineraries/${roteiroId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar roteiro');
                }
                return response.json();
            })
            .then(roteiro => {
                // Atualizar interface com dados do roteiro
                document.getElementById('search-destination').value = roteiro.destination;
                currentDestination = roteiro.destination;
                
                // Mostrar destino do roteiro com preferências
                const preferencesText = roteiro.preferences ? 
                    JSON.parse(roteiro.preferences).join(', ') : '';
                
                document.getElementById('destination-title').textContent = 
                    `Explorando ${roteiro.destination}`;
                
                // Adicionar chips com as preferências se existirem
                if (preferencesText) {
                    const prefsContainer = document.createElement('div');
                    prefsContainer.className = 'preference-chips mt-2';
                    
                    JSON.parse(roteiro.preferences).forEach(pref => {
                        const chip = document.createElement('span');
                        chip.className = 'badge rounded-pill bg-secondary me-1';
                        chip.textContent = pref;
                        prefsContainer.appendChild(chip);
                    });
                    
                    // Inserir após o título
                    const titleElement = document.getElementById('destination-title');
                    titleElement.parentNode.insertBefore(prefsContainer, titleElement.nextSibling);
                }
                
                // Buscar lugares para o destino
                searchPlacesByDestination(roteiro.destination);
            })
            .catch(error => {
                console.error('Erro ao carregar roteiro:', error);
                document.getElementById('loading-places').innerHTML = 
                    '<div class="alert alert-danger">Erro ao carregar dados do roteiro. Por favor, tente novamente.</div>';
            });
    } else if (destination) {
        // Atualizar interface e buscar lugares
        document.getElementById('search-destination').value = destination;
        currentDestination = destination;
        document.getElementById('destination-title').textContent = `Explorando ${destination}`;
        searchPlacesByDestination(destination);
    } else {
        // Esconder o loading se não houver destino
        document.getElementById('loading-places').innerHTML = 
            '<div class="alert alert-info">Digite um destino para começar a explorar.</div>';
    }
    
    // Configurar listeners para eventos
    setupEventListeners();
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Botão de pesquisa
    document.getElementById('search-btn').addEventListener('click', () => {
        const destination = document.getElementById('search-destination').value.trim();
        if (destination) {
            currentDestination = destination;
            document.getElementById('destination-title').textContent = `Explorando ${destination}`;
            // Atualizar URL para refletir o destino pesquisado
            history.pushState(null, '', `/explorar?destination=${encodeURIComponent(destination)}`);
            searchPlacesByDestination(destination);
        }
    });
    
    // Pesquisa ao pressionar Enter
    document.getElementById('search-destination').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('search-btn').click();
        }
    });
    
    // Alternar entre visualizações de mapa e lista
    document.getElementById('show-map-btn').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('show-list-btn').classList.remove('active');
        document.getElementById('map-container').classList.add('col-12');
        document.getElementById('map-container').classList.remove('col-lg-5');
        document.getElementById('list-view').classList.add('d-none');
        
        // Redimensionar o mapa para ajustar ao novo tamanho
        google.maps.event.trigger(map, 'resize');
    });
    
    document.getElementById('show-list-btn').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('show-map-btn').classList.remove('active');
        document.getElementById('map-container').classList.remove('col-12');
        document.getElementById('map-container').classList.add('col-lg-5');
        document.getElementById('list-view').classList.remove('d-none');
        
        // Redimensionar o mapa para ajustar ao novo tamanho
        google.maps.event.trigger(map, 'resize');
    });
    
    // Configurar filtros por tipo
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Adicionar classe active ao botão clicado
            this.classList.add('active');
            
            // Aplicar filtro
            activeType = this.getAttribute('data-filter');
            filterPlaces();
        });
    });
}

// Buscar lugares pelo destino
function searchPlacesByDestination(destination) {
    // Mostrar loading
    document.getElementById('loading-places').style.display = 'block';
    document.getElementById('places-container').innerHTML = '';
    
    // Limpar marcadores existentes
    clearMarkers();
    
    // Verificar se temos o destino em cache
    if (placesCache[destination] && placesCache[destination].geocode) {
        // Usar localização em cache
        searchNearbyPlaces(placesCache[destination].geocode);
        return;
    }
    
    // Geocodificar o destino
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: destination }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
            const location = results[0].geometry.location;
            
            // Salvar em cache
            if (!placesCache[destination]) {
                placesCache[destination] = {};
            }
            placesCache[destination].geocode = {
                lat: location.lat(),
                lng: location.lng(),
                viewport: results[0].geometry.viewport
            };
            
            // Centralizar mapa
            map.setCenter(location);
            map.fitBounds(results[0].geometry.viewport);
            
            // Buscar lugares próximos
            searchNearbyPlaces(placesCache[destination].geocode);
        } else {
            // Erro na geocodificação
            document.getElementById('loading-places').innerHTML = 
                `<div class="alert alert-danger">Não foi possível encontrar o destino: ${destination}</div>`;
            console.error('Geocode error:', status);
        }
    });
}

// Buscar lugares próximos ao local geocodificado
function searchNearbyPlaces(location) {
    // Tipos de lugares a buscar
    const placeTypes = ['lodging', 'restaurant', 'tourist_attraction'];
    let completedRequests = 0;
    
    // Criar cache para o destino se não existir
    if (!placesCache[currentDestination]) {
        placesCache[currentDestination] = {};
    }
    
    // Limpar array de todos os lugares
    allPlaces = [];
    
    // Buscar cada tipo de lugar
    placeTypes.forEach(type => {
        // Verificar se já temos em cache
        if (placesCache[currentDestination][type]) {
            processResults(placesCache[currentDestination][type], type);
            completedRequests++;
            
            // Verificar se todas as requisições foram processadas
            if (completedRequests === placeTypes.length) {
                finishPlacesLoading();
            }
            return;
        }
        
        // Buscar lugares pelo tipo
        const request = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: '5000', // 5km
            type: type
        };
        
        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Salvar resultados em cache
                placesCache[currentDestination][type] = results;
                processResults(results, type);
            } else {
                console.error(`Error finding ${type} places:`, status);
            }
            
            completedRequests++;
            
            // Verificar se todas as requisições foram processadas
            if (completedRequests === placeTypes.length) {
                finishPlacesLoading();
            }
        });
    });
}

// Processar resultados da busca
function processResults(results, type) {
    // Adicionar tipo aos resultados para facilitar filtragem
    results.forEach(place => {
        place.placeType = type;
        allPlaces.push(place);
    });
}

// Finalizar processo de carga de lugares
function finishPlacesLoading() {
    document.getElementById('loading-places').style.display = 'none';
    
    // Ordenar lugares por rating (do maior para o menor)
    allPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    // Aplicar filtro atual
    filterPlaces();
}

// Filtrar lugares por tipo
function filterPlaces() {
    // Limpar contêiner de lugares
    document.getElementById('places-container').innerHTML = '';
    
    // Limpar marcadores
    clearMarkers();
    
    // Filtrar lugares pelo tipo ativo
    const filteredPlaces = activeType === 'all' ? 
        allPlaces : 
        allPlaces.filter(place => place.placeType === activeType);
    
    if (filteredPlaces.length === 0) {
        document.getElementById('places-container').innerHTML = 
            `<div class="col-12"><div class="alert alert-info">Nenhum lugar encontrado para este filtro.</div></div>`;
        return;
    }
    
    // Renderizar lugares e adicionar marcadores
    filteredPlaces.forEach(place => {
        renderPlaceCard(place);
        addMarker(place);
    });
}

// Limpar todos os marcadores do mapa
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Adicionar marcador ao mapa
function addMarker(place) {
    if (!place.geometry || !place.geometry.location) return;
    
    // Obter ícone baseado no tipo
    const icon = getPlaceIcon(place.placeType);
    
    // Criar marcador
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name,
        icon: icon,
        animation: google.maps.Animation.DROP
    });
    
    markers.push(marker);
    
    // Configurar clique do marcador
    marker.addListener('click', () => {
        // Obter detalhes completos do lugar
        service.getDetails({ placeId: place.place_id }, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                showInfoWindow(details, marker);
            }
        });
    });
}

// Obter ícone para o tipo de lugar
function getPlaceIcon(type) {
    const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';
    
    switch (type) {
        case 'lodging':
            return {
                url: iconBase + 'blue-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            };
        case 'restaurant':
            return {
                url: iconBase + 'orange-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            };
        case 'tourist_attraction':
            return {
                url: iconBase + 'green-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            };
        default:
            return {
                url: iconBase + 'red-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            };
    }
}

// Exibir InfoWindow com detalhes do lugar
function showInfoWindow(place, marker) {
    const content = `
        <div class="info-window">
            <h5>${place.name}</h5>
            ${place.photos ? `<img src="${place.photos[0].getUrl({maxWidth: 200, maxHeight: 150})}" alt="${place.name}" style="width:100%;max-width:200px;margin-bottom:8px;">` : ''}
            <p>${place.vicinity || place.formatted_address || ''}</p>
            ${place.rating ? `<p>⭐ ${place.rating.toFixed(1)} (${place.user_ratings_total} avaliações)</p>` : ''}
            <div class="mt-2">
                <a href="/local/${place.place_id}" class="btn btn-sm btn-primary">Ver detalhes</a>
                <a href="https://www.google.com/maps/place/?q=place_id:${place.place_id}" target="_blank" class="btn btn-sm btn-outline-secondary">Ver no Google Maps</a>
            </div>
        </div>
    `;
    
    infoWindow.setContent(content);
    infoWindow.open(map, marker);
}

// Renderizar card para um lugar
function renderPlaceCard(place) {
    const placeContainer = document.getElementById('places-container');
    const photoUrl = place.photos && place.photos.length > 0 ?
        place.photos[0].getUrl({maxWidth: 300, maxHeight: 200}) :
        '/static/img/no-image.jpg';
    
    const placeTypeLabel = getPlaceTypeLabel(place.placeType);
    const placeTypeClass = getPlaceTypeClass(place.placeType);
    
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-6 mb-4';
    card.innerHTML = `
        <div class="card h-100" data-place-id="${place.place_id}">
            <img src="${photoUrl}" class="card-img-top" alt="${place.name}" style="height: 180px; object-fit: cover;">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">${place.name}</h5>
                    <span class="badge ${placeTypeClass}">${placeTypeLabel}</span>
                </div>
                <p class="card-text small text-truncate">${place.vicinity || ''}</p>
                <div class="d-flex justify-content-between align-items-center">
                    ${place.rating ? 
                        `<div class="rating">
                            <span class="text-warning">⭐</span> 
                            <span>${place.rating.toFixed(1)}</span>
                            <small class="text-body-secondary">(${place.user_ratings_total})</small>
                        </div>` : 
                        '<div class="rating text-body-secondary">Sem avaliações</div>'
                    }
                </div>
            </div>
            <div class="card-footer bg-transparent border-top-0">
                <div class="d-flex gap-2 justify-content-between">
                    <a href="/local/${place.place_id}" class="btn btn-primary btn-sm">Ver detalhes</a>
                    <button class="btn btn-outline-primary btn-sm add-to-itinerary-btn" data-place-id="${place.place_id}">
                        <i class="fas fa-plus-circle"></i> Adicionar ao roteiro
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar evento de mouseover/out no card para destacar o marcador correspondente
    card.addEventListener('mouseover', () => {
        const marker = markers.find(m => m.getTitle() === place.name);
        if (marker) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(() => marker.setAnimation(null), 1500);
        }
    });
    
    // Adicionar evento para adicionar ao itinerário
    card.querySelector('.add-to-itinerary-btn').addEventListener('click', () => {
        addPlaceToItinerary(place);
    });
    
    // Adicionar card ao contêiner
    placeContainer.appendChild(card);
}

// Obter label para tipo de lugar
function getPlaceTypeLabel(type) {
    switch (type) {
        case 'lodging':
            return 'Hotel';
        case 'restaurant':
            return 'Restaurante';
        case 'tourist_attraction':
            return 'Atração';
        default:
            return 'Lugar';
    }
}

// Obter classe CSS para o tipo de lugar
function getPlaceTypeClass(type) {
    switch (type) {
        case 'lodging':
            return 'bg-primary';
        case 'restaurant':
            return 'bg-warning text-dark';
        case 'tourist_attraction':
            return 'bg-success';
        default:
            return 'bg-secondary';
    }
}

// Adicionar lugar ao itinerário atual
function addPlaceToItinerary(place) {
    // Obter o ID do roteiro a partir da URL
    const urlParams = new URLSearchParams(window.location.search);
    const roteiroId = urlParams.get('roteiroId');
    
    if (!roteiroId) {
        alert('É necessário criar um roteiro antes de adicionar lugares.');
        return;
    }
    
    // Mostrar indicador de carregamento no botão
    const addButton = document.querySelector(`[data-place-id="${place.place_id}"] .add-to-itinerary-btn`);
    if (addButton) {
        addButton.disabled = true;
        addButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Carregando...';
    }
    
    // Buscar detalhes completos do lugar
    service.getDetails({ placeId: place.place_id }, (details, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Converter dados para o formato esperado pelo sistema
            const placeData = {
                itinerary_id: parseInt(roteiroId),
                name: details.name,
                type: place.placeType || details.types[0],
                location: details.formatted_address || details.vicinity || '',
                period: 'manhã', // Período padrão, será ajustável na visualização Kanban
                notes: `Avaliação: ${details.rating || 'N/A'}\nTelefone: ${details.formatted_phone_number || 'N/A'}\nSite: ${details.website || 'N/A'}`,
                place_id: details.place_id,
                photo_url: details.photos && details.photos.length > 0 ? 
                    details.photos[0].getUrl({maxWidth: 400, maxHeight: 300}) : null,
                position: 0 // Será ajustado no modo Kanban
            };
            
            // Buscar todos os dias do roteiro
            fetch(`/api/itinerary-days?itinerary_id=${roteiroId}`)
                .then(response => response.json())
                .then(days => {
                    // Restaurar estado do botão enquanto o modal é exibido
                    if (addButton) {
                        addButton.disabled = false;
                        addButton.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar ao roteiro';
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
                                showDaySelectionModal(createdDays, placeData, details);
                                return createdDays; // Não é necessário retornar, mas mantém a consistência
                            });
                    } else {
                        // Já temos dias, abrir modal de seleção
                        showDaySelectionModal(days, placeData, details);
                        return days; // Não é necessário retornar, mas mantém a consistência
                    }
                })
                .catch(error => {
                    console.error('Erro ao processar dias do roteiro:', error);
                    
                    // Restaurar botão
                    if (addButton) {
                        addButton.disabled = false;
                        addButton.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar ao roteiro';
                    }
                    
                    // Mostrar erro
                    alert('Erro ao processar dias do roteiro. Por favor, tente novamente.');
                });
        }
    });
}

// Função para mostrar modal de seleção de dia
function showDaySelectionModal(days, placeData, details) {
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
                        <h5 class="modal-title" id="daySelectionModalLabel">Selecionar dia para ${details.name}</h5>
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
        const addButton = document.querySelector(`[data-place-id="${placeData.place_id}"] .add-to-itinerary-btn`);
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
            console.log("Added to itinerary:", details.name);
            
            // Armazenar cache local para uso futuro (opcional)
            let savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
            savedPlaces.push(savedActivity);
            localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
            
            // Atualizar o botão
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = '<i class="fas fa-check"></i> Adicionado';
                addButton.classList.remove('btn-outline-primary');
                addButton.classList.add('btn-success');
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
                    ${details.name} foi adicionado ao Dia ${dayNumber} (${period}) do seu roteiro!
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
                addButton.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar ao roteiro';
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
}