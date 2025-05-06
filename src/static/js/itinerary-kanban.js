// App State - Dados do itinerário
let appState = {
  currentItinerary: null
};

// Elementos DOM
const addActivityBtn = document.getElementById('add-activity-btn');
const saveActivityBtn = document.getElementById('save-activity-btn');
const addDayBtn = document.getElementById('add-day-btn');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Carregar dados do localStorage
  loadFromLocalStorage();
  
  // Configurar event listeners
  setupEventListeners();
  
  // Inicializar modais Bootstrap
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modalEl => {
    new bootstrap.Modal(modalEl);
  });
});

// Funções de drag and drop
function allowDrop(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.add('drag-over');
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
  ev.target.classList.add('dragging');
  
  // Guardar coluna de origem para referência
  const sourceColumn = ev.target.closest('.kanban-column-content');
  ev.dataTransfer.setData("source-period", sourceColumn.dataset.period);
  ev.dataTransfer.setData("source-day", sourceColumn.dataset.day || getActiveDay());
}

function drop(ev) {
  ev.preventDefault();
  ev.currentTarget.classList.remove('drag-over');
  
  const cardId = ev.dataTransfer.getData("text");
  const card = document.getElementById(cardId);
  const sourcePeriod = ev.dataTransfer.getData("source-period");
  const sourceDay = ev.dataTransfer.getData("source-day");
  
  // Remover classe de arrastar
  card.classList.remove('dragging');
  
  // Pegar o período e dia destino
  const targetPeriod = ev.currentTarget.dataset.period;
  const targetDay = ev.currentTarget.dataset.day || getActiveDay();
  
  // Obter a posição horizontal para ordenar por horário (mais à esquerda = mais cedo)
  const rect = ev.currentTarget.getBoundingClientRect();
  const y = ev.clientY - rect.top;
  
  // Encontrar o elemento antes do qual inserir o card
  let insertBefore = null;
  let closestDistance = Number.MAX_SAFE_INTEGER;
  
  const children = Array.from(ev.currentTarget.children);
  for (const child of children) {
    if (child.id === cardId) continue;
    
    const childRect = child.getBoundingClientRect();
    const childMiddle = childRect.top + childRect.height / 2 - rect.top;
    const distance = Math.abs(y - childMiddle);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      insertBefore = y < childMiddle ? child : child.nextElementSibling;
    }
  }
  
  // Inserir o card na posição determinada
  ev.currentTarget.insertBefore(card, insertBefore);
  
  // Atualizar os dados do app state
  updateActivityPeriod(cardId, sourcePeriod, targetPeriod, sourceDay, targetDay);
  
  // Salvar alterações
  saveToLocalStorage();
}

function dragEnd(ev) {
  ev.target.classList.remove('dragging');
  document.querySelectorAll('.kanban-column-content').forEach(col => {
    col.classList.remove('drag-over');
  });
}

// Adicionar listeners para dragEnd em todos os cards
document.querySelectorAll('.kanban-card').forEach(card => {
  card.addEventListener('dragend', dragEnd);
});

// Configurar event listeners
function setupEventListeners() {
  // Botão de adicionar atividade
  addActivityBtn.addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('add-activity-modal'));
    modal.show();
  });
  
  // Botão de salvar atividade
  saveActivityBtn.addEventListener('click', saveNewActivity);
  
  // Botão de adicionar dia
  addDayBtn.addEventListener('click', addNewDay);
  
  // Botão para voltar para a página de exploração
  const backToExploreBtn = document.getElementById('back-to-explore-btn');
  if (backToExploreBtn) {
    backToExploreBtn.addEventListener('click', function() {
      // Obter o ID do roteiro atual
      const urlParams = new URLSearchParams(window.location.search);
      const roteiroId = urlParams.get('roteiroId');
      
      if (roteiroId) {
        // Redirecionar para a página de exploração com o ID do roteiro
        window.location.href = `/explorar?roteiroId=${roteiroId}`;
      } else {
        // Verificar se há um roteiro no localStorage
        const currentItinerary = appState.currentItinerary || JSON.parse(localStorage.getItem('currentItinerary') || '{}');
        
        if (currentItinerary && currentItinerary.id) {
          window.location.href = `/explorar?roteiroId=${currentItinerary.id}`;
        } else {
          window.location.href = '/explorar';
        }
      }
    });
  }
}

// Obter o dia ativo nas tabs
function getActiveDay() {
  const activeTab = document.querySelector('.tab-pane.active');
  return activeTab.id.replace('day-', '');
}

// Atualizar período de uma atividade
function updateActivityPeriod(activityId, sourcePeriod, targetPeriod, sourceDay, targetDay) {
  // Implementação real atualizaria os dados do app state
  console.log(`Atividade ${activityId} movida de ${sourcePeriod}/${sourceDay} para ${targetPeriod}/${targetDay}`);
  
  // Aqui implementaríamos a lógica para atualizar a ordem e 
  // período/dia da atividade no appState
}

// Salvar nova atividade
// Renderizar atividades para um dia específico
function renderActivitiesForDay(day) {
  if (!day || !day.activities || !Array.isArray(day.activities)) return;
  
  const dayNumber = day.day_number;
  
  // Agrupar atividades por período
  const activitiesByPeriod = {
    morning: [],
    afternoon: [],
    evening: [],
    unscheduled: []
  };
  
  // Classificar cada atividade no período correto
  day.activities.forEach(activity => {
    const period = activity.period || 'unscheduled';
    if (activitiesByPeriod[period]) {
      activitiesByPeriod[period].push(activity);
    } else {
      activitiesByPeriod.unscheduled.push(activity);
    }
  });
  
  // Renderizar atividades para cada período
  Object.keys(activitiesByPeriod).forEach(period => {
    // Obter o container do período para este dia
    const periodContainer = document.querySelector(`#day-${dayNumber} .kanban-column-content[data-period="${period}"]`);
    
    if (!periodContainer) return;
    
    // Limpar o container
    periodContainer.innerHTML = '';
    
    // Renderizar cada atividade neste período
    activitiesByPeriod[period].forEach(activity => {
      const activityCard = createActivityCardElement(activity);
      periodContainer.appendChild(activityCard);
    });
  });
}

// Função para criar o elemento do card da atividade
function createActivityCardElement(activity) {
  // Determinar a classe e ícone baseado no tipo
  let badgeClass = 'bg-primary';
  let typeText = 'Atividade';
  
  switch (activity.type) {
    case 'attraction':
      badgeClass = 'bg-success';
      typeText = 'Atração';
      break;
    case 'food':
      badgeClass = 'bg-warning';
      typeText = 'Alimentação';
      break;
    case 'tour':
      badgeClass = 'bg-info';
      typeText = 'Passeio';
      break;
    case 'transportation':
      badgeClass = 'bg-danger';
      typeText = 'Transporte';
      break;
    case 'accommodation':
      badgeClass = 'bg-primary';
      typeText = 'Hospedagem';
      break;
  }
  
  // Formatar o horário
  let timeText = activity.start_time || 'Horário a definir';
  if (activity.start_time && activity.end_time) {
    timeText = `${activity.start_time} - ${activity.end_time}`;
  }
  
  // Criar elemento card
  const card = document.createElement('div');
  card.className = 'kanban-card';
  card.id = `activity-${activity.id}`;
  card.draggable = true;
  card.setAttribute('ondragstart', 'drag(event)');
  card.setAttribute('ondragend', 'dragEnd(event)');
  
  card.innerHTML = `
    <div class="kanban-card-header ${badgeClass.replace('bg-', 'bg-')} bg-opacity-25">
      <span class="badge rounded-pill ${badgeClass}">${typeText}</span>
      <div class="kanban-card-actions">
        <button class="btn btn-sm btn-link text-body p-0" onclick="editActivity('${activity.id}')">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="btn btn-sm btn-link text-danger p-0" onclick="removeActivity('${activity.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="kanban-card-body">
      <h6>${activity.name}</h6>
      <p class="small text-muted mb-1"><i class="fas fa-clock me-1"></i> ${timeText}</p>
      <p class="small text-muted"><i class="fas fa-map-marker-alt me-1"></i> ${activity.location || 'Localização não definida'}</p>
      ${activity.notes ? `<p class="small text-muted mt-2"><i class="fas fa-sticky-note me-1"></i> ${activity.notes}</p>` : ''}
    </div>
  `;
  
  return card;
}

// Função para adicionar nova atividade
async function saveNewActivity() {
  try {
    const nameInput = document.getElementById('activity-name');
    const typeInput = document.getElementById('activity-type');
    const locationInput = document.getElementById('activity-location');
    const dayInput = document.getElementById('activity-day');
    const periodInput = document.getElementById('activity-period');
    const startTimeInput = document.getElementById('activity-start-time');
    const endTimeInput = document.getElementById('activity-end-time');
    const notesInput = document.getElementById('activity-notes');
    
    // Validação básica
    if (!nameInput.value.trim()) {
      alert('Por favor, preencha o nome da atividade.');
      return;
    }
    
    // Verificar se temos um itinerário em edição
    if (!appState.currentItinerary || !appState.currentItinerary.id) {
      alert('Erro: Não há um roteiro em edição. Por favor, selecione ou crie um roteiro primeiro.');
      return;
    }
    
    // Criar objeto da atividade
    const newActivity = {
      name: nameInput.value.trim(),
      type: typeInput.value,
      location: locationInput.value.trim(),
      day_number: parseInt(dayInput.value, 10),
      period: periodInput.value,
      start_time: startTimeInput.value,
      end_time: endTimeInput.value,
      notes: notesInput.value.trim(),
      itinerary_id: appState.currentItinerary.id
    };
    
    // Verificar se o itinerário é temporário (não salvo no banco)
    if (appState.currentItinerary.id === 'temp-itinerary') {
      // Caso seja temporário, apenas adicionar à memória
      console.log('Itinerário temporário, salvando atividade apenas na memória');
      const tempId = 'temp-activity-' + Date.now();
      newActivity.id = tempId;
      
      // Adicionar à estrutura do dia correto
      const dayIndex = appState.currentItinerary.days.findIndex(d => d.day_number === newActivity.day_number);
      
      if (dayIndex === -1) {
        // Criar dia se não existir
        const newDay = {
          day_number: newActivity.day_number,
          date: new Date().toISOString().split('T')[0],
          activities: [newActivity]
        };
        appState.currentItinerary.days.push(newDay);
      } else {
        // Adicionar ao dia existente
        if (!appState.currentItinerary.days[dayIndex].activities) {
          appState.currentItinerary.days[dayIndex].activities = [];
        }
        appState.currentItinerary.days[dayIndex].activities.push(newActivity);
      }
      
      // Renderizar a nova atividade na UI
      const dayObj = appState.currentItinerary.days.find(d => d.day_number === newActivity.day_number);
      renderActivitiesForDay(dayObj);
      
    } else {
      // Caso seja um itinerário salvo, enviar para API
      console.log('Enviando nova atividade para API');
      showLoadingState();
      
      // Enviar para API
      const response = await fetch(`/api/itineraries/${appState.currentItinerary.id}/days/${newActivity.day_number}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newActivity)
      });
      
      hideLoadingState();
      
      if (!response.ok) {
        throw new Error(`Erro ao salvar atividade: ${response.status}`);
      }
      
      // Obter atividade salva (com ID gerado pelo banco)
      const savedActivity = await response.json();
      console.log('Atividade salva com sucesso:', savedActivity);
      
      // Buscar novamente os dados do itinerário para garantir consistência
      await loadItineraryFromApi(appState.currentItinerary.id);
    }
    
    // Resetar formulário e fechar modal
    document.getElementById('add-activity-form').reset();
    bootstrap.Modal.getInstance(document.getElementById('add-activity-modal')).hide();
    
    // Exibir mensagem de sucesso
    showSuccessToast('Atividade adicionada com sucesso!');
    
  } catch (error) {
    console.error('Erro ao salvar nova atividade:', error);
    hideLoadingState();
    showErrorMessage('Não foi possível salvar a atividade. Tente novamente mais tarde.');
  }
}

// Exibir mensagem de sucesso temporária
function showSuccessToast(message) {
  const toastContainer = document.getElementById('toast-container');
  
  // Criar container se não existir
  if (!toastContainer) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '1070';
    document.body.appendChild(container);
  }
  
  // Criar toast
  const toastId = 'toast-' + Date.now();
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = 'toast bg-success text-white';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="toast-body d-flex align-items-center">
      <i class="fas fa-check-circle me-2"></i>
      ${message}
      <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
    </div>
  `;
  
  // Adicionar ao container
  document.getElementById('toast-container').appendChild(toast);
  
  // Inicializar e mostrar toast
  const toastInstance = new bootstrap.Toast(toast, { delay: 3000 });
  toastInstance.show();
}

// Criar card de atividade
function createActivityCard(activity) {
  // Determinar a classe e ícone baseado no tipo
  let badgeClass = 'bg-primary';
  
  switch (activity.type) {
    case 'attraction':
      badgeClass = 'bg-success';
      break;
    case 'food':
      badgeClass = 'bg-warning text-dark';
      break;
    case 'tour':
      badgeClass = 'bg-info';
      break;
    case 'transport':
      badgeClass = 'bg-primary';
      break;
    case 'accommodation':
      badgeClass = 'bg-secondary';
      break;
  }
  
  // Converter o tipo para texto em português
  let typeText = 'Atividade';
  
  switch (activity.type) {
    case 'attraction':
      typeText = 'Atração';
      break;
    case 'food':
      typeText = 'Alimentação';
      break;
    case 'tour':
      typeText = 'Passeio';
      break;
    case 'transport':
      typeText = 'Transporte';
      break;
    case 'accommodation':
      typeText = 'Hospedagem';
      break;
  }
  
  // Formatar horário
  let timeText = 'Horário a definir';
  if (activity.startTime) {
    timeText = activity.startTime;
    if (activity.endTime) {
      timeText += ' - ' + activity.endTime;
    }
  }
  
  // Criar elemento card
  const card = document.createElement('div');
  card.className = 'kanban-card';
  card.id = activity.id;
  card.draggable = true;
  card.setAttribute('ondragstart', 'drag(event)');
  card.setAttribute('ondragend', 'dragEnd(event)');
  
  card.innerHTML = `
    <div class="kanban-card-header ${badgeClass.replace('bg-', 'bg-')} bg-opacity-25">
      <span class="badge rounded-pill ${badgeClass}">${typeText}</span>
      <div class="kanban-card-actions">
        <button class="btn btn-sm btn-link text-body p-0" onclick="editActivity('${activity.id}')">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="btn btn-sm btn-link text-danger p-0" onclick="removeActivity('${activity.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <div class="kanban-card-body">
      <h6>${activity.name}</h6>
      <p class="small text-muted mb-1"><i class="fas fa-clock me-1"></i> ${timeText}</p>
      <p class="small text-muted"><i class="fas fa-map-marker-alt me-1"></i> ${activity.location || 'Localização não definida'}</p>
    </div>
  `;
  
  // Adicionar ao container correto
  const dayId = activity.day || 1;
  const dayContainer = document.getElementById(`day-${dayId}`);
  const periodContainer = dayContainer.querySelector(`[data-period="${activity.period}"]`);
  periodContainer.appendChild(card);
}

// Adicionar atividade ao estado
function addActivityToState(activity) {
  // Implementação real adicionaria ao appState
  console.log('Adicionada nova atividade:', activity);
}

// Remover atividade
async function removeActivity(activityId) {
  if (confirm('Tem certeza que deseja remover esta atividade?')) {
    try {
      // Obter o ID sem o prefixo "activity-" se existir
      const id = activityId.replace('activity-', '');
      
      // Verificar se o itinerário é temporário
      if (appState.currentItinerary.id === 'temp-itinerary') {
        // Buscar o dia que contém a atividade
        let foundDay = null;
        let foundActivityIndex = -1;
        
        for (const day of appState.currentItinerary.days) {
          if (!day.activities) continue;
          
          const activityIndex = day.activities.findIndex(a => a.id === id);
          if (activityIndex !== -1) {
            foundDay = day;
            foundActivityIndex = activityIndex;
            break;
          }
        }
        
        // Remover do array de atividades
        if (foundDay && foundActivityIndex !== -1) {
          foundDay.activities.splice(foundActivityIndex, 1);
          
          // Renderizar novamente as atividades do dia
          renderActivitiesForDay(foundDay);
          
          console.log(`Atividade temporária ${id} removida`);
          showSuccessToast('Atividade removida com sucesso!');
        }
      } else {
        // Se for um itinerário salvo no banco, fazer requisição para API
        console.log('Removendo atividade via API');
        showLoadingState();
        
        // Encontrar o dia_id e informações sobre a atividade
        let dayId = null;
        let activityData = null;
        
        for (const day of appState.currentItinerary.days) {
          if (!day.activities) continue;
          
          const activity = day.activities.find(a => a.id.toString() === id.toString());
          if (activity) {
            dayId = day.id;
            activityData = activity;
            break;
          }
        }
        
        if (!dayId) {
          throw new Error('Não foi possível encontrar o dia da atividade');
        }
        
        // Fazer requisição DELETE para a API
        const response = await fetch(`/api/activities/${id}`, {
          method: 'DELETE'
        });
        
        hideLoadingState();
        
        if (!response.ok) {
          throw new Error(`Erro ao remover atividade: ${response.status}`);
        }
        
        console.log(`Atividade ${id} removida com sucesso`);
        
        // Atualizar o estado ao buscar o itinerário novamente
        await loadItineraryFromApi(appState.currentItinerary.id);
        
        showSuccessToast('Atividade removida com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao remover atividade:', error);
      hideLoadingState();
      showErrorMessage('Não foi possível remover a atividade. Tente novamente mais tarde.');
    }
  }
}

// Editar atividade
function editActivity(activityId) {
  // Implementação real abriria o formulário preenchido com os dados da atividade
  alert(`Função para editar atividade ${activityId} será implementada em breve.`);
}

// Adicionar novo dia
function addNewDay() {
  // Obter o número do próximo dia
  const daysTabsList = document.getElementById('days-tabs');
  const nextDayNumber = daysTabsList.querySelectorAll('.nav-item').length; // Descontar o botão de adicionar
  
  // Criar nova tab
  const newTabItem = document.createElement('li');
  newTabItem.className = 'nav-item';
  newTabItem.innerHTML = `
    <a class="nav-link" data-bs-toggle="tab" href="#day-${nextDayNumber}">
      Dia ${nextDayNumber}: ${formatDate(nextDayNumber - 1)}
    </a>
  `;
  daysTabsList.insertBefore(newTabItem, addDayBtn.parentElement);
  
  // Criar novo conteúdo de tab
  const tabContent = document.getElementById('days-content');
  const newTabContent = document.createElement('div');
  newTabContent.className = 'tab-pane fade';
  newTabContent.id = `day-${nextDayNumber}`;
  
  // Adicionar estrutura de kanban
  newTabContent.innerHTML = `
    <div class="kanban-board">
      <div class="kanban-column">
        <div class="kanban-column-header bg-primary bg-opacity-25">
          <h5><i class="fas fa-sun me-2"></i> Manhã</h5>
        </div>
        <div class="kanban-column-content" data-period="morning" data-day="${nextDayNumber}" ondrop="drop(event)" ondragover="allowDrop(event)">
        </div>
      </div>
      
      <div class="kanban-column">
        <div class="kanban-column-header bg-warning bg-opacity-25">
          <h5><i class="fas fa-cloud-sun me-2"></i> Tarde</h5>
        </div>
        <div class="kanban-column-content" data-period="afternoon" data-day="${nextDayNumber}" ondrop="drop(event)" ondragover="allowDrop(event)">
        </div>
      </div>
      
      <div class="kanban-column">
        <div class="kanban-column-header bg-info bg-opacity-25">
          <h5><i class="fas fa-moon me-2"></i> Noite</h5>
        </div>
        <div class="kanban-column-content" data-period="evening" data-day="${nextDayNumber}" ondrop="drop(event)" ondragover="allowDrop(event)">
        </div>
      </div>
      
      <div class="kanban-column">
        <div class="kanban-column-header bg-secondary bg-opacity-25">
          <h5><i class="fas fa-inbox me-2"></i> Não Agendado</h5>
        </div>
        <div class="kanban-column-content" data-period="unscheduled" data-day="${nextDayNumber}" ondrop="drop(event)" ondragover="allowDrop(event)">
        </div>
      </div>
    </div>
  `;
  
  tabContent.appendChild(newTabContent);
  
  // Atualizar o seletor de dias no formulário
  const daySelect = document.getElementById('activity-day');
  const newOption = document.createElement('option');
  newOption.value = nextDayNumber;
  newOption.textContent = `Dia ${nextDayNumber}: ${formatDate(nextDayNumber - 1)}`;
  daySelect.appendChild(newOption);
  
  // Salvar alterações
  saveToLocalStorage();
}

// Formatar data
function formatDate(daysToAdd) {
  const startDate = new Date('2025-05-05'); // Data base do primeiro dia
  const date = new Date(startDate);
  date.setDate(date.getDate() + daysToAdd);
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short'
  }).replace('.', '');
}

// Salvar para localStorage
function saveToLocalStorage() {
  // Implementação real salvaria o appState no localStorage
  console.log('Salvando alterações no localStorage');
}

// Carregar itinerário do banco de dados
async function loadFromLocalStorage() {
  try {
    console.log('Verificando dados do itinerário...');
    
    // Verificar se há um ID de itinerário na URL
    const urlParams = new URLSearchParams(window.location.search);
    const roteiroId = urlParams.get('roteiroId');
    
    if (roteiroId) {
      console.log(`Encontrado ID de roteiro na URL: ${roteiroId}`);
      await loadItineraryFromApi(roteiroId);
    } else {
      console.log('Nenhum ID de roteiro na URL. Usando dados de exemplo.');
      
      // Se não houver dados, usar dados iniciais de exemplo
      if (!appState.currentItinerary) {
        appState.currentItinerary = {
          id: 'temp-itinerary',
          title: 'Novo Roteiro',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          days: [
            { day_number: 1, date: new Date().toISOString().split('T')[0], activities: [] }
          ]
        };
      }
    }
    
    // Renderizar itinerário atual
    renderItineraryDetails();
    renderDayTabs();
  } catch (error) {
    console.error('Erro ao carregar itinerário:', error);
    showErrorMessage('Não foi possível carregar o roteiro. Tente novamente mais tarde.');
  }
}

// Carregar itinerário da API
async function loadItineraryFromApi(itineraryId) {
  try {
    // Exibir estado de carregamento
    showLoadingState();
    
    // Buscar dados do itinerário
    const response = await fetch(`/api/itineraries/${itineraryId}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar itinerário: ${response.status}`);
    }
    
    const itineraryData = await response.json();
    console.log('Dados do itinerário carregados:', itineraryData);
    
    // Atualizar o estado da aplicação
    appState.currentItinerary = itineraryData;
    
    // Esconder estado de carregamento
    hideLoadingState();
    
    return itineraryData;
  } catch (error) {
    hideLoadingState();
    console.error('Erro ao carregar itinerário da API:', error);
    showErrorMessage('Não foi possível carregar o roteiro. Tente novamente mais tarde.');
    throw error;
  }
}

// Exibir estado de carregamento
function showLoadingState() {
  const content = document.querySelector('.container-fluid');
  
  // Verificar se já existe um elemento de loading
  if (!document.getElementById('loading-overlay')) {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50';
    loadingOverlay.style.zIndex = '1050';
    
    loadingOverlay.innerHTML = `
      <div class="card p-4">
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
          <p class="mb-0">Carregando seu roteiro...</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(loadingOverlay);
  }
}

// Esconder estado de carregamento
function hideLoadingState() {
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}

// Exibir mensagem de erro
function showErrorMessage(message) {
  const content = document.querySelector('.container-fluid');
  
  const errorAlert = document.createElement('div');
  errorAlert.className = 'alert alert-danger alert-dismissible fade show my-3';
  errorAlert.setAttribute('role', 'alert');
  
  errorAlert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
  `;
  
  // Inserir no início do conteúdo
  content.insertBefore(errorAlert, content.firstChild);
}

// Renderizar detalhes do itinerário
function renderItineraryDetails() {
  if (!appState.currentItinerary) return;
  
  const itinerary = appState.currentItinerary;
  
  // Atualizar título e datas
  const titleElement = document.getElementById('itinerary-title');
  const dateElement = document.getElementById('itinerary-date');
  
  if (titleElement) {
    titleElement.textContent = `Planejando: ${itinerary.title || 'Novo Roteiro'}`;
  }
  
  if (dateElement && itinerary.start_date) {
    const startDate = new Date(itinerary.start_date);
    let dateText = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (itinerary.end_date) {
      const endDate = new Date(itinerary.end_date);
      dateText += ` - ${endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    
    dateElement.textContent = dateText;
  }
}

// Renderizar abas dos dias
function renderDayTabs() {
  if (!appState.currentItinerary || !appState.currentItinerary.days) return;
  
  const daysTabsContainer = document.getElementById('days-tabs');
  const daysContentContainer = document.getElementById('days-content');
  
  if (!daysTabsContainer || !daysContentContainer) return;
  
  // Limpar conteúdo atual (exceto o botão de adicionar dia)
  const addDayBtn = daysTabsContainer.querySelector('#add-day-btn');
  daysTabsContainer.innerHTML = '';
  daysContentContainer.innerHTML = '';
  
  if (addDayBtn) {
    const addDayItem = document.createElement('li');
    addDayItem.className = 'nav-item';
    addDayItem.appendChild(addDayBtn);
    daysTabsContainer.appendChild(addDayItem);
  }
  
  // Ordenar dias por número
  const days = [...appState.currentItinerary.days].sort((a, b) => a.day_number - b.day_number);
  
  // Criar abas e conteúdo para cada dia
  days.forEach((day, index) => {
    const isActive = index === 0;
    const dayNumber = day.day_number;
    const dayDate = day.date ? new Date(day.date) : null;
    
    let dateText = '';
    if (dayDate) {
      dateText = dayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
    
    // Criar aba
    const tabItem = document.createElement('li');
    tabItem.className = 'nav-item';
    tabItem.innerHTML = `
      <a class="nav-link ${isActive ? 'active' : ''}" 
         data-bs-toggle="tab" 
         href="#day-${dayNumber}"
         role="tab"
         aria-selected="${isActive ? 'true' : 'false'}">
        Dia ${dayNumber}${dateText ? ': ' + dateText : ''}
      </a>
    `;
    
    // Inserir antes do botão de adicionar dia
    if (addDayBtn && addDayBtn.parentElement) {
      daysTabsContainer.insertBefore(tabItem, addDayBtn.parentElement);
    } else {
      daysTabsContainer.appendChild(tabItem);
    }
    
    // Criar conteúdo do dia
    const dayContent = document.createElement('div');
    dayContent.className = `tab-pane fade ${isActive ? 'show active' : ''}`;
    dayContent.id = `day-${dayNumber}`;
    dayContent.setAttribute('role', 'tabpanel');
    dayContent.innerHTML = `
      <div class="kanban-board">
        <!-- Manhã -->
        <div class="kanban-column">
          <div class="kanban-column-header bg-primary bg-opacity-25">
            <h5><i class="fas fa-sun me-2"></i> Manhã</h5>
          </div>
          <div class="kanban-column-content" data-period="morning" data-day="${dayNumber}" ondrop="drop(event)" ondragover="allowDrop(event)">
            <!-- Cards de atividades da manhã serão adicionados aqui -->
          </div>
        </div>
        
        <!-- Tarde -->
        <div class="kanban-column">
          <div class="kanban-column-header bg-warning bg-opacity-25">
            <h5><i class="fas fa-cloud-sun me-2"></i> Tarde</h5>
          </div>
          <div class="kanban-column-content" data-period="afternoon" data-day="${dayNumber}" ondrop="drop(event)" ondragover="allowDrop(event)">
            <!-- Cards de atividades da tarde serão adicionados aqui -->
          </div>
        </div>
        
        <!-- Noite -->
        <div class="kanban-column">
          <div class="kanban-column-header bg-info bg-opacity-25">
            <h5><i class="fas fa-moon me-2"></i> Noite</h5>
          </div>
          <div class="kanban-column-content" data-period="evening" data-day="${dayNumber}" ondrop="drop(event)" ondragover="allowDrop(event)">
            <!-- Cards de atividades da noite serão adicionados aqui -->
          </div>
        </div>
        
        <!-- Não-agendado -->
        <div class="kanban-column">
          <div class="kanban-column-header bg-secondary bg-opacity-25">
            <h5><i class="fas fa-inbox me-2"></i> Não Agendado</h5>
          </div>
          <div class="kanban-column-content" data-period="unscheduled" data-day="${dayNumber}" ondrop="drop(event)" ondragover="allowDrop(event)">
            <!-- Cards de atividades não agendadas serão adicionados aqui -->
          </div>
        </div>
      </div>
    `;
    
    daysContentContainer.appendChild(dayContent);
  });
  
  // Renderizar atividades para cada dia
  days.forEach(day => {
    renderActivitiesForDay(day);
  });
}