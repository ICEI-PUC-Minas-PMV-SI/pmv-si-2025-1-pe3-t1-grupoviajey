import { includeHeader, includeFooter, includeSearchBar } from '../../js/utils/include.js';
import { loadGoogleMapsScript } from '../../js/core/map/loader.js';

// Função para gerar dados mockados para os carrosséis
function setupMockData() {
  // Mock data para posts (Dicas de Viagem)
  const mockPosts = [
    {
      id: 'post1',
      title: '10 Dicas Essenciais para Viajar Sozinho com Segurança',
      description: 'Viajar sozinho pode ser uma experiência libertadora. Com estas dicas, você garante uma aventura tranquila e segura do início ao fim.',
      image: 'https://images.unsplash.com/photo-1523908511403-7fc7b255dba6?auto=format&fit=crop&w=400&q=80',
      rating: 4.7,
      category: 'dicas',
      type: 'post',
      createdAt: new Date().toISOString()
    },
    {
      id: 'post2',
      title: 'As Praias Mais Paradisíacas do Nordeste Brasileiro',
      description: 'Um guia completo pelas praias de águas cristalinas e areia branca do Nordeste. Descubra joias escondidas e planeje seu roteiro.',
      image: 'https://images.unsplash.com/photo-1541410965324-06a9c4a45a27?auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      category: 'praia',
      type: 'post',
      createdAt: new Date().toISOString()
    }
  ];

  // Mock data para anúncios de parceiros
  const mockAds = [
    {
      id: 'ad1',
      title: 'Resort & Spa Tropicaliente',
      description: 'Hospedagem de luxo com 25% de desconto para reservas antecipadas. Inclui acesso ao spa e café da manhã especial.',
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      category: 'hotel',
      type: 'partner_ad',
      address: 'Av. das Palmeiras, 100, Porto de Galinhas',
      phone: '81-98888-7777',
      website: 'https://example.com',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ad2',
      title: 'Restaurante Sabor do Mar',
      description: 'Experiência gastronômica única com frutos do mar frescos. Menu degustação harmonizado com vinhos selecionados.',
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      category: 'restaurante',
      type: 'partner_ad',
      address: 'Rua da Praia, 25, Fernando de Noronha',
      phone: '81-99999-5555',
      website: 'https://example.com',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ad3',
      title: 'Aventura de Balão nos Cânions',
      description: 'Voe sobre paisagens espetaculares e tenha uma vista privilegiada dos cânions. Uma aventura inesquecível.',
      image: 'https://images.unsplash.com/photo-1533130123163-5339a1a8c691?auto=format&fit=crop&w=400&q=80',
      rating: 4.7,
      category: 'atividade',
      type: 'partner_ad',
      address: 'Cambará do Sul, RS',
      phone: '54-97777-6666',
      website: 'https://example.com',
      createdAt: new Date().toISOString()
    }
  ];

  // Armazena no localStorage se ainda não houver dados
  if (!localStorage.getItem('viajey_posts')) {
    localStorage.setItem('viajey_posts', JSON.stringify(mockPosts));
  }
  if (!localStorage.getItem('viajey_ads')) {
    localStorage.setItem('viajey_ads', JSON.stringify(mockAds));
  }
}

// Função para inicializar os carrosséis
function initCarousels() {
  if (window.ViajeyCarousel) {
    // Carrossel de Posts (Dicas de Viagem)
    const postsContainer = document.getElementById('posts-carousel-container');
    if (postsContainer) {
      new window.ViajeyCarousel(postsContainer, {
        title: 'Dicas de Viagem',
        storageKey: 'viajey_posts',
        filter: item => item.type !== 'partner_ad'
      });
    }

    // Carrossel de Anúncios de Parceiros
    const adsContainer = document.getElementById('ads-carousel-container');
    if (adsContainer) {
      new window.ViajeyCarousel(adsContainer, {
        title: 'Ofertas de Parceiros',
        storageKey: 'viajey_ads',
        filter: item => item.type === 'partner_ad'
      });
    }
  }
}

// Função para carregar e inicializar o modal de IA
function initAiModal() {
  function waitForFlatpickr(cb) {
    if (window.flatpickr && window.flatpickr.l10ns && window.flatpickr.l10ns.pt) cb();
    else setTimeout(() => waitForFlatpickr(cb), 50);
  }

  function waitForGoogleMaps(cb) {
    if (window.google && window.google.maps && window.google.maps.places) cb();
    else setTimeout(() => waitForGoogleMaps(cb), 50);
  }

  waitForGoogleMaps(() => {
    waitForFlatpickr(() => {
      fetch('../../components/modal/ai_modal/ai-modal.html')
        .then(res => res.text())
        .then(html => {
          const temp = document.createElement('div');
          temp.innerHTML = html;
          document.getElementById('ai-modal-root').appendChild(temp.firstElementChild);

          const script = document.createElement('script');
          script.src = '../../components/modal/ai_modal/ai-modal.js';
          document.body.appendChild(script);

          const openBtn = document.getElementById('open-ai-modal');
          if (openBtn) {
            openBtn.addEventListener('click', () => window.openAiModal && window.openAiModal());
          }
        });
    });
  });
}

// Evento principal que dispara as inicializações
document.addEventListener('DOMContentLoaded', () => {
  // Inclui os componentes básicos da página
  includeHeader();
  includeFooter();
  includeSearchBar();

  // Configura os dados mockados para os carrosséis
  setupMockData();
  
  // Inicializa os carrosséis
  initCarousels();

  // Carrega o Google Maps e, em seguida, o modal de IA que depende dele
  loadGoogleMapsScript()
    .then(() => {
      initAiModal();
    })
    .catch(error => {
      console.error("Falha na sequência de inicialização da página:", error);
    });
});
