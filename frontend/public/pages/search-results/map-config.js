/**
 * Map configuration specific to search results page
 */
import { initMap } from '../../js/core/map/init.js';
import { getCacheKey } from '../../js/core/map/utils.js';
import { createMarkers, updateMarkerAnimation } from '../../js/core/map/markers.js';
import { loadApiKey, loadGoogleMapsScript } from '../../js/core/map/loader.js';
import { renderResults } from './results.js';

const RADIUS = 2000;
let map, markers = [];
let lastCenter = null;
let lastZoom = 14;
let selectedType = 'lodging';
let allResults = [];
let moved = false;

/**
 * Checks if a place matches the selected type
 * @param {Object} place - The place to check
 * @param {string} type - The selected type
 * @returns {boolean} Whether the place matches the type
 */
function isTypeMatch(place, type) {
  if (!place.types || !place.types.length) return false;

  if (type === 'lodging') {
    return place.types.includes('lodging') &&
           !place.types.includes('restaurant') &&
           !place.types.includes('tourist_attraction');
  }
  if (type === 'restaurant') {
    return place.types.includes('restaurant') &&
           !place.types.includes('lodging') &&
           !place.types.includes('tourist_attraction');
  }
  if (type === 'tourist_attraction') {
    return place.types.includes('tourist_attraction') &&
           !place.types.includes('lodging') &&
           !place.types.includes('restaurant');
  }
  return false;
}

/**
 * Searches for places near the given center using Nearby Search
 * @param {Object} center - The center coordinates
 */
async function searchNearby(center) {
  return new Promise((resolve, reject) => {
    const grid = document.querySelector('.results-grid');
    if (!grid) {
      reject(new Error('Elemento .results-grid não encontrado'));
      return;
    }
    
    grid.innerHTML = 'Carregando...';
    
    const cacheKey = getCacheKey(center, RADIUS, selectedType);
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      console.log('Usando resultados do cache');
      const cacheObj = JSON.parse(cached);
      renderResults(cacheObj.results);
      markers = createMarkers(map, cacheObj.results);
      resolve();
      return;
    }

    // Configuração da busca Nearby
    const request = {
      location: center,
      radius: RADIUS,
      type: selectedType
    };

    console.log('Buscando lugares:', request);
    
    // Usa o serviço Nearby Search diretamente
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log('Resultados encontrados:', results.length);
        
        const cacheObj = {
          results,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheObj));
        
        renderResults(results);
        markers = createMarkers(map, results);
        resolve();
      } else {
        console.error('Erro na busca:', status);
        grid.innerHTML = 'Nenhum resultado encontrado.';
        reject(new Error(status));
      }
    });
  });
}

/**
 * Initializes the map with the given city
 * @param {string} city - The city to center the map on
 */
async function initializeMapWithCity(city) {
  if (!city) {
    console.log('Cidade não definida');
    return;
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

    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`);
    const geo = await response.json();
    console.log('Dados de geocodificação:', geo);

    if (geo.results && geo.results[0]) {
      const location = geo.results[0].geometry.location;
      lastCenter = location;
      
      console.log('Inicializando mapa...');
      map = initMap('map', location, lastZoom);
      if (!map) {
        throw new Error('Falha ao inicializar mapa');
      }
      window.map = map;
      
      console.log('Buscando lugares próximos...');
      await searchNearby(location);
      setupMapEvents();
      console.log('Mapa inicializado com sucesso');
    } else {
      throw new Error('Nenhum resultado de geocodificação encontrado');
    }
  } catch (error) {
    console.error('Erro ao inicializar mapa:', error);
  }
}

/**
 * Sets up map event listeners
 */
function setupMapEvents() {
  const btn = document.getElementById('search-area-btn');
  
  const checkMapFullscreen = () => {
    const mapContainer = document.querySelector('.results-map');
    const isFullscreen = window.innerWidth <= 1100;
    btn.style.display = isFullscreen ? 'block' : (moved ? 'block' : 'none');
  };

  checkMapFullscreen();
  window.addEventListener('resize', checkMapFullscreen);

  map.addListener('idle', () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    if (!lastCenter || 
        center.lat() !== lastCenter.lat ||
        center.lng() !== lastCenter.lng ||
        zoom !== lastZoom) {
      moved = true;
      checkMapFullscreen();
    }
  });

  btn.addEventListener('click', () => {
    const center = map.getCenter();
    lastCenter = { lat: center.lat(), lng: center.lng() };
    lastZoom = map.getZoom();
    moved = false;
    checkMapFullscreen();
    searchNearby(center);
  });

  map.addListener('dragstart', () => { 
    moved = true;
    checkMapFullscreen();
  });
  
  map.addListener('zoom_changed', () => { 
    moved = true;
    checkMapFullscreen();
  });

  // Close InfoWindow when clicking outside
  google.maps.event.addListener(map, 'click', () => {
    if (window.currentInfoWindow) {
      window.currentInfoWindow.close();
      window.currentInfoWindow = null;
    }
  });
}

export function setSelectedType(type) { selectedType = type; }
export { selectedType };

export { 
  searchNearby, 
  initializeMapWithCity, 
  isTypeMatch,
  allResults,
  markers
}; 