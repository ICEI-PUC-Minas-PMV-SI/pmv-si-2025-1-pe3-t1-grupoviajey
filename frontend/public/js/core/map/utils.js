/**
 * Utility functions for map operations
 */

/**
 * Generates a cache key based on center coordinates, radius and type
 * @param {Object} center - The center coordinates
 * @param {number} radius - The search radius
 * @param {string} type - The place type
 * @returns {string} The cache key
 */
function getCacheKey(center, radius, type) {
  const lat = center.lat.toFixed ? center.lat.toFixed(4) : center.lat().toFixed(4);
  const lng = center.lng.toFixed ? center.lng.toFixed(4) : center.lng().toFixed(4);
  return `places_${lat},${lng}_${radius}_${type}`;
}

/**
 * Gets the appropriate pin icon based on place type
 * @param {Object} place - The place object
 * @returns {Object} The icon configuration
 */
function getPinIcon(place) {
  const types = place.types || [];
  let iconUrl = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  
  if (types.includes('lodging')) {
    iconUrl = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  } else if (types.includes('restaurant') || types.includes('food')) {
    iconUrl = 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
  } else if (types.includes('tourist_attraction')) {
    iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  }
  
  return {
    url: iconUrl,
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 32),
    labelOrigin: new google.maps.Point(16, 0)
  };
}

/**
 * Clears all markers from the map
 * @param {Array} markers - Array of markers to clear
 */
function clearMarkers(markers) {
  markers.forEach(m => m.setMap(null));
  return [];
}

/**
 * Creates the content for an InfoWindow
 * @param {Object} place - The place object
 * @returns {string} HTML content for the InfoWindow
 */
function createInfoWindowContent(place) {
  const rating = place.rating ? `
    <div class="info-window-rating">
      <span class="rating-stars">${'★'.repeat(Math.floor(place.rating))}${'☆'.repeat(5-Math.floor(place.rating))}</span>
      <span class="rating-value">${place.rating.toFixed(1)}</span>
    </div>
  ` : '';

  const types = place.types ? place.types.slice(0, 2).map(type => 
    `<span class="info-window-tag">${type.replace(/_/g, ' ')}</span>`
  ).join('') : '';

  return `
    <div class="info-window">
      <button class="info-window-close" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">×</button>
      <h3 class="info-window-title">${place.name}</h3>
      ${rating}
      <div class="info-window-tags">${types}</div>
      <p class="info-window-address">${place.vicinity || ''}</p>
    </div>
  `;
}

export { getCacheKey, getPinIcon, clearMarkers, createInfoWindowContent }; 