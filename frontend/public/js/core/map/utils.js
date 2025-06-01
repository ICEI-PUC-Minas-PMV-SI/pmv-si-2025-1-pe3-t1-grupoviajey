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
  let iconUrl = '';
  let color = '#1976D2'; // azul padrão
  if (types.includes('lodging')) {
    color = '#1976D2'; // azul
  } else if (types.includes('tourist_attraction')) {
    color = '#E53935'; // vermelho
  } else if (types.includes('restaurant') || types.includes('food')) {
    color = '#43A047'; // verde
  }
  // SVG pin moderno e maior
  iconUrl = `data:image/svg+xml;utf8,<svg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'><defs><filter id='shadow' x='-2' y='0' width='52' height='60' filterUnits='userSpaceOnUse'><feDropShadow dx='0' dy='2' stdDeviation='2' flood-color='%23000' flood-opacity='0.18'/></filter></defs><g filter='url(%23shadow)'><ellipse cx='24' cy='42' rx='7' ry='3.5' fill='%23000' opacity='0.12'/><path d='M24 4C15.16 4 8 11.16 8 20c0 7.08 6.16 15.04 13.04 23.04a3.01 3.01 0 0 0 4.08 0C33.84 35.04 40 27.08 40 20c0-8.84-7.16-16-16-16z' fill='${encodeURIComponent(color)}'/><circle cx='24' cy='20' r='7' fill='white' stroke='${encodeURIComponent(color)}' stroke-width='3'/></g></svg>`;
  return {
    url: iconUrl,
    scaledSize: new google.maps.Size(48, 48),
    anchor: new google.maps.Point(24, 44),
    labelOrigin: new google.maps.Point(24, 16)
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
      <h3 class="info-window-title">${place.name}</h3>
      ${rating}
      <div class="info-window-tags">${types}</div>
      <p class="info-window-address">${place.vicinity || ''}</p>
      <div style="display:flex;justify-content:center;margin-top:8px;">
        <button class="add-to-roadmap-btn add-place-btn info-window-add-btn-compact" data-place-name="${encodeURIComponent(place.name || '')}" data-place-address="${encodeURIComponent(place.vicinity || '')}">Adicionar local</button>
      </div>
    </div>
  `;
}

export { getCacheKey, getPinIcon, clearMarkers, createInfoWindowContent }; 