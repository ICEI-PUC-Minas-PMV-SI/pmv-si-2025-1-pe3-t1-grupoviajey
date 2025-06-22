import { initCreateTripModal, openCreateTripModal } from '../../components/modal/create_trip/CreateTripModal.js';
import { formatShortDateRange } from '../../js/utils/date.js';
import { apiService } from '../../services/api/apiService.js';
import { showLoading, hideLoading, showErrorToast, showSuccessToast } from '../../js/utils/ui-utils.js';

export async function initDashboardTrips() {
  await initCreateTripModal();
  await renderTrips();
}

export async function renderTrips() {
  const el = document.getElementById('dashboard-trips');
  if (!el) return;

  try {
    showLoading('Carregando viagens...');
    
    // Busca viagens do backend
    const response = await apiService.getTrips();
    console.log('Resposta completa do backend:', response);
    
    // Extrai os dados do campo 'data' da resposta
    const trips = response.data || response;
    console.log('Trips extraídos:', trips);

    el.innerHTML = `
      <div class="trips-list"></div>
    `;

    // Adicionar evento ao botão de criar viagem
    const createBtn = document.getElementById('btn-create-trip');
    if (createBtn) {
      createBtn.onclick = openCreateTripModal;
    }

    const list = el.querySelector('.trips-list');
    if (!trips.length) {
      list.innerHTML = '<p>Nenhuma viagem criada ainda.</p>';
      return;
    }

    trips.forEach(trip => {
      const card = createTripCard(trip);
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Erro ao carregar viagens:', error);
    showErrorToast('Erro ao carregar viagens. Tente novamente.');
    el.innerHTML = '<p>Erro ao carregar viagens. Tente novamente.</p>';
  } finally {
    hideLoading();
  }
}

// Tornar disponível globalmente para o modal
window.renderTrips = renderTrips;

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
    return formatShortDateRange(trip.startDate, trip.endDate);
  } else if (trip.startDate) {
    return formatShortDateRange(trip.startDate, trip.startDate);
  } else if (trip.endDate) {
    return formatShortDateRange(trip.endDate, trip.endDate);
  } else {
    return 'Data não definida';
  }
}

// Função para criar nova viagem (chamada pelo modal)
export async function createTrip(tripData) {
  try {
    showLoading('Criando viagem...');
    
    const newTrip = await apiService.createTrip(tripData);
    
    showSuccessToast('Viagem criada com sucesso!');
    
    // Recarrega a lista
    await renderTrips();
    
    return newTrip;
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    showErrorToast('Erro ao criar viagem. Tente novamente.');
    throw error;
  } finally {
    hideLoading();
  }
}

async function deleteTrip(id) {
  try {
    showLoading('Excluindo viagem...');
    
    await apiService.deleteTrip(id);
    
    showSuccessToast('Viagem excluída com sucesso!');
    
    // Recarrega a lista
    await renderTrips();
  } catch (error) {
    console.error('Erro ao excluir viagem:', error);
    showErrorToast('Erro ao excluir viagem. Tente novamente.');
  } finally {
    hideLoading();
  }
}

function editTrip(id) {
  // TODO: Implementar edição de viagem
  alert('Editar viagem (funcionalidade em desenvolvimento): ' + id);
} 