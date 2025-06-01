// import { renderNotesInput, saveTripNote } from './dashboard-notes.js';

export async function initDashboardTrips() {
  await renderTrips();
}

async function fetchUserTrips() {
  // Para integração real, descomente a linha abaixo e ajuste a rota da sua API:
  // return fetch('/api/viagens').then(res => res.json());

  // Simulação de chamada ao backend (mock)
  return [
    {
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
  ];
}

async function renderTrips() {
  const tripsContainer = document.getElementById('dashboard-trips');
  if (!tripsContainer) return;

  const allTrips = await fetchUserTrips();
  const tripsAtuais = allTrips.filter(trip => !trip.isPast);
  const tripsPassadas = allTrips.filter(trip => trip.isPast);

  tripsContainer.innerHTML = `
    <div class="trips-list" id="trips-atuais-list"></div>
    <div class="trips-section-title">Viagens passadas</div>
    <div class="trips-list" id="trips-passadas-list"></div>
  `;

  renderTripsList('trips-atuais-list', tripsAtuais);
  renderTripsList('trips-passadas-list', tripsPassadas);
}

function renderTripsList(containerId, trips) {
  const list = document.getElementById(containerId);
  if (!list) return;
  list.innerHTML = '';
  trips.forEach(trip => {
    const card = createTripCard(trip);
    list.appendChild(card);
  });
}

function createTripCard(trip) {
  const card = document.createElement('div');
  card.className = 'trip-card';

  card.innerHTML = `
    <div class="trip-img-placeholder">
      <span>📷</span>
    </div>
    <div class="trip-info">
      <div class="trip-title">[${trip.title}]</div>
      <div class="trip-date"><span>📅</span> ${formatTripDate(trip.date)}</div>
      <div class="trip-desc">${trip.descricao || ''}</div>
    </div>
  `;

  return card;
}

function formatTripDate(dateStr) {
  // Espera formato 'YYYY-MM-DD/YYYY-MM-DD'
  if (!dateStr.includes('/')) return dateStr;
  const [start, end] = dateStr.split('/');
  const [sy, sm, sd] = start.split('-');
  const [ey, em, ed] = end.split('-');
  // Exemplo: Dias 15 - 25 de Maio de 2025
  const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `Dias ${parseInt(sd)} - ${parseInt(ed)} de ${meses[parseInt(em)]} de ${ey}`;
}

function deleteTrip(id) {
  alert('Viagem excluída (mock): ' + id);
  renderTrips();
}

function editTrip(id) {
  alert('Editar viagem (mock): ' + id);
} 