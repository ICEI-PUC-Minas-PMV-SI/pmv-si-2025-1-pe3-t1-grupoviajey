import { initCreateTripModal, openCreateTripModal } from '../../components/modal/create_trip/CreateTripModal.js';

export async function initDashboardTrips() {
  await initCreateTripModal();
  await renderTrips();
}

//async function fetchUserTrips() {
// Para integração real, descomente a linha abaixo e ajuste a rota da sua API:
// return fetch('/api/viagens').then(res => res.json());

// Simulação de chamada ao backend (mock)
//return [
/*{
  id: 1,
  title: 'Viagem a Paris',
  date: '2025-05-15/2025-05-25',
  descricao: 'Uma viagem inesquecível pela capital francesa.',
  isPast: false
},
{
  id: 2,
  title: 'Férias no Rio',
  date: '2025-05-15/2025-05-25',
  descricao: 'Aproveite as praias e o clima carioca.',
  isPast: false
},
{
  id: 3,
  title: 'Viagem a Roma',
  date: '2025-05-15/2025-05-25',
  descricao: 'Uma viagem inesquecível pela capital italiana.',
  isPast: true
}
*/
//];
//}

export function renderTrips() {
  const el = document.getElementById('dashboard-trips');
  if (!el) return;

  // Busca viagens do localStorage
  const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');

  el.innerHTML = `
    <div class="trips-list"></div>
  `;

  // Adicionar evento ao botão de criar viagem
  document.getElementById('btn-create-trip').onclick = openCreateTripModal;

  const list = el.querySelector('.trips-list');
  if (!trips.length) {
    list.innerHTML = '<p>Nenhuma viagem criada ainda.</p>';
    return;
  }

  trips.forEach(trip => {
    const card = createTripCard(trip);
    list.appendChild(card);
  });
}

function createTripCard(trip) {
  const card = document.createElement('div');
  card.className = 'trip-card';
  // Extrai cidade, estado, país do destino (esperando string "cidade, estado, país")
  let city = '', state = '', country = '';
  if (trip.destination) {
    const parts = trip.destination.split(',').map(s => s.trim());
    [city, state, country] = parts;
  }

  // Cria o conteúdo da imagem baseado na foto disponível
  const imageContent = trip.photo
    ? `<img src="${trip.photo}" alt="${trip.title}" class="trip-photo">`
    : `<span>📷</span>`;

  card.innerHTML = `
    <div class="trip-img-placeholder">${imageContent}</div>
    <div class="trip-info">
      <div class="trip-title">${trip.title}</div>
      <div class="trip-destination-row">
        <span class="dashboard-pin-icon"><img src="../../../assets/images/pin.svg" alt="Local" /></span>
        <span class="trip-destination">${city || 'Destino não definido'}${state ? ', ' + state : ''}${country ? ', ' + country : ''}</span>
      </div>
      <div class="trip-dates-row">
        <span class="dashboard-date-icon"><img src="../../../assets/images/calendar.svg" alt="Calendário" /></span>
        <span class="trip-date">${formatTripPeriod(trip)}</span>
      </div>
      <div class="trip-desc">${trip.description || ''}</div>
    </div>
  `;

  // Evento de clique para abrir o roadmap
  card.addEventListener('click', () => {
    localStorage.setItem('selectedTripId', trip.id);
    window.location.href = '/pages/user_roadmap/user-roadmap.html';
  });

  return card;
}

function formatTripPeriod(trip) {
  if (trip.startDate && trip.endDate) {
    return formatDate(trip.startDate) + ' a ' + formatDate(trip.endDate);
  } else if (trip.startDate) {
    return formatDate(trip.startDate);
  } else if (trip.endDate) {
    return formatDate(trip.endDate);
  } else {
    return 'Data não definida';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function deleteTrip(id) {
  let trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
  trips = trips.filter(trip => trip.id !== id);
  localStorage.setItem('userTrips', JSON.stringify(trips));
  renderTrips();
}

function editTrip(id) {
  alert('Editar viagem (mock): ' + id);
} 