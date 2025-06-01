// import { renderNotesInput, saveTripNote } from './dashboard-notes.js';

export function initDashboardTrips() {
  renderTrips();
}

function renderTrips() {
  const tripsContainer = document.getElementById('dashboard-trips');
  if (!tripsContainer) return;

  // Mock de dados
  const tripsAtuais = [
    {
      id: 1,
      title: 'Viagem a Paris',
      date: '2025-05-15/2025-05-25',
      rating: 4.9,
      notes: '',
      isPast: false
    },
    {
      id: 2,
      title: 'Férias no Rio',
      date: '2025-05-15/2025-05-25',
      rating: 4.9,
      notes: '',
      isPast: false
    }
  ];
  const tripsPassadas = [
    {
      id: 3,
      title: 'Viagem a Roma',
      date: '2025-05-15/2025-05-25',
      rating: 4.9,
      notes: '',
      isPast: true
    }
  ];

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
      <div class="trip-date"><span>📅</span> Dias 15 - 25 de Maio de 2025</div>
    </div>
  `;

  return card;
}

function deleteTrip(id) {
  alert('Viagem excluída (mock): ' + id);
  renderTrips();
}

function editTrip(id) {
  alert('Editar viagem (mock): ' + id);
} 