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
        // Extrai apenas o nome da cidade
        const city = extractCity(destination);

        const response = await fetch(
            `/api/unsplash/search?destination=${encodeURIComponent(city)}`,
            {
                method: 'GET'
            }
        );

        if (!response.ok) {
            throw new Error('Erro ao buscar imagem');
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return {
                url: data.results[0].urls.regular,
                photographer: data.results[0].user.name,
                photographerUrl: data.results[0].user.links.html
            };
        }

        return null;
    } catch (error) {
        console.error('Erro ao buscar imagem do destino:', error);
        return null;
    }
}
