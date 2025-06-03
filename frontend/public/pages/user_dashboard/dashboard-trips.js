// import { renderNotesInput, saveTripNote } from './dashboard-notes.js';

export async function initDashboardTrips() {
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

function openTripForm() {
  const el = document.getElementById('dashboard-trips');
  el.innerHTML = `
    <div class="trip-form">
      <h3>Criar nova viagem</h3>
      <form id="form-trip">
        <label>Título:<input type="text" name="title" required></label><br>
        <label>Data (início/fim):<input type="text" name="date" placeholder="2025-05-15/2025-05-25" required></label><br>
        <label>Descrição:<textarea name="descricao"></textarea></label><br>
        <button type="submit" class="action-btn">Salvar</button>
        <button type="button" id="cancel-trip" class="action-btn">Cancelar</button>
      </form>
    </div>
  `;
  document.getElementById('cancel-trip').onclick = renderTrips;
  document.getElementById('form-trip').onsubmit = function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this));
    addTrip(data);
    renderTrips();
  };
}

function addTrip(trip) {
  const trips = JSON.parse(localStorage.getItem('userTrips') || '[]');
  trip.id = Date.now();
  trips.push(trip);
  localStorage.setItem('userTrips', JSON.stringify(trips));
}

function createTripCard(trip) {
  const card = document.createElement('div');
  card.className = 'trip-card';
  card.innerHTML = `
    <div class="trip-img-placeholder"><span>📷</span></div>
    <div class="trip-info">
      <div class="trip-title">${trip.title}</div>
      <div class="trip-date"><span>📅</span> ${formatTripDate(trip.date)}</div>
      <div class="trip-desc">${trip.descricao || ''}</div>
    </div>
  `;
  // Evento de clique para abrir o roadmap
  card.addEventListener('click', () => {
    localStorage.setItem('selectedTripId', trip.id);
    window.location.href = '/pages/user_roadmap/user-roadmap.html';
  });

  return card;
}

function formatTripDate(dateStr) {
  if (!dateStr || !dateStr.includes('/')) return dateStr || '';
  const [start, end] = dateStr.split('/');
  const [sy, sm, sd] = start.split('-');
  const [ey, em, ed] = end.split('-');
  const meses = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `Dias ${parseInt(sd)} - ${parseInt(ed)} de ${meses[parseInt(em)]} de ${ey}`;
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