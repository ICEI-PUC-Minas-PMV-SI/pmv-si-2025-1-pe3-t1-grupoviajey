/**
 * Loader module for Google Maps API
 * Handles loading the API key from backend and initializing the Google Maps script
 */

let apiKey = null;

/**
 * Loads the API key from the backend
 * @returns {Promise<string|null>} The API key or null if failed
 */
async function loadApiKey() {
  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    apiKey = data.apiKey;
    return apiKey;
  } catch (error) {
    console.error('Erro ao carregar API key:', error);
    return null;
  }
}

/**
 * Loads the Google Maps script with the API key
 * @returns {Promise<void>}
 */
async function loadGoogleMapsScript() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Tentando carregar API key...');
      const key = await loadApiKey();
      if (!key) {
        throw new Error('API key não disponível');
      }
      
      console.log('API key carregada com sucesso');
      
      // Verifica se o script já está carregado
      if (window.google && window.google.maps) {
        console.log('Google Maps já está carregado');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=pt-BR&region=BR`;
      
      script.onload = () => {
        console.log('Script do Google Maps carregado com sucesso');
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('Erro ao carregar script do Google Maps:', error);
        reject(error);
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Erro ao carregar API key:', error);
      reject(error);
    }
  });
}

// Export functions
export { loadApiKey, loadGoogleMapsScript, apiKey }; 