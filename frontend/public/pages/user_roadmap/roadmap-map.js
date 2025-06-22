/**
 * Map configuration specific to user roadmap page
 */
import { initMap } from '../../js/core/map/init.js';
import { createMarkers as createMarkersFromUtil, updateMarkerAnimation } from '../../js/core/map/markers.js';
import { loadApiKey, loadGoogleMapsScript } from '../../js/core/map/loader.js';

let map;
let markers = [];
let autocomplete;
let lastSelectedPlace = null;

/**
 * Gets the last selected place from the autocomplete
 * @returns {Object|null} The last selected place or null if none
 */
export function getLastSelectedPlace() {
  return lastSelectedPlace;
}

/**
 * Clears the last selected place from the autocomplete
 */
export function clearLastSelectedPlace() {
  lastSelectedPlace = null;
  const input = document.getElementById('autocomplete');
  if (input) {
    input.value = '';
  }
}

/**
 * Initializes Google Maps Places Autocomplete restrito à cidade
 * @param {string} city - Nome da cidade para restringir
 * @param {string} inputSelector - Seletor do input para autocomplete
 * @returns {Promise<Object>} O objeto autocomplete
 */
export function initializeGoogleMapsAutocomplete(map, inputId = '#autocomplete') {
  const input = document.querySelector(inputId);
  if (!input) {
    console.error(`Input element with selector "${inputId}" not found.`);
    return;
  }

  const autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ["place_id", "name", "formatted_address", "geometry", "rating", "types"],
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      lastSelectedPlace = {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        rating: place.rating || null,
        photo: null,
        types: place.types || [],
      };
    } else {
      console.error("Local selecionado não possui geometria ou detalhes completos.");
      lastSelectedPlace = null;
    }
  });

  // Limpa o local selecionado se o usuário apagar o texto
  input.addEventListener('input', () => {
    if (input.value === '') {
      lastSelectedPlace = null;
    }
  });
}

/**
 * Initializes the map with the destination city
 * @param {string} destination - The destination city name
 * @returns {Promise<Object>} The initialized map object
 */
export async function initRoadmapMap(destination) {
  if (!destination) {
    console.log('Destino não definido');
    return null;
  }

  try {
    console.log('Iniciando carregamento do mapa...');

    // Primeiro carrega o script do Google Maps
    await loadGoogleMapsScript();
    console.log('Script do Google Maps carregado');

    const apiKey = await loadApiKey();
    if (!apiKey) {
      throw new Error('API key não disponível');
    }
    console.log('API key obtida com sucesso');

    // Geocodifica o destino para obter as coordenadas
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`);
    const geo = await response.json();
    console.log('Dados de geocodificação:', geo);

    if (geo.results && geo.results[0]) {
      const location = geo.results[0].geometry.location;

      console.log('Inicializando mapa...');
      map = initMap('map', location, 12);
      if (!map) {
        throw new Error('Falha ao inicializar mapa');
      }
      window.map = map;

      setupMapEvents();
      console.log('Mapa inicializado com sucesso');
      return map;
    } else {
      throw new Error('Nenhum resultado de geocodificação encontrado');
    }
  } catch (error) {
    console.error('Erro ao inicializar mapa:', error);
    return null;
  }
}

/**
 * Updates the map with new places
 * @param {Array} places - Array of places to be displayed on the map
 */
export function updateMap(places) {
  if (!map) {
    console.error('Mapa não inicializado');
    return;
  }

  console.log('Atualizando mapa com places:', places);

  // Remove marcadores existentes
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  // Se não houver places, apenas limpa o mapa
  if (!places || places.length === 0) {
    console.log('Nenhum place para exibir, mapa limpo');
    return;
  }

  // A abordagem correta e simples:
  // Padroniza a propriedade de geolocalização que a função `createMarker` espera.
  const placesForMarkers = places.map(place => {
    // Se o local já tem `geometry`, ele veio da API do Google e está pronto.
    if (place.geometry && place.geometry.location) {
      return place;
    }

    // Se não, ele veio do nosso banco. Nós criamos a propriedade `geometry`.
    if (place.latitude && place.longitude) {
      return {
        ...place,
        // Garante que o ID do google_place seja passado corretamente
        place_id: place.placeId,
        geometry: {
          location: new google.maps.LatLng(place.latitude, place.longitude)
        }
      };
    }
    
    // Se não tiver coordenadas, não pode ser exibido no mapa.
    console.warn('Local sem coordenadas válidas, será ignorado:', place);
    return null;

  }).filter(Boolean); // Remove os locais nulos

  console.log('Places formatados para markers:', placesForMarkers);

  if (placesForMarkers.length === 0) {
    console.error('Nenhum place válido para criar markers');
    return;
  }

  // Cria novos marcadores usando a função importada corretamente
  markers = createMarkersFromUtil(map, placesForMarkers);

  console.log('Markers criados:', markers);

  // Garante que cada marker tem _localKey igual ao key do respectivo place
  markers.forEach((marker, i) => {
    if (placesForMarkers[i] && placesForMarkers[i].key) {
      marker._localKey = placesForMarkers[i].key;
      console.log('Marker configurado com key:', marker._localKey);
    }
  });

  // Salva markers globalmente para hover
  window.roadmapMarkers = markers;
  window.updateMarkerAnimation = updateMarkerAnimation;
}

/**
 * Sets up map event listeners
 */
function setupMapEvents() {
  // Close InfoWindow when clicking outside
  google.maps.event.addListener(map, 'click', () => {
    if (window.currentInfoWindow) {
      window.currentInfoWindow.close();
      window.currentInfoWindow = null;
    }
  });
}

/**
 * Configura os eventos de hover para os cards de local
 * @param {HTMLElement} card - O card do local
 */
export function setupCardHoverEvents(card) {
  card.addEventListener('mouseenter', () => {
    if (window.roadmapMarkers && window.updateMarkerAnimation) {
      const marker = window.roadmapMarkers.find(m => m._localKey === card.dataset.key);
      if (marker) {
        window.updateMarkerAnimation(marker, true);
        // Move o mapa para o marcador
        if (window.map) {
          const position = marker.getPosition();
          window.map.panTo(position);
          window.map.setZoom(15);
        }
      }
    }
  });

  card.addEventListener('mouseleave', () => {
    if (window.roadmapMarkers && window.updateMarkerAnimation) {
      const marker = window.roadmapMarkers.find(m => m._localKey === card.dataset.key);
      if (marker) {
        window.updateMarkerAnimation(marker, false);
        // Retorna o mapa para a visão geral
        if (window.map) {
          const bounds = new google.maps.LatLngBounds();
          window.roadmapMarkers.forEach(m => bounds.extend(m.getPosition()));
          window.map.fitBounds(bounds);
        }
      }
    }
  });
}

export function clearMap() {
  if (!map) return;

  // Remove todos os marcadores
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  // Limpa a referência global
  window.roadmapMarkers = [];

  console.log('Mapa limpo com sucesso');
}
