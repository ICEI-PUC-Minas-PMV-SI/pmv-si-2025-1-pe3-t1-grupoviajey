const express = require('express');
const router = express.Router();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_ACCESS_KEY) {
  console.error('Atenção: A chave da API do Unsplash (UNSPLASH_ACCESS_KEY) não está configurada no backend.');
}

/**
 * Remove acentos e caracteres especiais de uma string.
 * @param {string} str A string para normalizar.
 * @returns {string} A string normalizada.
 */
const normalizeString = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Endpoint para buscar imagens do Unsplash de forma segura
router.get('/search', async (req, res) => {
  const { destination } = req.query;
  if (!destination) {
    return res.status(400).json({ success: false, message: 'O destino é obrigatório.' });
  }

  try {
    const searchTerm = normalizeString(destination);
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&orientation=landscape&per_page=10`;
    
    const unsplashResponse = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });

    if (!unsplashResponse.ok) {
      console.error('Erro na resposta do Unsplash:', await unsplashResponse.text());
      return res.status(unsplashResponse.status).json({ success: false, message: 'Erro ao comunicar com o serviço de imagens.' });
    }

    const data = await unsplashResponse.json();

    if (data.results && data.results.length > 0) {
      const formattedResults = data.results
        .filter(img => img.width / img.height >= 1.2) // Garante que a imagem seja paisagem
        .map(img => ({
          url: img.urls.regular,
          thumb: img.urls.thumb,
          photographer: img.user.name,
          photographerLink: img.user.links.html
        }));
      res.status(200).json({ success: true, data: formattedResults });
    } else {
      res.status(200).json({ success: true, data: [] }); // Retorna sucesso com array vazio se não houver resultados
    }
  } catch (err) {
    console.error('Erro no proxy do Unsplash:', err);
    res.status(500).json({ success: false, message: 'Erro interno do servidor ao buscar imagens.' });
  }
});

module.exports = router; 