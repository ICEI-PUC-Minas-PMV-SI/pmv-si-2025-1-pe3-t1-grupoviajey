/**
 * Main initialization script for search results page
 */
import { loadGoogleMapsScript } from '../../js/core/map/loader.js';
import { initializeMapWithCity } from './map-config.js';
import { getBuscaPersistida } from './results.js';
import { initializeFilters } from './filters.js';
import { includeSearchBar, includeHeader, includeFooter, includePlaceDetailsModal, includeReviewsModal } from '../../js/utils/include.js';

// Função para inicializar a página
async function initializePage() {
  console.log('Iniciando página de resultados...');
  includeSearchBar();
  includeHeader();
  includeFooter();
  includePlaceDetailsModal();
  includeReviewsModal();
  
  try {
    // Inicializa os filtros
    console.log('Inicializando filtros...');
    initializeFilters();
    
    // Carrega o script do Google Maps
    console.log('Carregando Google Maps...');
    await loadGoogleMapsScript();
    console.log('Google Maps carregado com sucesso');

    // Obtém a cidade da busca persistida
    const { cidade } = getBuscaPersistida();
    console.log('Cidade da busca:', cidade);

    if (cidade) {
      // Atualiza o título dinamicamente
      const titulo = document.querySelector('.results-title');
      if (titulo) {
        titulo.textContent = `Explorando ${cidade}`;
      }
      // Inicializa o mapa com a cidade
      console.log('Inicializando mapa com cidade:', cidade);
      await initializeMapWithCity(cidade);
    } else {
      console.log('Nenhuma cidade definida na busca');
    }
  } catch (error) {
    console.error('Erro ao inicializar página:', error);
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializePage); 