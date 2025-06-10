/**
 * Map configuration specific to user roadmap page
 */
import { initMap } from '../../js/core/map/init.js';
import { createMarkers, updateMarkerAnimation } from '../../js/core/map/markers.js';
import { loadApiKey, loadGoogleMapsScript } from '../../js/core/map/loader.js';

let map;
let markers = [];
let autocomplete;
let lastSelectedPlace = null;

/**
 * Gets the last selected place from the autocomplete
 * @returns {Object|null} The last selected place or null if none
 */
function getLastSelectedPlace() {
  return lastSelectedPlace;
}

/**
 * Clears the last selected place from the autocomplete
 */
function clearLastSelectedPlace() {
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
async function initializeGoogleMapsAutocomplete(city, inputSelector) {
  try {
    await loadGoogleMapsScript();

    const input = document.querySelector(inputSelector);
    if (!input) {
      // Não lança erro aqui, apenas retorna null para evitar log desnecessário
      return null;
    }

    let options = {
      types: ['establishment', 'geocode'],
      fields: ['name', 'geometry', 'formatted_address', 'place_id']
    };

    if (city) {
      // Geocodifica a cidade para obter lat/lng
      const apiKey = await loadApiKey();
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`);
      const geo = await response.json();
      if (geo.results && geo.results[0]) {
        const location = geo.results[0].geometry.location;
        const center = new google.maps.LatLng(location.lat, location.lng);
        // Cria bounds de ~10km ao redor do centro da cidade
        const circle = new google.maps.Circle({ center, radius: 10000 });
        options.bounds = circle.getBounds();
        options.strictBounds = true;
      }
    }

    autocomplete = new google.maps.places.Autocomplete(input, options);

    // Previne o envio do formulário ao pressionar enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });

    // Armazena o último lugar selecionado
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        lastSelectedPlace = place;
      }
    });

    return autocomplete;
  } catch (error) {
    console.error('Erro ao inicializar autocomplete:', error);
    return null;
  }
}

/**
 * Initializes the map with the destination city
 * @param {string} destination - The destination city name
 * @returns {Promise<Object>} The initialized map object
 */
async function initRoadmapMap(destination) {
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
function updateMap(places) {
  if (!map) {
    console.error('Mapa não inicializado');
    return;
  }

  console.log('Atualizando mapa com places:', places);

  // Remove marcadores existentes
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  // Adapta os dados para o formato esperado por createMarkers
  const placesForMarkers = places.map(place => {
    console.log('Processando place:', place);
    const lat = Number(place.lat);
    const lng = Number(place.lng);
    console.log('Coordenadas convertidas:', { lat, lng });

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Coordenadas inválidas para place:', place);
      return null;
    }

    return {
      ...place,
      key: place.key || place.name || place.address || (lat + ',' + lng),
      geometry: { location: new google.maps.LatLng(lat, lng) }
    };
  }).filter(Boolean);

  console.log('Places formatados para markers:', placesForMarkers);

  if (placesForMarkers.length === 0) {
    console.error('Nenhum place válido para criar markers');
    return;
  }

  // Cria novos marcadores usando createMarkers
  markers = createMarkers(map, placesForMarkers);

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

  // Ajusta o zoom para mostrar todos os marcadores
  const bounds = new google.maps.LatLngBounds();
  markers.forEach(marker => bounds.extend(marker.getPosition()));
  map.fitBounds(bounds);
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

export {
  initRoadmapMap,
  updateMap,
  initializeGoogleMapsAutocomplete,
  clearLastSelectedPlace,
  getLastSelectedPlace
};
