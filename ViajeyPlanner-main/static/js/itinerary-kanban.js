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
function saveNewActivity() {
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
  
  // Criar novo ID único
  const newId = 'activity-' + Date.now();
  
  // Criar dados da atividade
  const newActivity = {
    id: newId,
    name: nameInput.value.trim(),
    type: typeInput.value,
    location: locationInput.value.trim(),
    day: dayInput.value,
    period: periodInput.value,
    startTime: startTimeInput.value,
    endTime: endTimeInput.value,
    notes: notesInput.value.trim()
  };
  
  // Criar elemento HTML para a nova atividade
  createActivityCard(newActivity);
  
  // Adicionar ao app state
  addActivityToState(newActivity);
  
  // Resetar formulário e fechar modal
  document.getElementById('add-activity-form').reset();
  bootstrap.Modal.getInstance(document.getElementById('add-activity-modal')).hide();
  
  // Salvar alterações
  saveToLocalStorage();
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
function removeActivity(activityId) {
  if (confirm('Tem certeza que deseja remover esta atividade?')) {
    // Remover elemento HTML
    const activityEl = document.getElementById(activityId);
    if (activityEl) {
      activityEl.remove();
    }
    
    // Remover do app state
    // Implementação real removeria do appState
    
    // Salvar alterações
    saveToLocalStorage();
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

// Carregar do localStorage
function loadFromLocalStorage() {
  // Implementação real carregaria do localStorage
  console.log('Carregando dados do localStorage');
  
  // Se não houver dados, usar dados iniciais de exemplo
  if (!appState.currentItinerary) {
    appState.currentItinerary = {
      id: 'itinerary-123',
      title: 'Férias em Paris',
      startDate: '2025-05-05',
      endDate: '2025-05-12',
      days: [
        { dayNumber: 1, date: '2025-05-05', activities: [] },
        { dayNumber: 2, date: '2025-05-06', activities: [] },
        { dayNumber: 3, date: '2025-05-07', activities: [] }
      ]
    };
  }
}