export async function renderFavorites() {
  const favorites = document.getElementById('dashboard-favorites');
  if (!favorites) return;
  favorites.innerHTML = '';
  const favs = await fetchUserFavorites();
  if (!document.querySelector('link[href*="result-card.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../../components/cards/result-card.css';
    document.head.appendChild(link);
  }
  if (!window.createResultCard) {
    const script = document.createElement('script');
    script.src = '../../components/cards/result-card.js';
    document.body.appendChild(script);
    script.onload = () => renderFavorites();
    return;
  }
  favs.forEach(fav => {
    const card = window.createResultCard(fav);
    favorites.appendChild(card);
  });
}

async function fetchUserFavorites() {
  // Para integração real, descomente a linha abaixo e ajuste a rota da sua API:
  // return fetch('/api/favoritos').then(res => res.json());
  return [
    {
      image: '',
      title: 'Museu do Amanhã',
      rating: 4,
      tags: ['Museu', 'Cultura'],
      address: 'Praça Mauá, Rio de Janeiro',
      favorite: true
    },
    {
      image: '',
      title: 'Cristo Redentor',
      rating: 5,
      tags: ['Ponto turístico'],
      address: 'Alto da Boa Vista, Rio de Janeiro',
      favorite: true
    }
  ];
} 