// Carrega a API key do backend
async function loadApiKey() {
    try {
        const response = await fetch('/api/config');
        const data = await response.json();
        return data.apiKey;
    } catch (error) {
        console.error('Erro ao carregar API key:', error);
        return 'YOUR_API_KEY';
    }
}

// Função para atualizar a API key em todos os scripts do Google Maps
async function updateGoogleMapsScripts() {
    const apiKey = await loadApiKey();
    const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    scripts.forEach(script => {
        const newSrc = script.src.replace(/key=[^&]+/, `key=${apiKey}`);
        script.src = newSrc;
    });
}

// Atualiza a API key quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', updateGoogleMapsScripts); 