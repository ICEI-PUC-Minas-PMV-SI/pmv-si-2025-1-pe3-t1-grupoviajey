import { renderSavedPlacesTab } from './roadmap-storage.js';
import { formatCurrencyInput, formatCurrency } from './roadmap-utils.js';
import { budgetStorage } from './roadmap-storage.js';
import { updateFinanceSummary, saveBudget } from './roadmap-finance.js';
import { initMultiChecklists, setupAddChecklistBlockBtn } from './roadmap-checklist.js';
import { saveRoadmapToStorage } from './roadmap-core.js';

// =============================================
// EVENTOS DE DRAG AND DROP
// =============================================

// Eventos de drag and drop para cards de local
export function handleLocalCardDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', ''); // necessário para Firefox
  // Seleciona o card e todos os .timeline-note/.timeline-expense imediatamente após
  const group = [this];
  let next = this.nextElementSibling;
  while (next && (next.classList.contains('timeline-note') || next.classList.contains('timeline-expense'))) {
    group.push(next);
    next = next.nextElementSibling;
  }
  window._draggedLocalCard = this;
  _draggedLocalCardGroup = group;
  setTimeout(() => this.classList.add('dragElem'), 0);
}

export function handleLocalCardDragOver(e) {
  e.preventDefault();
  this.classList.add('over');
  e.dataTransfer.dropEffect = 'move';
}

export function handleLocalCardDragLeave(e) {
  this.classList.remove('over');
}

export function handleLocalCardDrop(e) {
  e.preventDefault();
  this.classList.remove('over');
  const dragged = window._draggedLocalCard;
  const group = _draggedLocalCardGroup;
  if (!dragged || dragged === this || !group) return;
  if (dragged.classList.contains('local-card')) {
    // Insere todos os elementos do grupo antes do alvo
    for (let el of group) {
      this.parentNode.insertBefore(el, this);
      if (el.classList.contains('local-card') && typeof attachLocalCardActions === 'function') attachLocalCardActions(el);
    }
    afterLocalChange();
    if (typeof saveRoadmapToStorage === 'function') saveRoadmapToStorage();
  }
}

export function handleLocalCardDragEnd(e) {
  this.classList.remove('over');
  this.classList.remove('dragElem');
  window._draggedLocalCard = null;
  _draggedLocalCardGroup = null;
}

// Eventos de drag and drop para conteúdo do dia
export function handleDayContentDragOver(e) {
  e.preventDefault();
  this.classList.add('over');
  e.dataTransfer.dropEffect = 'move';
  // Abrir dia se estiver fechado
  if (this.style.display === 'none') {
    this.style.display = 'block';
  }
  // Auto scroll
  const mouseY = e.clientY;
  const scrollMargin = 60;
  const scrollSpeed = 18;
  clearInterval(autoScrollInterval);
  if (mouseY < scrollMargin) {
    autoScrollInterval = setInterval(() => window.scrollBy(0, -scrollSpeed), 16);
  } else if (window.innerHeight - mouseY < scrollMargin) {
    autoScrollInterval = setInterval(() => window.scrollBy(0, scrollSpeed), 16);
  }
}

export function handleDayContentDrop(e) {
  e.preventDefault();
  this.classList.remove('over');
  clearInterval(autoScrollInterval);
  const dragged = window._draggedLocalCard;
  const group = _draggedLocalCardGroup;
  if (!dragged || !group) return;
  let timeline = this.querySelector('.day-timeline');
  if (!timeline) {
    timeline = document.createElement('div');
    timeline.className = 'day-timeline';
    timeline.innerHTML = '<div class="timeline-line"></div>';
    const addBtn = this.querySelector('.add-place-btn');
    if (addBtn) {
      this.insertBefore(timeline, addBtn);
    } else {
      this.appendChild(timeline);
    }
  }
  // Adiciona todos os elementos do grupo ao final do timeline
  for (let el of group) {
    timeline.appendChild(el);
    if (el.classList.contains('local-card') && typeof attachLocalCardActions === 'function') attachLocalCardActions(el);
  }
  afterLocalChange();
  if (typeof saveRoadmapToStorage === 'function') saveRoadmapToStorage();
}

export function handleDayContentDragLeave(e) {
  this.classList.remove('over');
  clearInterval(autoScrollInterval);
}

// Eventos de drag and drop para cabeçalho do dia
export function handleDayHeaderDragOver(e) {
  e.preventDefault();
  const section = this.parentElement;
  const content = section.querySelector('.day-content');
  const arrow = this.querySelector('.day-arrow svg');

  // Abre o accordion se estiver fechado
  if (content) {
    content.style.display = 'block';
    content.classList.add('active');
    content.style.maxHeight = content.scrollHeight + 'px';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  }

  // Adiciona classe visual para feedback
  this.classList.add('over');
  e.dataTransfer.dropEffect = 'move';
}

// Adiciona também um handler de dragleave para remover a classe visual
export function handleDayHeaderDragLeave(e) {
  this.classList.remove('over');
}

// Adiciona um handler de drop para o header
export function handleDayHeaderDrop(e) {
  e.preventDefault();
  this.classList.remove('over');

  const dragged = window._draggedLocalCard;
  const group = _draggedLocalCardGroup;
  if (!dragged || !group) return;

  const section = this.parentElement;
  const content = section.querySelector('.day-content');
  if (!content) return;

  let timeline = content.querySelector('.day-timeline');
  if (!timeline) {
    timeline = document.createElement('div');
    timeline.className = 'day-timeline';
    timeline.innerHTML = '<div class="timeline-line"></div>';
    const addBtn = content.querySelector('.add-place-btn');
    if (addBtn) {
      content.insertBefore(timeline, addBtn);
    } else {
      content.appendChild(timeline);
    }
  }

  // Adiciona todos os elementos do grupo ao final do timeline
  for (let el of group) {
    timeline.appendChild(el);
    if (el.classList.contains('local-card') && typeof attachLocalCardActions === 'function') {
      attachLocalCardActions(el);
    }
  }
  afterLocalChange();
  if (typeof saveRoadmapToStorage === 'function') saveRoadmapToStorage();
}

// =============================================
// EVENTOS DE CHECKLIST
// =============================================

function handleChecklistItemDragStart(e) {
  // ... existing code ...
}

function handleChecklistItemDragOver(e) {
  // ... existing code ...
}

function handleChecklistItemDrop(e) {
  // ... existing code ...
}

// =============================================
// EVENTOS DE MAPA
// =============================================

function handleMapClick(e) {
  // ... existing code ...
}

function handleSearchAreaClick() {
  // ... existing code ...
}

// =============================================
// EVENTOS DE FINANÇAS
// =============================================

function handleBudgetInput(e) {
  // ... existing code ...
}

function handleSaveBudget() {
  // ... existing code ...
}

// =============================================
// EVENTOS DE TABS
// =============================================

function handleTabClick(e) {
  const tab = e.target.closest('.tab');
  if (!tab) return;

  console.log('[Checklist] Tab clicada:', tab.textContent.trim());

  // Remove active de todas as tabs
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  // Adiciona active na tab clicada
  tab.classList.add('active');

  // Esconde todos os conteúdos
  document.getElementById('tab-itinerary').style.display = 'none';
  document.getElementById('tab-checklist').style.display = 'none';
  document.getElementById('tab-saved-places').style.display = 'none';

  // Mostra o conteúdo correspondente
  if (tab.textContent.trim() === 'Roteiro') {
    document.getElementById('tab-itinerary').style.display = 'block';
  } else if (tab.textContent.trim() === 'Check-list') {
    console.log('[Checklist] Mostrando tab de checklist');
    document.getElementById('tab-checklist').style.display = 'block';
    // Garante que o checklist está inicializado
    const container = document.getElementById('checklistsContainer');
    if (container) {
      console.log('[Checklist] Container encontrado, inicializando...');
      if (container.children.length === 0) {
        initMultiChecklists();
        setupAddChecklistBlockBtn();
      } else {
        console.log('[Checklist] Container já tem conteúdo');
      }
    } else {
      console.error('[Checklist] Container não encontrado');
    }
  } else if (tab.textContent.trim() === 'Locais salvos') {
    document.getElementById('tab-saved-places').style.display = 'block';
    renderSavedPlacesTab();
  }
}

// =============================================
// INICIALIZAÇÃO DE EVENTOS
// =============================================

export function initEventListeners() {
  // Inicializa eventos de tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', handleTabClick);
  });

  // Inicializa eventos de accordion
  document.querySelectorAll('.day-header').forEach(header => {
    header.addEventListener('click', handleDayHeaderClick);
  });

  // Inicializa eventos de checklist
  const checklistTab = document.querySelector('.tab:nth-child(3)');
  if (checklistTab) {
    checklistTab.addEventListener('click', () => {
      console.log('[Checklist] Tab de checklist clicada');
      const container = document.getElementById('checklistsContainer');
      if (container) {
        console.log('[Checklist] Container encontrado, inicializando...');
        initMultiChecklists();
        setupAddChecklistBlockBtn();
      } else {
        console.error('[Checklist] Container não encontrado');
      }
    });
  }

  // Inicializa eventos de orçamento
  setupBudgetEventListeners();

  // Inicializa eventos de despesas
  setupExpenseEventListeners();

  // Inicializa eventos de notas
  setupNoteEventListeners();
}

// Função para inicializar o accordion
function initRoadmapAccordion() {
  const dayHeaders = document.querySelectorAll('.day-header');

  dayHeaders.forEach(header => {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.day-arrow');

    if (content) {
      content.style.transition = 'max-height 300ms ease-in-out';
      content.style.overflow = 'hidden';
      content.style.maxHeight = '0';
    }

    header.addEventListener('click', handleDayHeaderClick);
  });

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const content = mutation.target.closest('.day-content');
        if (content && content.classList.contains('active')) {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }
    });
  });

  document.querySelectorAll('.day-content').forEach(content => {
    observer.observe(content, {
      childList: true,
      characterData: true,
      subtree: true
    });
  });
}

// Variáveis globais para drag and drop
let dragSrcEl = null;
let _draggedLocalCardGroup = null;
let autoScrollInterval = null;
window._draggedLocalCard = null;

// Funções de drag and drop para cards
export function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
  this.classList.add('dragElem');
}

export function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  this.classList.add('over');
  e.dataTransfer.dropEffect = 'move';
  return false;
}

export function handleDragLeave(e) {
  this.classList.remove('over');
}

export function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation();
  if (dragSrcEl !== this) {
    this.parentNode.removeChild(dragSrcEl);
    let dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforebegin', dropHTML);
    let dropped = this.previousSibling;
    addDnDHandlers(dropped);
  }
  this.classList.remove('over');
  return false;
}

export function handleDragEnd(e) {
  this.classList.remove('over');
  this.classList.remove('dragElem');
}

export function addDnDHandlers(elem) {
  elem.addEventListener('dragstart', handleDragStart, false);
  elem.addEventListener('dragover', handleDragOver, false);
  elem.addEventListener('dragleave', handleDragLeave, false);
  elem.addEventListener('drop', handleDrop, false);
  elem.addEventListener('dragend', handleDragEnd, false);
}

export function addLocalCardDnDHandlers(card) {
  card.setAttribute('draggable', 'true');
  card.addEventListener('dragstart', handleLocalCardDragStart, false);
  card.addEventListener('dragover', handleLocalCardDragOver, false);
  card.addEventListener('dragleave', handleLocalCardDragLeave, false);
  card.addEventListener('drop', handleLocalCardDrop, false);
  card.addEventListener('dragend', handleLocalCardDragEnd, false);
}

export function addDayContentDnDHandlers(dayContent) {
  dayContent.addEventListener('dragover', handleDayContentDragOver, false);
  dayContent.addEventListener('drop', handleDayContentDrop, false);
  dayContent.addEventListener('dragleave', handleDayContentDragLeave, false);
}

export function addDayHeaderDnDHandlers(header) {
  header.addEventListener('dragover', handleDayHeaderDragOver, false);
  header.addEventListener('dragleave', handleDayHeaderDragLeave, false);
  header.addEventListener('drop', handleDayHeaderDrop, false);
}

// Inicializa drag and drop para todos os cards e dias
export function initLocalCardDnD() {
  document.querySelectorAll('.local-card').forEach(addLocalCardDnDHandlers);
  document.querySelectorAll('.day-content').forEach(addDayContentDnDHandlers);
  document.querySelectorAll('.day-header').forEach(addDayHeaderDnDHandlers);
}

// Função para salvar alterações após drag and drop
export function afterLocalChange() {
  if (typeof saveRoadmapToStorage === 'function') {
    const success = saveRoadmapToStorage();
    if (!success) {
      console.error('Failed to save roadmap after local change');
    }
  }
  if (typeof saveSavedPlacesToStorage === 'function') saveSavedPlacesToStorage();
}

// Variável global para armazenar o orçamento atual
let currentBudget = null;

// --- EVENT LISTENERS DE ORÇAMENTO ---
function setupBudgetEventListeners() {
  const saveBudgetBtn = document.getElementById('saveBudgetBtn');
  const budgetInput = document.getElementById('budgetInput');
  const budgetCurrency = document.getElementById('budgetCurrency');
  const budgetBtn = document.getElementById('budgetBtn');
  const budgetDropdown = document.getElementById('budgetDropdown');

  if (budgetBtn && budgetDropdown) {
    budgetBtn.addEventListener('click', () => {
      budgetDropdown.classList.toggle('show');
    });

    // Fecha o dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      if (!budgetBtn.contains(e.target) && !budgetDropdown.contains(e.target)) {
        budgetDropdown.classList.remove('show');
      }
    });
  }

  if (saveBudgetBtn && budgetInput && budgetCurrency) {
    // Formata o input de orçamento
    budgetInput.addEventListener('input', function () {
      formatCurrencyInput(this, budgetCurrency.value);
    });

    budgetCurrency.addEventListener('change', function () {
      formatCurrencyInput(budgetInput, this.value);
    });

    saveBudgetBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const value = parseFloat(budgetInput.value.replace(/[^\d,\.]/g, '').replace(',', '.'));
      const currency = budgetCurrency.value || 'BRL';

      if (value <= 0) {
        alert('Por favor, insira um valor válido maior que zero.');
        return;
      }

      const success = saveBudget(value, currency);
      if (success) {
        // Fecha o dropdown
        if (budgetDropdown) {
          budgetDropdown.classList.remove('show');
        }

        // Feedback visual
        saveBudgetBtn.textContent = 'Salvo!';
        setTimeout(() => {
          saveBudgetBtn.textContent = 'Salvar';
        }, 2000);
      } else {
        alert('Erro ao salvar o orçamento. Por favor, tente novamente.');
      }
    });
  }
}

// --- EVENT LISTENERS DE GASTOS ---
function setupExpenseEventListeners() {
  // Atualiza ao adicionar/remover gastos
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('save-expense-btn') || e.target.classList.contains('delete-expense-btn')) {
      setTimeout(updateFinanceSummary, 50);
    }
  });

  // Atualiza ao remover local (pode conter gastos)
  document.addEventListener('click', function (e) {
    if (e.target.closest('.remove-place-btn')) {
      setTimeout(updateFinanceSummary, 50);
    }
  });
}

// --- EVENT LISTENERS DE ANOTAÇÕES ---
function setupNoteEventListeners() {
  // Event listeners específicos para anotações podem ser adicionados aqui
  // Por enquanto, a lógica está encapsulada nas funções attachNoteActions
}

// Função auxiliar para parse de moeda
function parseCurrencyToNumber(str) {
  if (!str) return 0;
  // Remove o código da moeda (BRL, USD, EUR) e espaços extras
  str = str.replace(/(BRL|USD|EUR)/g, '').trim();
  // Remove tudo que não for número, vírgula ou ponto
  str = str.replace(/[^\d,\.]/g, '');
  // Troca vírgula por ponto se necessário
  if (str.indexOf(',') > -1 && str.indexOf('.') === -1) {
    str = str.replace(',', '.');
  } else if (str.indexOf('.') > -1 && str.indexOf(',') > -1) {
    // Ex: 1.234,56 -> 1234.56
    str = str.replace(/\./g, '').replace(',', '.');
  }
  return parseFloat(str) || 0;
}

export function attachRoadmapEventListeners() {
  // Event listeners para tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', handleTabClick);
  });

  // Inicializa o accordion
  initRoadmapAccordion();

  // Inicializa drag and drop para cards
  initLocalCardDnD();

  // Debug: quantos accordions existem?
  const headers = document.querySelectorAll('.day-header');
  console.log('[DEBUG] attachRoadmapEventListeners: .day-header encontrados:', headers.length);
}

// =============================================
// EVENTOS GLOBAIS E DE TABS
// =============================================

// Funções de eventos do roadmap

function handleDayHeaderClick(e) {
  const header = e.currentTarget;
  const content = header.nextElementSibling;
  const arrow = header.querySelector('.day-arrow svg');

  if (content) {
    const isOpen = header.classList.contains('active');

    if (isOpen) {
      content.style.maxHeight = '0';
      header.classList.remove('active');
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    } else {
      content.style.maxHeight = content.scrollHeight + 'px';
      header.classList.add('active');
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
  }
}
