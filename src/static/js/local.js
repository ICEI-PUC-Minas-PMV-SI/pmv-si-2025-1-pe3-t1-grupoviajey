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

// Adicionar ao itinerário
function addToItinerary() {
    if (!placeDetails) {
        alert('Erro: Detalhes do local não disponíveis.');
        return;
    }
    
    // Preparar dados do local para salvar
    const placeData = {
        name: placeDetails.name,
        type: placeDetails.types && placeDetails.types.length > 0 ? placeDetails.types[0] : 'place',
        location: placeDetails.formatted_address || placeDetails.vicinity || '',
        notes: `Avaliação: ${placeDetails.rating || 'N/A'}\nTelefone: ${placeDetails.formatted_phone_number || 'N/A'}\nSite: ${placeDetails.website || 'N/A'}`,
        place_id: placeDetails.place_id,
        image_url: placeDetails.photos && placeDetails.photos.length > 0 ? 
            placeDetails.photos[0].getUrl({maxWidth: 400, maxHeight: 300}) : null
    };
    
    console.log("Added to itinerary:", placeDetails.name);
    
    // Armazenar temporariamente (em produção isso seria feito via API para o backend)
    let savedPlaces = JSON.parse(localStorage.getItem('savedPlaces') || '[]');
    savedPlaces.push(placeData);
    localStorage.setItem('savedPlaces', JSON.stringify(savedPlaces));
    
    // Mostrar feedback ao usuário
    document.getElementById('add-to-itinerary-btn').innerHTML = '<i class="fas fa-check"></i> Adicionado';
    document.getElementById('add-to-itinerary-btn').classList.remove('btn-success');
    document.getElementById('add-to-itinerary-btn').classList.add('btn-outline-success');
    document.getElementById('add-to-itinerary-btn').disabled = true;
    
    // Mostrar alerta
    alert(`${placeDetails.name} foi adicionado ao seu itinerário!`);
}