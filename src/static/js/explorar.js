// Variáveis globais
let map;
let service;
let markers = [];
let infoWindow;
let currentDestination = '';
let placesCache = {}; // Cache para armazenar resultados da API por destino e tipo
let allPlaces = []; // Array para armazenar todos os lugares encontrados

// Tipo de lugar ativo para filtragem
let activeType = 'all';

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
    
    // Verificar se há destino na URL
    const urlParams = new URLSearchParams(window.location.search);
    const destination = urlParams.get('destination');
    
    if (destination) {
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
                    <a href="/local/${place.place_id}" class="btn btn-primary btn-sm flex-grow-1">Ver detalhes</a>
                    <button class="btn btn-outline-success btn-sm add-to-itinerary" data-place-id="${place.place_id}">
                        <i class="fas fa-plus"></i> Adicionar
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
    card.querySelector('.add-to-itinerary').addEventListener('click', () => {
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
    // Buscar detalhes completos do lugar
    service.getDetails({ placeId: place.place_id }, (details, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Converter dados para o formato esperado pelo sistema
            const placeData = {
                name: details.name,
                type: details.types[0],
                location: details.formatted_address,
                notes: `Avaliação: ${details.rating || 'N/A'}\nTelefone: ${details.formatted_phone_number || 'N/A'}\nSite: ${details.website || 'N/A'}`,
                place_id: details.place_id,
                image_url: details.photos && details.photos.length > 0 ? 
                    details.photos[0].getUrl({maxWidth: 400, maxHeight: 300}) : null
            };
            
            console.log("Added to itinerary:", details.name);
            
            // Armazenar temporariamente
            let savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
            savedPlaces.push(placeData);
            localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
            
            // Notificar usuário
            alert(`${details.name} foi adicionado ao seu itinerário!`);
        }
    });
}