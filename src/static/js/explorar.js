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
    const name = urlParams.get('name');
    const startDate = urlParams.get('startDate');
    const endDate = urlParams.get('endDate');
    
    // Armazenar os dados do roteiro para uso posterior
    let roteiroDados = null;
    
    if (name && destination && startDate && endDate) {
        // Se temos todos os parâmetros para um novo roteiro
        roteiroDados = {
            title: name,
            destination: destination,
            startDate: startDate,
            endDate: endDate
        };
        
        // Armazenar no localStorage para uso posterior na página kanban
        localStorage.setItem('currentItinerary', JSON.stringify(roteiroDados));
        
        // Atualizar interface
        document.getElementById('search-destination').value = destination;
        currentDestination = destination;
        document.getElementById('destination-title').textContent = `Explorando ${destination}`;
        
        // Atualizar botão de planejamento para mostrar que estamos criando um novo roteiro
        const goToPlanningBtn = document.getElementById('go-to-planning-btn');
        if (goToPlanningBtn) {
            goToPlanningBtn.innerHTML = '<i class="fas fa-map-marked-alt me-1"></i> Continuar Planejamento';
            goToPlanningBtn.classList.add('btn-success');
        }
        
        // Buscar lugares para o destino
        searchPlacesByDestination(destination);
    }
    else if (roteiroId) {
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
                
                // Mostrar destino do roteiro com opções/preferências
                // Usar options (novo nome do campo) ou preferences (compatibilidade) se options não existir
                const optionsField = roteiro.options || roteiro.preferences || null;
                const preferencesText = optionsField ? 
                    (typeof optionsField === 'string' ? JSON.parse(optionsField).join(', ') : optionsField.join(', ')) : '';
                
                document.getElementById('destination-title').textContent = 
                    `Explorando ${roteiro.destination}`;
                
                // Adicionar chips com as preferências se existirem
                if (preferencesText) {
                    const prefsContainer = document.createElement('div');
                    prefsContainer.className = 'preference-chips mt-2';
                    
                    // Usar options se disponível, caso contrário usar preferences para compatibilidade
                    const prefsArray = typeof optionsField === 'string' ? JSON.parse(optionsField) : optionsField;
                    
                    if (prefsArray && Array.isArray(prefsArray)) {
                        prefsArray.forEach(pref => {
                            const chip = document.createElement('span');
                            chip.className = 'badge rounded-pill bg-secondary me-1';
                            chip.textContent = pref;
                            prefsContainer.appendChild(chip);
                        });
                    }
                    
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
    
    // Nota: A implementação do botão "Ir para Planejamento" 
    // está no código específico adicionado no final do arquivo
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
    // Obter os parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const roteiroId = urlParams.get('roteiroId');
    const name = urlParams.get('name');
    const destination = urlParams.get('destination');
    const startDate = urlParams.get('startDate');
    const endDate = urlParams.get('endDate');
    
    // Verificar se temos um roteiro existente OU parâmetros para um novo roteiro
    if (!roteiroId && !(name && destination && startDate && endDate)) {
        // Verificar se temos dados no localStorage
        const storedItinerary = JSON.parse(localStorage.getItem('currentItinerary') || '{}');
        
        if (!storedItinerary.title && !storedItinerary.destination) {
            alert('É necessário criar um roteiro antes de adicionar lugares.');
            return;
        }
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
            // Verificar se temos um roteiro com ID ou se estamos usando parâmetros da URL
            const urlParams = new URLSearchParams(window.location.search);
            const name = urlParams.get('name');
            const destination = urlParams.get('destination');
            const startDateParam = urlParams.get('startDate');
            const endDateParam = urlParams.get('endDate');
            
            // Converter dados para o formato esperado pelo sistema
            const placeData = {
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
            
            // Se temos um ID de roteiro existente, adicioná-lo aos dados
            if (roteiroId) {
                placeData.itinerary_id = parseInt(roteiroId);
            }
            
            // Restaurar estado do botão enquanto o modal é exibido
            if (addButton) {
                addButton.disabled = false;
                addButton.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar ao roteiro';
            }
            
            // Se é um roteiro existente, buscar os dias existentes
            if (roteiroId) {
                // Buscar todos os dias do roteiro
                fetch(`/api/itinerary-days?itinerary_id=${roteiroId}`)
                    .then(response => response.json())
                    .then(days => {
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
            } else if (name && destination && startDateParam && endDateParam) {
                // Temos um novo roteiro com dados da URL
                // Criar dias temporários para mostrar no modal
                const startDate = new Date(startDateParam);
                const endDate = new Date(endDateParam);
                
                // Calcular número de dias do roteiro
                const dayCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                
                // Criar dias temporários (sem persistir no banco ainda)
                const tempDays = [];
                for (let i = 0; i < dayCount; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(startDate.getDate() + i);
                    
                    tempDays.push({
                        id: 'temp-day-' + (i+1),
                        day_number: i + 1,
                        date: currentDate.toISOString().split('T')[0],
                        activities: []
                    });
                }
                
                // Salvar no localStorage para uso posterior
                localStorage.setItem('tempDays', JSON.stringify(tempDays));
                
                // Mostrar modal de seleção com os dias temporários
                showDaySelectionModal(tempDays, placeData, details);
            } else {
                // Verificar se temos dias temporários no localStorage
                const storedDays = JSON.parse(localStorage.getItem('tempDays') || '[]');
                if (storedDays.length > 0) {
                    showDaySelectionModal(storedDays, placeData, details);
                } else {
                    alert('É necessário criar um roteiro antes de adicionar lugares.');
                    
                    // Restaurar botão
                    if (addButton) {
                        addButton.disabled = false;
                        addButton.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar ao roteiro';
                    }
                }
            }
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
            period: period
        };
        
        // Verificar se é um dia temporário ou um dia real no banco
        const isTempDay = selectedDayId.toString().startsWith('temp-day');
        
        if (isTempDay) {
            // Armazenar a atividade no localStorage para uso posterior
            const tempActivityId = 'temp-activity-' + Date.now();
            const tempActivity = {
                ...updatedPlaceData,
                id: tempActivityId,
                day_id: selectedDayId,
                day_number: parseInt(selectedDayId.split('-')[2]),
                created_at: new Date().toISOString()
            };
            
            // Adicionar à lista de atividades temporárias
            let tempActivities = JSON.parse(localStorage.getItem('tempActivities') || '[]');
            tempActivities.push(tempActivity);
            localStorage.setItem('tempActivities', JSON.stringify(tempActivities));
            
            // Simular resposta de sucesso para manter a consistência da interface
            setTimeout(() => {
                handleActivitySuccess(tempActivity, details, period, selectedDayId, addButton);
            }, 500);
            
            return; // Não fazer chamada para API
        }
        
        // Se não for temporário, adicionar o ID do dia
        updatedPlaceData.itinerary_day_id = parseInt(selectedDayId);
        
        // Salvar atividade no banco via API
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
            handleActivitySuccess(savedActivity, details, period, selectedDayId, addButton);
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

// Configurar o botão "Ir para Planejamento"
document.addEventListener('DOMContentLoaded', function() {
    const goToPlanningBtn = document.getElementById('go-to-planning-btn');
    if (goToPlanningBtn) {
        goToPlanningBtn.addEventListener('click', function() {
            // Verificar se temos um ID de roteiro na URL
            const urlParams = new URLSearchParams(window.location.search);
            const roteiroId = urlParams.get('roteiro');
            
            if (roteiroId) {
                // Temos um roteiro existente, redirecionar para o kanban com este ID
                window.location.href = `/itinerary-kanban?id=${roteiroId}`;
            } else {
                // Verificar se temos dias temporários
                const tempDays = JSON.parse(localStorage.getItem('tempDays') || '[]');
                const tempActivities = JSON.parse(localStorage.getItem('tempActivities') || '[]');
                
                if (tempDays.length > 0) {
                    // Modal para confirmar criação do roteiro
                    const destination = urlParams.get('destination') || 'Seu destino';
                    const startDate = urlParams.get('start_date') || '';
                    const endDate = urlParams.get('end_date') || '';
                    const name = urlParams.get('name') || `Viagem para ${destination}`;
                    
                    // Se temos infos do roteiro, perguntar se deseja salvar
                    if (destination && startDate && endDate) {
                        showSaveItineraryModal(name, destination, startDate, endDate, tempDays, tempActivities);
                    } else {
                        alert('Por favor, crie um roteiro primeiro através da página inicial.');
                        window.location.href = '/';
                    }
                } else {
                    // Sem dias temporários, voltar para página inicial
                    alert('Você ainda não tem um roteiro em andamento. Crie um na página inicial.');
                    window.location.href = '/';
                }
            }
        });
    }
});

// Função para mostrar modal de salvamento do roteiro
function showSaveItineraryModal(name, destination, startDate, endDate, tempDays, tempActivities) {
    // Verificar se já existe um modal e removê-lo
    const existingModal = document.getElementById('saveItineraryModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Criar modal para confirmação
    const modalHtml = `
        <div class="modal fade" id="saveItineraryModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Salvar Roteiro de Viagem</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Você adicionou ${tempActivities.length} lugares ao seu roteiro para ${destination}.</p>
                        <p>Deseja salvar este roteiro no banco de dados para poder visualizá-lo no planejador?</p>
                        
                        <div class="form-group mb-3">
                            <label for="itineraryName" class="form-label">Nome do Roteiro</label>
                            <input type="text" class="form-control" id="itineraryName" value="${name}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirmSaveItinerary">Salvar Roteiro</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar modal ao body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Inicializar modal
    const modal = new bootstrap.Modal(document.getElementById('saveItineraryModal'));
    modal.show();
    
    // Configurar evento de confirmação
    const confirmButton = document.getElementById('confirmSaveItinerary');
    confirmButton.addEventListener('click', function() {
        // Obter nome atualizado
        const itineraryName = document.getElementById('itineraryName').value;
        
        // Mostrar loading no botão
        confirmButton.disabled = true;
        confirmButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Salvando...';
        
        // Criar o roteiro no banco de dados
        fetch('/api/itineraries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: itineraryName,
                destination: destination,
                start_date: startDate,
                end_date: endDate,
                description: `Roteiro para ${destination} de ${startDate} a ${endDate}`
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao criar roteiro');
            }
            return response.json();
        })
        .then(itinerary => {
            // Agora criar os dias do roteiro
            const promises = [];
            
            // Para cada dia temporário, criar um dia real
            tempDays.forEach(tempDay => {
                promises.push(
                    fetch('/api/itinerary-days', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            itinerary_id: itinerary.id,
                            day_number: tempDay.day_number,
                            date: tempDay.date
                        })
                    }).then(response => response.json())
                );
            });
            
            // Esperar criação de todos os dias
            return Promise.all(promises).then(createdDays => {
                // Criar mapeamento de dias temporários para dias reais
                const dayMapping = {};
                tempDays.forEach((tempDay, index) => {
                    dayMapping[tempDay.id] = createdDays[index].id;
                });
                
                return { itinerary, dayMapping };
            });
        })
        .then(({ itinerary, dayMapping }) => {
            // Agora salvar as atividades
            const activityPromises = [];
            
            // Para cada atividade temporária, criar uma atividade real
            tempActivities.forEach(tempActivity => {
                const realDayId = dayMapping[tempActivity.day_id];
                if (realDayId) {
                    const activityData = {
                        ...tempActivity,
                        itinerary_day_id: realDayId
                    };
                    delete activityData.id; // Remover ID temporário
                    delete activityData.day_id; // Remover referência temporária
                    
                    activityPromises.push(
                        fetch('/api/activities', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(activityData)
                        }).then(response => response.json())
                    );
                }
            });
            
            // Esperar criação de todas as atividades
            return Promise.all(activityPromises).then(activities => {
                return { itinerary, activities };
            });
        })
        .then(({ itinerary }) => {
            // Limpar dados temporários
            localStorage.removeItem('tempDays');
            localStorage.removeItem('tempActivities');
            
            // Fechar modal
            modal.hide();
            
            // Mostrar toast de sucesso
            const toastContainer = document.getElementById('toast-container') || (() => {
                const container = document.createElement('div');
                container.id = 'toast-container';
                container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
                document.body.appendChild(container);
                return container;
            })();
            
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
                    Roteiro salvo com sucesso! Redirecionando para o planejador...
                </div>
            `;
            
            toastContainer.appendChild(toastElement);
            const toast = new bootstrap.Toast(toastElement);
            toast.show();
            
            // Redirecionar após um breve atraso
            setTimeout(() => {
                window.location.href = `/itinerary-kanban?id=${itinerary.id}`;
            }, 1500);
        })
        .catch(error => {
            console.error('Erro ao salvar roteiro:', error);
            
            // Restaurar botão
            confirmButton.disabled = false;
            confirmButton.innerHTML = 'Salvar Roteiro';
            
            // Mostrar erro
            alert('Erro ao salvar roteiro. Por favor, tente novamente.');
        });
    });
}

// Função auxiliar para processar o sucesso ao adicionar uma atividade
function handleActivitySuccess(activity, details, period, selectedDayId, addButton) {
    console.log("Added to itinerary:", details.name);
    
    // Armazenar cache local para uso futuro (opcional)
    let savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
    savedPlaces.push(activity);
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
}