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

  // Add InfoWindow to marker
  const infoWindow = new google.maps.InfoWindow({
    content: createInfoWindowContent(place),
    pixelOffset: new google.maps.Size(0, -32)
  });

  marker.addListener('click', () => {
    // Close any open InfoWindow
    if (currentInfoWindow) {
      currentInfoWindow.close();
    }
    infoWindow.open(map, marker);
    currentInfoWindow = infoWindow;
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