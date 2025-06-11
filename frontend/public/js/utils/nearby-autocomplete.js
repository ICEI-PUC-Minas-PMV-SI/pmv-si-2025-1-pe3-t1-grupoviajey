// Utilitário de autocomplete customizado usando Google Places Search Nearby
// Uso: import { initNearbyAutocomplete } from './nearby-autocomplete.js';

export function initNearbyAutocomplete(input, city, onPlaceSelected) {
    if (!input || !window.google?.maps?.places) return;
    let debounceTimeout = null;
    let lastResults = [];
    let dropdown = null;

    async function searchNearbyPlaces(city, query) {
        // 1. Geocode para obter o centro da cidade
        const geocoder = new google.maps.Geocoder();
        return new Promise((resolve, reject) => {
            geocoder.geocode({ address: city }, function (results, status) {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    // 2. Chame a PlacesService nearbySearch
                    const service = new google.maps.places.PlacesService(document.createElement('div'));
                    const request = {
                        location: location,
                        radius: 20000, // 20km, ajuste conforme necessário
                        keyword: query,
                        type: 'establishment'
                    };
                    service.nearbySearch(request, (results, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            resolve(results);
                        } else {
                            resolve([]);
                        }
                    });
                } else {
                    resolve([]);
                }
            });
        });
    }

    function showSuggestions(suggestions) {
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'autocomplete-suggestions';
            dropdown.style.position = 'absolute';
            dropdown.style.background = '#fff';
            dropdown.style.border = '1px solid #ccc';
            dropdown.style.zIndex = 1000;
            dropdown.style.width = input.offsetWidth + 'px';
            dropdown.style.maxHeight = '220px';
            dropdown.style.overflowY = 'auto';
            input.parentNode.appendChild(dropdown);
        }
        dropdown.innerHTML = '';
        if (suggestions.length === 0) {
            const noResult = document.createElement('div');
            noResult.style.padding = '8px';
            noResult.style.color = '#888';
            noResult.textContent = 'Nenhum resultado encontrado';
            dropdown.appendChild(noResult);
        } else {
            suggestions.forEach(place => {
                const item = document.createElement('div');
                item.textContent = place.name + (place.vicinity ? ' - ' + place.vicinity : '');
                item.style.padding = '8px';
                item.style.cursor = 'pointer';
                item.onmousedown = () => {
                    input.value = place.name;
                    if (typeof onPlaceSelected === 'function') onPlaceSelected(place);
                    dropdown.innerHTML = '';
                };
                dropdown.appendChild(item);
            });
        }
        // Powered by Google (sempre visível)
        const powered = document.createElement('div');
        powered.style.textAlign = 'right';
        powered.style.padding = '4px 8px 4px 0';
        powered.innerHTML = '<img src="https://developers.google.com/maps/documentation/images/powered_by_google_on_white.png" alt="Powered by Google" style="height:16px;">';
        dropdown.appendChild(powered);

        // Posiciona o dropdown
        dropdown.style.left = input.offsetLeft + 'px';
        dropdown.style.top = (input.offsetTop + input.offsetHeight) + 'px';
    }

    input.addEventListener('input', function () {
        const query = input.value.trim();
        if (debounceTimeout) clearTimeout(debounceTimeout);
        if (!query) {
            showSuggestions([]);
            return;
        }
        debounceTimeout = setTimeout(async () => {
            const results = await searchNearbyPlaces(city, query);
            lastResults = results;
            showSuggestions(results);
        }, 350);
    });

    // Fecha sugestões ao clicar fora
    document.addEventListener('mousedown', function (e) {
        if (dropdown && !input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.innerHTML = '';
        }
    });
} 