import { loadGoogleMapsScript } from '../../js/core/map/loader.js';
import { initMap } from '../../js/core/map/init.js';

/**
 * Inicializa o mapa do roteiro centralizado na cidade informada
 * @param {string} city - Nome da cidade
 * @param {string} elementId - ID do elemento onde o mapa será renderizado (default: 'map')
 * @returns {Promise<Object|null>} O objeto do mapa Google Maps
 */
function normalizeCity(city) {
    // Remove acentos
    return city.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export async function initRoadmapMap(city, elementId = 'map') {
    if (typeof city !== 'string') {
        console.error('initRoadmapMap: city deve ser uma string, recebeu:', city);
        return;
    }
    console.log('[DEBUG] initRoadmapMap chamada com:', city, elementId, typeof city);
    await loadGoogleMapsScript();
    const geocoder = new google.maps.Geocoder();
    const mapElem = document.getElementById(elementId);
    if (!mapElem) return;

    const cityVariants = [
        city,
        normalizeCity(city),
        city.split(',')[0], // só cidade
        normalizeCity(city.split(',')[0]),
        `${city}, Brasil`,
        `${normalizeCity(city)}, Brasil`
    ];

    let found = false;
    for (const variant of cityVariants) {
        await new Promise(resolve => {
            geocoder.geocode({ address: variant }, function (results, status) {
                if (status === 'OK' && results[0]) {
                    const map = initMap(elementId, results[0].geometry.location);
                    window.map = map;
                    found = true;
                }
                resolve();
            });
        });
        if (found) break;
    }
    if (!found) {
        console.error('Cidade não encontrada:', city);
        // Exiba um aviso amigável na tela se quiser
    }
}
