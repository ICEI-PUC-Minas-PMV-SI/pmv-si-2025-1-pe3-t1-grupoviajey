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
        const city = extractCity(destination);
        const response = await fetch(`/api/unsplash/search?destination=${encodeURIComponent(city)}`);
        if (!response.ok) throw new Error('Erro ao buscar imagem');
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            // Filtra só landscape real e retorna array de objetos
            return data.results
                .filter(img => img.width / img.height >= 1.3)
                .map(img => ({
                    url: img.urls.regular,
                    thumb: img.urls.thumb,
                    photographer: img.user.name,
                    photographerLink: img.user.links.html
                }));
        }
        return [];
    } catch (err) {
        console.error(err);
        return [];
    }
}
