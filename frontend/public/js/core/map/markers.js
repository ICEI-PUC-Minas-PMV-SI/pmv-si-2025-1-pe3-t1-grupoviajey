/**
 * Marker management module for Google Maps
 */
import { getPinIcon, createInfoWindowContent } from './utils.js';

let currentInfoWindow = null;

/**
 * Creates a marker for a place
 * @param {Object} map - The Google Maps instance
 * @param {Object} place - The place object
 * @returns {Object} The created marker
 */
function createMarker(map, place) {
  if (!place.geometry || !place.geometry.location) return null;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    title: place.name,
    icon: getPinIcon(place)
  });

  // Flag para saber se foi adicionado ao roteiro
  marker.addedToRoadmap = false;

  // Add InfoWindow to marker
  const infoWindow = new google.maps.InfoWindow({
    content: createInfoWindowContent(place),
    pixelOffset: new google.maps.Size(0, -32)
  });

  // Listener para fechar o InfoWindow: remove marker se não foi adicionado
  infoWindow.addListener('closeclick', () => {
    if (!marker.addedToRoadmap) {
      marker.setMap(null);
    }
  });

  marker.addListener('click', () => {
    // Close any open InfoWindow
    if (currentInfoWindow) {
      currentInfoWindow.close();
    }
    infoWindow.open(map, marker);
    currentInfoWindow = infoWindow;
    // Adiciona listener ao botão do InfoWindow
    setTimeout(() => {
      const btn = document.querySelector('.add-to-roadmap-btn');
      if (btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const name = decodeURIComponent(btn.getAttribute('data-place-name'));
          const address = decodeURIComponent(btn.getAttribute('data-place-address'));
          marker.addedToRoadmap = true; // Marca como adicionado
          window.dispatchEvent(new CustomEvent('addPlaceToRoadmap', { detail: { name, address } }));
          infoWindow.close(); // Fecha o InfoWindow após adicionar
        });
      }
      // Botão de fechar InfoWindow
      const closeBtn = document.querySelector('.info-window-close');
      if (closeBtn) {
        closeBtn.onclick = function(e) {
          e.stopPropagation();
          infoWindow.close();
        };
      }
    }, 200);
  });

  // Fechar InfoWindow ao clicar fora
  map.addListener('click', function(event) {
    // Se o InfoWindow está aberto e o clique não foi em um marker
    if (currentInfoWindow === infoWindow && event.placeId === undefined) {
      infoWindow.close();
    }
  });

  return marker;
}

/**
 * Creates markers for multiple places
 * @param {Object} map - The Google Maps instance
 * @param {Array} places - Array of place objects
 * @returns {Array} Array of created markers
 */
function createMarkers(map, places) {
  return places
    .map(place => createMarker(map, place))
    .filter(marker => marker !== null);
}

/**
 * Updates marker animations based on hover state
 * @param {Object} marker - The marker to update
 * @param {boolean} isHovered - Whether the marker is being hovered
 */
function updateMarkerAnimation(marker, isHovered) {
  if (marker) {
    marker.setAnimation(isHovered ? google.maps.Animation.BOUNCE : null);
    marker.setZIndex(isHovered ? 1000 : 1);
  }
}

export { createMarker, createMarkers, updateMarkerAnimation, currentInfoWindow }; 