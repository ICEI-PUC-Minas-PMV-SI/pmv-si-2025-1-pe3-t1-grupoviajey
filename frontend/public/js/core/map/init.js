/**
 * Map initialization module
 */

/**
 * Initializes a new Google Maps instance
 * @param {string} elementId - The ID of the element to render the map
 * @param {Object} center - The center coordinates
 * @param {number} zoom - The initial zoom level
 * @returns {Object} The initialized map instance
 */
function initMap(elementId, center, zoom = 14) {
  const mapElement = document.getElementById(elementId);
  if (!mapElement) {
    console.error(`Element with ID ${elementId} not found`);
    return null;
  }

  const map = new google.maps.Map(mapElement, {
    center,
    zoom,
    gestureHandling: 'cooperative'
  });

  return map;
}

/**
 * Initializes the Places service
 * @param {Object} map - The Google Maps instance
 * @returns {Object} The Places service instance
 */
function initPlacesService(map) {
  return new google.maps.places.PlacesService(map);
}

export { initMap, initPlacesService }; 