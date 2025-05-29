/**
 * Filters management module for search results
 */
import { renderResults } from './results.js';
import { setSelectedType, selectedType, allResults, searchNearby } from './map-config.js';

// DOM Elements
let filtersBtn, filtersModal, closeFiltersBtn, clearFiltersBtn, applyFiltersBtn;
let hotelFilters, restaurantFilters, attractionFilters;

/**
 * Initializes the filters module
 */
function initializeFilters() {
  console.log('Inicializando filtros...');
  
  // Get DOM elements
  filtersBtn = document.getElementById('filters-btn');
  filtersModal = document.getElementById('filters-modal');
  closeFiltersBtn = filtersModal.querySelector('.filters-modal-close');
  clearFiltersBtn = filtersModal.querySelector('.clear-filters-btn');
  applyFiltersBtn = filtersModal.querySelector('.apply-filters-btn');
  hotelFilters = filtersModal.querySelector('.hotel-filters');
  restaurantFilters = filtersModal.querySelector('.restaurant-filters');
  attractionFilters = filtersModal.querySelector('.attraction-filters');

  // Add event listeners
  filtersBtn.onclick = openFiltersModal;
  closeFiltersBtn.onclick = closeFiltersModal;
  clearFiltersBtn.onclick = clearFilters;
  applyFiltersBtn.onclick = applyFilters;

  filtersModal.onclick = (e) => {
    if (e.target === filtersModal) {
      closeFiltersModal();
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filtersModal.style.display === 'flex') {
      closeFiltersModal();
    }
  });

  // Add type filter buttons
  document.querySelectorAll('.filters-left .filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filters-left .filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Atualiza o tipo selecionado
      if (this.textContent.includes('Hotel')) {
        setSelectedType('lodging');
      } else if (this.textContent.includes('Restaurantes')) {
        setSelectedType('restaurant');
      } else if (this.textContent.includes('Atra')) {
        setSelectedType('tourist_attraction');
      }
      
      // Atualiza os filtros visíveis
      updateFilterSections(this.textContent.toLowerCase());
      
      // Busca novos resultados com o tipo selecionado
      if (window.map && window.map.getCenter) {
        searchNearby(window.map.getCenter());
      }
    });
  });

  console.log('Filtros inicializados com sucesso');
}

/**
 * Shows feedback message for number of results
 * @param {number} count - Number of results
 */
function showResultsFeedback(count) {
  const feedback = document.createElement('div');
  feedback.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:10px 20px;border-radius:4px;z-index:1000;';
  feedback.textContent = `${count} resultados encontrados`;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 2000);
}

/**
 * Applies selected filters to results
 */
function applyFilters() {
  const selectedPrices = Array.from(filtersModal.querySelectorAll('input[name="price"]:checked'))
    .map(cb => parseInt(cb.value));
  const selectedRatings = Array.from(filtersModal.querySelectorAll('input[name="rating"]:checked'))
    .map(cb => parseInt(cb.value));
  const selectedAmenities = Array.from(filtersModal.querySelectorAll('input[name="amenity"]:checked'))
    .map(cb => cb.value);
  const selectedCuisines = Array.from(filtersModal.querySelectorAll('input[name="cuisine"]:checked'))
    .map(cb => cb.value);
  const selectedAttractionTypes = Array.from(filtersModal.querySelectorAll('input[name="attraction_type"]:checked'))
    .map(cb => cb.value);

  const filteredResults = allResults.filter(place => {
    // Price filter
    if (selectedPrices.length > 0) {
      const placePrice = place.price_level || 0;
      if (!selectedPrices.includes(placePrice)) return false;
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      const placeRating = place.rating || 0;
      if (!selectedRatings.some(rating => placeRating >= rating)) return false;
    }

    // Amenities filter (hotels)
    if (selectedAmenities.length > 0 && selectedType === 'lodging') {
      if (!place.types || !place.types.includes('lodging')) return false;
    }

    // Cuisine filter (restaurants)
    if (selectedCuisines.length > 0 && selectedType === 'restaurant') {
      if (!place.types || !place.types.some(type => ['restaurant', 'food'].includes(type))) return false;
    }

    // Attraction type filter
    if (selectedAttractionTypes.length > 0 && selectedType === 'tourist_attraction') {
      if (!place.types || !place.types.includes('tourist_attraction')) return false;
    }

    return true;
  });

  renderResults(filteredResults);
  showResultsFeedback(filteredResults.length);
  closeFiltersModal();
}

/**
 * Clears all selected filters
 */
function clearFilters() {
  const checkboxes = filtersModal.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => checkbox.checked = false);
  renderResults(allResults);
}

/**
 * Opens the filters modal
 */
function openFiltersModal() {
  filtersModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Closes the filters modal
 */
function closeFiltersModal() {
  filtersModal.style.display = 'none';
  document.body.style.overflow = '';
}

/**
 * Updates visible filter sections based on selected type
 * @param {string} type - The selected type
 */
function updateFilterSections(type) {
  hotelFilters.style.display = 'none';
  restaurantFilters.style.display = 'none';
  attractionFilters.style.display = 'none';

  if (type.includes('hotel')) {
    hotelFilters.style.display = 'block';
  } else if (type.includes('restaurante')) {
    restaurantFilters.style.display = 'block';
  } else if (type.includes('atração')) {
    attractionFilters.style.display = 'block';
  }
}

// Export functions
export { updateFilterSections, initializeFilters }; 