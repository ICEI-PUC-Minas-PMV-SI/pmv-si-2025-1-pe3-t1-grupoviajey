// Chave pública do Unsplash - você deve substituir pela sua própria chave
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';


function translateDestinationToEnglish(destination) {
    const city = destination.split(',')[0].trim().toLowerCase();
    return destinationTranslations[city] || city;
}

function extractCity(destination) {
    return destination.split(',')[0].trim();
}

export async function searchDestinationImage(destination) {
    try {
        const city = destination.split(',')[0].trim();
        
        const response = await fetch(`/api/unsplash/search?destination=${encodeURIComponent(city)}`);
        
        if (!response.ok) {
            throw new Error('Erro ao buscar imagem no servidor');
        }
        
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            return data.data; // O backend já retorna o formato correto
        }
        
        return [];
    } catch (err) {
        console.error('Erro na chamada da API do Unsplash:', err);
        return []; // Retorna um array vazio em caso de erro
    }
}
