  function getTrashSVG() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8.5V14.5C6 15.3284 6.67157 16 7.5 16H12.5C13.3284 16 14 15.3284 14 14.5V8.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 5.5H16" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M8.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M11.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M7 5.5V4.5C7 3.94772 7.44772 3.5 8 3.5H12C12.5523 3.5 13 3.94772 13 4.5V5.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  }

// Funções auxiliares de drag-and-drop (escopo global)
let dragSrcEl = null;
function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
  this.classList.add('dragElem');
}
function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  this.classList.add('over');
  e.dataTransfer.dropEffect = 'move';
  return false;
}
function handleDragLeave(e) {
  this.classList.remove('over');
}
function handleDrop(e) {
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
function handleDragEnd(e) {
  this.classList.remove('over');
  this.classList.remove('dragElem');
}
function addDnDHandlers(elem) {
  elem.addEventListener('dragstart', handleDragStart, false);
  elem.addEventListener('dragover', handleDragOver, false);
  elem.addEventListener('dragleave', handleDragLeave, false);
  elem.addEventListener('drop', handleDrop, false);
  elem.addEventListener('dragend', handleDragEnd, false);
}

function attachRoadmapEventListeners() {
  // Accordion para day-section
  document.querySelectorAll('.day-header').forEach(header => {
    header.addEventListener('click', function() {
      const section = header.parentElement;
      const content = section.querySelector('.day-content');
      const arrow = header.querySelector('.day-arrow svg');
      if (content.style.display === 'none' || !content.style.display) {
        content.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
      } else {
        content.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
      }
    });
  });
  // Inicialmente fecha todos menos o primeiro
  document.querySelectorAll('.day-section').forEach((section, idx) => {
    const content = section.querySelector('.day-content');
    const arrow = section.querySelector('.day-arrow svg');
    if (idx === 0) {
      content.style.display = 'block';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      content.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  });
  // Alternar tabs
  document.querySelectorAll('.tab').forEach((tab, idx) => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-itinerary').style.display = idx === 0 ? 'flex' : 'none';
      document.getElementById('tab-checklist').style.display = idx === 1 ? 'block' : 'none';
    });
  });
  // Drag and drop checklist
  document.querySelectorAll('.checklist-item').forEach(addDnDHandlers);
}

document.addEventListener('DOMContentLoaded', function() {

  function createNoteDiv(value) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'timeline-note';
    noteDiv.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="10" rx="2" fill="none" stroke="#222" stroke-width="1.3"/><path d="M6 8h8M6 12h5" stroke="#222" stroke-width="1.1" stroke-linecap="round"/></svg>
      <span class="note-text">${value}</span>
      <button class="edit-note-btn" title="Editar anotação">
        <svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 14.5V16h1.5l8.1-8.1-1.5-1.5L4 14.5zM15.7 6.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.1 1.1 3 3 1.1-1.1z" fill="#0a7c6a"/></svg>
      </button>
      <button class="delete-note-btn" title="Excluir anotação">${getTrashSVG()}</button>
    `;
    return noteDiv;
  }

  function createExpenseDiv(value, currency) {
    const expenseDiv = document.createElement('div');
    expenseDiv.className = 'timeline-expense';
    expenseDiv.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="#222" stroke-width="1.3"/><path d="M10 6v8M7 10h6" stroke="#222" stroke-width="1.1" stroke-linecap="round"/></svg>
      <span class="expense-text">${value} ${currency}</span>
      <button class="edit-expense-btn" title="Editar gasto">
        <svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 14.5V16h1.5l8.1-8.1-1.5-1.5L4 14.5zM15.7 6.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.1 1.1 3 3 1.1-1.1z" fill="#0a7c6a"/></svg>
      </button>
      <button class="delete-expense-btn" title="Excluir gasto">${getTrashSVG()}</button>
    `;
    return expenseDiv;
  }

  function formatCurrencyInput(input, currency) {
    let value = input.value.replace(/\D/g, '');
    if (!value) {
      input.value = '';
      return;
    }
    let number = Number(value) / 100;
    let locale = 'pt-BR';
    if (currency === 'USD') locale = 'en-US';
    if (currency === 'EUR') locale = 'de-DE';
    input.value = number.toLocaleString(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
  }

  // Função utilitária para criar o drag handle SVG
  function getDragHandleSVG() {
    return `<span class="drag-handle" title="Arraste para mover">&#9776;</span>`;
  }

  // Defina essas funções ANTES de attachLocalCardActions

  function attachNoteActions(noteDiv, card) {
    noteDiv.querySelector('.edit-note-btn').onclick = function() {
      if (card.nextElementSibling && card.nextElementSibling.classList.contains('note-inline-form')) return;
      const value = noteDiv.querySelector('.note-text').textContent;
      const form = document.createElement('div');
      form.className = 'note-inline-form';
      form.innerHTML = `
        <textarea class="note-input" rows="2">${value}</textarea>
        <div class="note-actions">
          <button class="cancel-note-btn">Cancelar</button>
          <button class="save-note-btn">Salvar</button>
        </div>
      `;
      card.parentNode.insertBefore(form, card.nextElementSibling);
      form.querySelector('.note-input').focus();
      form.querySelector('.cancel-note-btn').onclick = function(e) { if (e) e.stopPropagation(); form.remove(); };
      form.querySelector('.save-note-btn').onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const newValue = form.querySelector('.note-input').value.trim();
        if (newValue) {
          const newNoteDiv = createNoteDiv(newValue);
          card.parentNode.insertBefore(newNoteDiv, form.nextElementSibling);
          attachNoteActions(newNoteDiv, card);
        }
        noteDiv.remove();
        form.remove();
        if (typeof closeAddPlaceModal === 'function') closeAddPlaceModal();
      };
    };
    noteDiv.querySelector('.delete-note-btn').onclick = function() { noteDiv.remove(); };
  }

  function attachExpenseActions(expenseDiv, card) {
    expenseDiv.querySelector('.edit-expense-btn').onclick = function() {
      let next = card.nextElementSibling;
      if (next && next.classList.contains('note-inline-form')) next = next.nextElementSibling;
      if (next && next.classList.contains('expense-inline-form')) return;
      const value = expenseDiv.querySelector('.expense-text').textContent.split(' ')[0];
      const currency = expenseDiv.querySelector('.expense-text').textContent.split(' ')[1];
      const form = document.createElement('div');
      form.className = 'expense-inline-form';
      form.innerHTML = `
        <div class="expense-input-row">
          <input type="text" class="expense-input" value="${value}" inputmode="numeric">
          <select class="expense-currency-select">
            <option value="BRL" ${currency === 'BRL' ? 'selected' : ''}>BRL</option>
            <option value="USD" ${currency === 'USD' ? 'selected' : ''}>USD</option>
            <option value="EUR" ${currency === 'EUR' ? 'selected' : ''}>EUR</option>
          </select>
        </div>
        <div class="note-actions">
          <button class="cancel-expense-btn">Cancelar</button>
          <button class="save-expense-btn">Salvar</button>
        </div>
      `;
      let insertAfter = card;
      if (card.nextElementSibling && card.nextElementSibling.classList.contains('timeline-note')) {
        insertAfter = card.nextElementSibling;
      }
      insertAfter.parentNode.insertBefore(form, insertAfter.nextElementSibling);
      const input = form.querySelector('.expense-input');
      const select = form.querySelector('.expense-currency-select');
      input.addEventListener('input', function() { formatCurrencyInput(input, select.value); });
      select.addEventListener('change', function() { formatCurrencyInput(input, select.value); });
      form.querySelector('.cancel-expense-btn').onclick = function(e) { if (e) e.stopPropagation(); form.remove(); };
      form.querySelector('.save-expense-btn').onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        const value = input.value.trim();
        const currency = select.value;
        if (value) {
          const newExpenseDiv = createExpenseDiv(value, currency);
          form.parentNode.insertBefore(newExpenseDiv, form.nextElementSibling);
          attachExpenseActions(newExpenseDiv, card);
        }
        expenseDiv.remove();
        form.remove();
        if (typeof closeAddPlaceModal === 'function') {
          closeAddPlaceModal();
        } else {
          const modal = document.getElementById('addPlaceModal');
          if (modal) modal.style.display = 'none';
        }
      };
    };
    expenseDiv.querySelector('.delete-expense-btn').onclick = function() { expenseDiv.remove(); };
  }

  function attachLocalCardActions(card) {
    // Adiciona o drag handle se não existir
    if (!card.querySelector('.drag-handle')) {
      card.insertAdjacentHTML('afterbegin', getDragHandleSVG());
    }
    addLocalCardDnDHandlers(card);
    const noteBtn = card.querySelector('.local-note-btn');
    if (noteBtn) {
      noteBtn.addEventListener('click', function() {
      if (card.nextElementSibling && card.nextElementSibling.classList.contains('note-inline-form')) return;
      const form = document.createElement('div');
      form.className = 'note-inline-form';
      form.innerHTML = `
          <textarea class="note-input" rows="2" placeholder="Digite sua anotação..."></textarea>
        <div class="note-actions">
          <button class="cancel-note-btn">Cancelar</button>
          <button class="save-note-btn">Salvar</button>
        </div>
      `;
      card.parentNode.insertBefore(form, card.nextElementSibling);
      form.querySelector('.note-input').focus();
        form.querySelector('.cancel-note-btn').onclick = function(e) {
          if (e) e.stopPropagation();
          form.remove();
        };
      form.querySelector('.save-note-btn').onclick = function(e) {
        e.preventDefault();
          e.stopPropagation();
          const value = form.querySelector('.note-input').value.trim();
          if (value) {
            const noteDiv = createNoteDiv(value);
            card.parentNode.insertBefore(noteDiv, form.nextElementSibling);
            attachNoteActions(noteDiv, card);
          }
        form.remove();
          // Fecha o modal principal SEMPRE ao salvar
          if (typeof closeAddPlaceModal === 'function') {
            closeAddPlaceModal();
          } else {
            const modal = document.getElementById('addPlaceModal');
            if (modal) modal.style.display = 'none';
          }
        };
      });
    }
    const expenseBtn = card.querySelector('.local-expense-btn');
    if (expenseBtn) {
      expenseBtn.addEventListener('click', function() {
      // Garante que só um campo de gastos fique aberto
      let next = card.nextElementSibling;
      if (next && next.classList.contains('note-inline-form')) next = next.nextElementSibling;
      if (next && next.classList.contains('expense-inline-form')) return;
        // Cria campo de gastos
      const form = document.createElement('div');
      form.className = 'expense-inline-form';
      form.innerHTML = `
        <div class="expense-input-row">
            <input type="text" class="expense-input" placeholder="Valor do gasto" inputmode="numeric">
          <select class="expense-currency-select">
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
          </select>
        </div>
        <div class="note-actions">
          <button class="cancel-expense-btn">Cancelar</button>
          <button class="save-expense-btn">Salvar</button>
        </div>
      `;
      // Insere sempre depois da anotação, se houver, senão depois do card
      let insertAfter = card;
      if (card.nextElementSibling && card.nextElementSibling.classList.contains('timeline-note')) {
        insertAfter = card.nextElementSibling;
      }
      insertAfter.parentNode.insertBefore(form, insertAfter.nextElementSibling);
      const input = form.querySelector('.expense-input');
      const select = form.querySelector('.expense-currency-select');
      input.addEventListener('input', function() { formatCurrencyInput(input, select.value); });
      select.addEventListener('change', function() { formatCurrencyInput(input, select.value); });
        form.querySelector('.cancel-expense-btn').onclick = function(e) {
          if (e) e.stopPropagation();
          form.remove();
        };
      form.querySelector('.save-expense-btn').onclick = function(e) {
        e.preventDefault();
          e.stopPropagation();
        const value = input.value.trim();
        const currency = select.value;
        if (value) {
            const expenseDiv = createExpenseDiv(value, currency);
            form.parentNode.insertBefore(expenseDiv, form.nextElementSibling);
            attachExpenseActions(expenseDiv, card);
          }
        form.remove();
          // Fecha o modal principal SEMPRE ao salvar
          if (typeof closeAddPlaceModal === 'function') {
            closeAddPlaceModal();
          } else {
            const modal = document.getElementById('addPlaceModal');
            if (modal) modal.style.display = 'none';
          }
        };
      });
    }
  }

  document.querySelectorAll('.local-card').forEach(attachLocalCardActions);

  // Para anotações já existentes (caso haja)
  document.querySelectorAll('.timeline-note').forEach(function(noteDiv) {
    const card = noteDiv.previousElementSibling && noteDiv.previousElementSibling.classList.contains('local-card') ? noteDiv.previousElementSibling : null;
    if (card) attachNoteActions(noteDiv, card);
  });
  document.querySelectorAll('.timeline-expense').forEach(function(expenseDiv) {
    const card = expenseDiv.previousElementSibling;
    while (card && !card.classList.contains('local-card')) card = card.previousElementSibling;
    if (card) attachExpenseActions(expenseDiv, card);
  });

  // Checklist: adicionar e remover itens
  const checklistList = document.getElementById('checklistList');
  const addChecklistForm = document.getElementById('addChecklistForm');
  const newChecklistInput = document.getElementById('newChecklistInput');

  function addChecklistItem(text) {
    const li = document.createElement('li');
    li.className = 'checklist-item';
    li.setAttribute('draggable', 'true');
    li.innerHTML = `
      <span class="drag-handle" title="Arraste para mover">&#9776;</span>
      <label><input type="checkbox"> ${text}</label>
      <button class="remove-checklist-btn" title="Remover item">${getTrashSVG()}</button>
    `;
    checklistList.appendChild(li);
    addChecklistDnDHandlers(li);
    li.querySelector('.remove-checklist-btn').onclick = function() { li.remove(); };
  }

  if (addChecklistForm) {
    addChecklistForm.onsubmit = function(e) {
      e.preventDefault();
      const value = newChecklistInput.value.trim();
      if (value) {
        addChecklistItem(value);
        newChecklistInput.value = '';
        newChecklistInput.focus();
      }
    };
  }

  document.querySelectorAll('.remove-checklist-btn').forEach(btn => {
    btn.onclick = function() { btn.closest('.checklist-item').remove(); };
  });

  // Drag and drop para novos itens
  function addChecklistDnDHandlers(elem) {
    elem.addEventListener('dragstart', handleDragStart, false);
    elem.addEventListener('dragover', handleDragOver, false);
    elem.addEventListener('dragleave', handleDragLeave, false);
    elem.addEventListener('drop', handleDrop, false);
    elem.addEventListener('dragend', handleDragEnd, false);
  }
  document.querySelectorAll('.checklist-item').forEach(addChecklistDnDHandlers);

  // --- INÍCIO MAPA ---
  (async function initRoadmapMap() {
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    const destElem = document.getElementById('tripDestinationBanner');
    let cidade = destElem ? destElem.textContent.trim() : 'Florianópolis';
    if (!cidade) cidade = 'Florianópolis';
    try {
      const loader = await import('../../js/core/map/loader.js');
      const mapConfig = await import('../search-results/map-config.js');
      await loader.loadGoogleMapsScript();
      await mapConfig.initializeMapWithCity(cidade);
      console.log('window.map:', window.map);
      // --- Clique em POI do Google: criar pin customizado com InfoWindow customizado ---
      const { createMarker } = await import('../../js/core/map/markers.js');
      const createdPoiMarkers = new Set();
      window.map.addListener('click', function(event) {
        if (event.placeId) {
          // Evita navegação padrão
          event.stop();
          // Não duplique markers para o mesmo placeId
          if (createdPoiMarkers.has(event.placeId)) return;
          const service = new window.google.maps.places.PlacesService(window.map);
          service.getDetails({ placeId: event.placeId, fields: ['name', 'formatted_address', 'geometry'] }, function(place, status) {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
              // Cria marker customizado
              const marker = createMarker(window.map, {
                name: place.name,
                vicinity: place.formatted_address,
                geometry: { location: place.geometry.location },
                types: [],
              });
              createdPoiMarkers.add(event.placeId);
              // Abre o InfoWindow customizado imediatamente
              window.google.maps.event.trigger(marker, 'click');
            }
          });
        }
      });
    } catch (e) {
      console.error('Erro ao inicializar mapa:', e);
    }
  })();
  // --- FIM MAPA ---

  // Remover local ao clicar na lixeira
  document.querySelectorAll('.remove-place-btn').forEach(btn => {
    btn.onclick = function() {
      const card = btn.closest('.local-card');
      if (card) card.remove();
    };
  });

  // --- RESUMO FINANCEIRO ---
  function parseCurrencyToNumber(str) {
    if (!str) return 0;
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

  function getAllExpenses() {
    // Busca todos os elementos de gasto
    const expenses = Array.from(document.querySelectorAll('.timeline-expense .expense-text'));
    return expenses.map(e => parseCurrencyToNumber(e.textContent));
  }

  // --- ORÇAMENTO: Salvar, exibir e persistir ---
  let currentBudget = null;
  // Carregar orçamento salvo ao iniciar
  function loadBudgetFromStorage() {
    const stored = localStorage.getItem('userRoadmapBudget');
    if (stored) {
      try {
        currentBudget = JSON.parse(stored);
        const summaryBudget = document.getElementById('summaryBudget');
        const summaryBudgetValue = document.getElementById('summaryBudgetValue');
        if (currentBudget && summaryBudget && summaryBudgetValue) {
          summaryBudget.style.display = '';
          summaryBudgetValue.textContent = `${currentBudget.text}`;
        }
      } catch (e) { currentBudget = null; }
    }
  }
  loadBudgetFromStorage();

  // Atualizar getBudgetInfo para usar currentBudget
  function getBudgetInfo() {
    if (!currentBudget) return null;
    return { value: currentBudget.value, text: currentBudget.text };
  }

  function updateFinanceSummary() {
    const financeRow = document.getElementById('financeSummaryRow');
    const spentValue = document.getElementById('summarySpentValue');
    const budgetDiv = document.getElementById('summaryBudget');
    const budgetValue = document.getElementById('summaryBudgetValue');
    const availableDiv = document.getElementById('summaryAvailableRow');
    const availableValue = document.getElementById('summaryAvailableValue');
    if (!financeRow || !spentValue) return;
    const expenses = getAllExpenses();
    const totalSpent = expenses.reduce((a, b) => a + b, 0);
    spentValue.textContent = totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const budget = getBudgetInfo();
    if (budget && budget.value > 0) {
      budgetDiv.style.display = '';
      budgetValue.textContent = budget.text.replace('Orçamento total: ', '');
      availableDiv.style.display = '';
      const available = budget.value - totalSpent;
      availableValue.textContent = available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    } else {
      budgetDiv.style.display = 'none';
      availableDiv.style.display = 'none';
    }
    financeRow.style.display = '';
  }

  // Atualiza ao adicionar/remover gastos
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('save-expense-btn') || e.target.classList.contains('delete-expense-btn')) {
      setTimeout(updateFinanceSummary, 50);
    }
  });
  // Atualiza ao salvar orçamento
  const saveBudgetBtn = document.getElementById('saveBudgetBtn');
  const budgetInput = document.getElementById('budgetInput');
  const budgetCurrency = document.getElementById('budgetCurrency');
  if (saveBudgetBtn && budgetInput && budgetCurrency) {
    saveBudgetBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const value = budgetInput.value;
      const currency = budgetCurrency.value;
      const summaryBudget = document.getElementById('summaryBudget');
      const summaryBudgetValue = document.getElementById('summaryBudgetValue');
      if (value && summaryBudget && summaryBudgetValue) {
        summaryBudget.style.display = '';
        summaryBudgetValue.textContent = `${value} (${currency})`;
        // Salva o orçamento atual para uso no resumo e persiste
        currentBudget = {
          value: parseCurrencyToNumber(value),
          text: `${value} (${currency})`
        };
        localStorage.setItem('userRoadmapBudget', JSON.stringify(currentBudget));
      }
      // Fecha o dropdown
      const budgetDropdown = document.getElementById('budgetDropdown');
      if (budgetDropdown) budgetDropdown.classList.remove('show');
      setTimeout(updateFinanceSummary, 50);
    });
  }
  // Atualiza ao remover local (pode conter gastos)
  document.addEventListener('click', function(e) {
    if (e.target.closest('.remove-place-btn')) {
      setTimeout(updateFinanceSummary, 50);
    }
  });
  // Atualiza ao carregar a página
  setTimeout(updateFinanceSummary, 200);
  // --- FIM RESUMO FINANCEIRO ---

  // --- MODAL ADICIONAR LOCAL ---
  // Variável global para guardar o último place selecionado no autocomplete
  let lastSelectedPlace = null;

  function initModalAutocomplete(cityName) {
    const input = document.getElementById('autocomplete');
    if (input && window.google && window.google.maps) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: cityName }, function(results, status) {
        if (status === 'OK' && results[0]) {
          const bounds = results[0].geometry.viewport;
          const autocomplete = new google.maps.places.Autocomplete(input, {
            bounds: bounds,
            strictBounds: true
          });
          input.autocomplete = autocomplete;
          // Salva o último place selecionado
          autocomplete.addListener('place_changed', function() {
            lastSelectedPlace = autocomplete.getPlace();
          });
        } else {
          // fallback: autocomplete sem bounds
          const autocomplete = new google.maps.places.Autocomplete(input);
          input.autocomplete = autocomplete;
          autocomplete.addListener('place_changed', function() {
            lastSelectedPlace = autocomplete.getPlace();
          });
        }
      });
    }
  }

  function openAddPlaceModal() {
    const modal = document.getElementById('addPlaceModal');
    const container = document.getElementById('modalSearchBarContainer');
    if (modal && container) {
      // Limpa conteúdo anterior
      container.innerHTML = '';
      // Insere search bar reutilizando o HTML COMPLETO do componente
      fetch('/components/search-bar/search-bar.html')
        .then(resp => resp.text())
        .then(html => {
          container.innerHTML = html;
          // Remove calendário e botão pesquisar do modal
          const calendarBtn = container.querySelector('.calendar-btn');
          if (calendarBtn) calendarBtn.style.display = 'none';
          const searchBtn = container.querySelector('.search-btn');
          if (searchBtn) searchBtn.style.display = 'none';
          // Garante que o CSS da search-bar está aplicado
          if (!document.querySelector('link[href*="search-bar/search-bar.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/components/search-bar/search-bar.css';
            document.head.appendChild(link);
          }
          // Pega o destino do banner SEMPRE ATUALIZADO
          const city = document.querySelector('#tripDestinationBanner')?.textContent?.trim() || '';
          if (window.google && window.google.maps) {
            initModalAutocomplete(city);
          } else {
            // Aguarda Google Maps carregar
            let interval = setInterval(() => {
              if (window.google && window.google.maps) {
                clearInterval(interval);
                initModalAutocomplete(city);
              }
            }, 100);
          }
        });
      modal.style.display = 'flex';
    }
  }
  function closeAddPlaceModal() {
    const modal = document.getElementById('addPlaceModal');
    if (modal) modal.style.display = 'none';
  }
  let lastAddPlaceDayContent = null;

  // Adicione este bloco logo após o DOMContentLoaded:
  document.addEventListener('click', function(e) {
    // Delegação para todos os botões .add-place-btn
    if (e.target.classList.contains('add-place-btn')) {
      e.preventDefault();
      // Garante que está pegando o botão correto mesmo se for um filho (ex: <span> dentro do botão)
      const btn = e.target.closest('.add-place-btn');
      if (!btn) return;
      lastAddPlaceDayContent = btn.closest('.day-content');
      openAddPlaceModal();
    }
    });

  // Lógica do botão Adicionar do modal
  const confirmBtn = document.getElementById('confirmAddPlaceModal');
  if (confirmBtn) {
    confirmBtn.onclick = function() {
      const input = document.getElementById('autocomplete');
      let placeName = '';
      let placeAddress = '';
      let placeRating = null;
      // Usa o último place selecionado se houver
      if (lastSelectedPlace) {
        if (lastSelectedPlace.name) {
          placeName = lastSelectedPlace.name;
        } else {
          placeName = input ? input.value.trim() : '';
        }
        if (lastSelectedPlace.formatted_address) {
          placeAddress = lastSelectedPlace.formatted_address;
        } else if (lastSelectedPlace.vicinity) {
          placeAddress = lastSelectedPlace.vicinity;
        } else {
          placeAddress = '';
        }
        if (lastSelectedPlace.rating) {
          placeRating = lastSelectedPlace.rating;
        }
      } else {
        // fallback: só nome
        placeName = input ? input.value.trim() : '';
        placeAddress = '';
      }
      if (placeName && lastAddPlaceDayContent) {
        // Remove a mensagem de vazio, se existir
        const emptyMsg = lastAddPlaceDayContent.querySelector('.place-card.empty');
        if (emptyMsg) emptyMsg.remove();
        // Garante que existe .day-timeline
        let timeline = lastAddPlaceDayContent.querySelector('.day-timeline');
        const addBtn = lastAddPlaceDayContent.querySelector('.add-place-btn');
        if (!timeline) {
          timeline = document.createElement('div');
          timeline.className = 'day-timeline';
          timeline.innerHTML = '<div class="timeline-line"></div>';
          if (addBtn) {
            lastAddPlaceDayContent.insertBefore(timeline, addBtn);
          } else {
            lastAddPlaceDayContent.appendChild(timeline);
          }
        } else if (addBtn && addBtn.parentElement === timeline) {
          lastAddPlaceDayContent.appendChild(addBtn);
        }
        // Cria card de local igual aos existentes
        const card = document.createElement('div');
        card.className = 'local-card';
        // Monta rating dinâmico
        let ratingHtml = '';
        if (placeRating) {
          const stars = '★'.repeat(Math.round(placeRating)) + '☆'.repeat(5 - Math.round(placeRating));
          ratingHtml = `<div class="local-rating"><span class="stars">${stars}</span></div>`;
        } else {
          ratingHtml = '';
        }
        card.innerHTML = `
          ${getDragHandleSVG()}
          <button class="remove-place-btn" title="Remover local">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8.5V14.5C6 15.3284 6.67157 16 7.5 16H12.5C13.3284 16 14 15.3284 14 14.5V8.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 5.5H16" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M8.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M11.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M7 5.5V4.5C7 3.94772 7.44772 3.5 8 3.5H12C12.5523 3.5 13 3.94772 13 4.5V5.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="local-img"></div>
          <div class="local-info">
            <div class="local-title">${placeName}</div>
            <div class="local-address">${placeAddress || ''}</div>
            ${ratingHtml}
            <div class="local-actions">
              <button class="local-note-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 4h12v12H4z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M6 8h8M6 12h5" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> + Anotação</button>
              <button class="local-expense-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v7A2.5 2.5 0 0 1 14.5 16h-9A2.5 2.5 0 0 1 3 13.5v-7Z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M7 10h6M10 8v4" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> + Gastos</button>
            </div>
          </div>
        `;
        timeline.appendChild(card);
        // Adiciona evento de remover ao botão do novo card
        const removeBtn = card.querySelector('.remove-place-btn');
        if (removeBtn) {
          removeBtn.onclick = function() {
            card.remove();
            setTimeout(updateFinanceSummary, 50);
            // Remove marcador do mapa
            const key = getPlaceKey(placeName, placeAddress);
            const idx = window.roadmapMarkers.findIndex(m => m.key === key);
            if (idx !== -1) {
              window.roadmapMarkers[idx].marker.setMap(null);
              window.roadmapMarkers.splice(idx, 1);
            }
          };
        }
        // Adiciona marcador no mapa
        addPlaceToMap(placeName, placeAddress, lastSelectedPlace);
        // Eventos de hover para animar e centralizar marcador
        card.addEventListener('mouseenter', async function() {
          const { updateMarkerAnimation } = await import('../../js/core/map/markers.js');
          const key = getPlaceKey(placeName, placeAddress);
          const m = window.roadmapMarkers.find(m => m.key === key);
          if (m && m.marker) {
            updateMarkerAnimation(m.marker, true);
            // Centraliza o mapa no marcador
            if (m.marker.getPosition) {
              window.map.panTo(m.marker.getPosition());
            }
          }
        });
        card.addEventListener('mouseleave', async function() {
          const { updateMarkerAnimation } = await import('../../js/core/map/markers.js');
          const m = window.roadmapMarkers.find(m => m.key === key);
          if (m && m.marker) {
            updateMarkerAnimation(m.marker, false);
          }
        });
        attachLocalCardActions(card);
      }
      closeAddPlaceModal();
      // Limpa o último place selecionado para o próximo uso
      lastSelectedPlace = null;
    };
  }

  // Array global para guardar os marcadores do roteiro
  window.roadmapMarkers = [];

  // Função utilitária para gerar chave única do local
  function getPlaceKey(name, address) {
    return `${name}__${address}`;
  }

  // Função para adicionar marcador no mapa
  async function addPlaceToMap(placeName, placeAddress, lastSelectedPlace) {
    const { createMarker, updateMarkerAnimation } = await import('../../js/core/map/markers.js');
    let marker = null;
    let markerPlace = null;
    if (lastSelectedPlace && lastSelectedPlace.geometry && lastSelectedPlace.geometry.location) {
      markerPlace = {
        name: lastSelectedPlace.name || placeName,
        geometry: lastSelectedPlace.geometry,
        rating: lastSelectedPlace.rating,
        types: lastSelectedPlace.types,
        vicinity: lastSelectedPlace.formatted_address || lastSelectedPlace.vicinity || placeAddress
      };
      marker = createMarker(window.map, markerPlace);
    } else if (placeAddress) {
      if (window.google && window.google.maps) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: placeAddress }, function(results, status) {
          if (status === 'OK' && results[0]) {
            markerPlace = {
              name: placeName,
              geometry: { location: results[0].geometry.location },
              vicinity: placeAddress
            };
            marker = createMarker(window.map, markerPlace);
            // Salva o marcador
            if (marker) {
              window.roadmapMarkers.push({
                key: getPlaceKey(placeName, placeAddress),
                marker,
                markerPlace
              });
            }
          }
        });
      }
    }
    // Salva o marcador se já criado (caso autocomplete)
    if (marker) {
      window.roadmapMarkers.push({
        key: getPlaceKey(placeName, placeAddress),
        marker,
        markerPlace
      });
    }
  }

  // Função para abrir o modal de edição da viagem
  function openEditTripModal() {
    const modal = document.getElementById('editTripModal');
    if (!modal) return;
    const tripNameInput = document.getElementById('tripName');
    const tripDestinationInput = document.getElementById('tripDestination');
    const tripNameBanner = document.getElementById('tripNameBanner');
    const tripDestinationBanner = document.getElementById('tripDestinationBanner');
    const tripDateBanner = document.getElementById('tripDateBanner');
    tripNameInput.value = tripNameBanner ? tripNameBanner.textContent : '';
    // Remover SVG do texto do destino para o input
    if (tripDestinationBanner && tripDestinationBanner.innerText) {
      tripDestinationInput.value = tripDestinationBanner.innerText.trim();
    } else {
      tripDestinationInput.value = '';
    }
    // Preencher datas atuais do banner, se houver
    const tripDateInput = document.getElementById('editTripDateRange');
    if (tripDateInput && window.flatpickr) {
      let start = null, end = null;
      if (tripDateBanner && tripDateBanner.textContent && tripDateBanner.textContent.includes('-')) {
        // Espera formato "23 Mai 2025 - 25 Mai 2025" ou similar
        const parts = tripDateBanner.textContent.split('-').map(p => p.trim());
        if (parts.length === 2) {
          // Tenta converter para Date
          const parseDate = (str) => {
            const [dia, mes, ano] = str.split(' ');
            const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            const idx = meses.findIndex(m => mes.toLowerCase().startsWith(m));
            if (idx !== -1) {
              return new Date(Number(ano), idx, parseInt(dia));
            }
            return null;
          };
          start = parseDate(parts[0]);
          end = parseDate(parts[1]);
        }
      }
      // Sempre atualiza as datas do flatpickr ao abrir o modal
      if (tripDateInput._flatpickr) {
        tripDateInput._flatpickr.set('minDate', 'today');
        tripDateInput._flatpickr.setDate([start, end].filter(Boolean), true);
        tripDateInput._flatpickr.set('position', 'below');
      } else {
        window.flatpickr(tripDateInput, {
          mode: 'range',
          dateFormat: 'd M Y',
          locale: 'pt',
          minDate: 'today',
          defaultDate: [start, end].filter(Boolean),
          position: 'below'
        });
      }
    }
    modal.style.display = 'flex';
    // --- Google Autocomplete para destino (apenas cidades) ---
    if (window.google && window.google.maps && window.google.maps.places) {
      if (!tripDestinationInput._autocompleteInitialized) {
        const autocomplete = new google.maps.places.Autocomplete(tripDestinationInput, {
          types: ['(cities)'],
        });
        tripDestinationInput._autocompleteInitialized = true;
      }
    } else {
      // Se Google Maps ainda não carregou, tenta novamente após um tempo
      let tries = 0;
      const tryInit = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          if (!tripDestinationInput._autocompleteInitialized) {
            const autocomplete = new google.maps.places.Autocomplete(tripDestinationInput, {
              types: ['(cities)'],
            });
            tripDestinationInput._autocompleteInitialized = true;
          }
        } else if (tries < 10) {
          tries++;
          setTimeout(tryInit, 300);
        }
      };
      tryInit();
    }
  }

  // Evento para abrir modal ao clicar na engrenagem
  const settingsBtn = document.querySelector('.cover-action-btn[title="Configurações"]');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openEditTripModal);
  } else {
    console.error('Botão da engrenagem (Configurações) não encontrado!');
  }
  // Evento para fechar modal
  const closeEditTripModalBtn = document.getElementById('closeEditTripModal');
  if (closeEditTripModalBtn) {
    closeEditTripModalBtn.onclick = function() {
      document.getElementById('editTripModal').style.display = 'none';
    };
  }
  // Fecha ao clicar fora do modal
  window.addEventListener('click', function(e) {
    const modal = document.getElementById('editTripModal');
    if (modal && e.target === modal) {
      modal.style.display = 'none';
    }
  });
  // Unificação do onsubmit do formulário de edição da viagem
  const editTripForm = document.getElementById('editTripForm');
  if (editTripForm) {
    editTripForm.onsubmit = function(e) {
      e.preventDefault();
      console.log('submit do modal de edição de viagem');
      const name = document.getElementById('tripName').value;
      const dest = document.getElementById('tripDestination').value;
      const dateInput = document.getElementById('editTripDateRange');
      const tripNameBanner = document.getElementById('tripNameBanner');
      const tripDestinationBanner = document.getElementById('tripDestinationBanner');
      const tripDateBanner = document.getElementById('tripDateBanner');
      // Atualiza na tela
      if (tripNameBanner) tripNameBanner.textContent = name;
      if (tripDestinationBanner) tripDestinationBanner.innerHTML = `<svg style='vertical-align:middle;margin-right:6px;' width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M12 22s7-7.58 7-12A7 7 0 1 0 5 10c0 4.42 7 12 7 12Z' stroke='#fff' stroke-width='1.7' fill='#fff' /><circle cx='12' cy='10' r='3' fill='none' stroke='#0a7c6a' stroke-width='1.5'/></svg>` + dest;
      if (tripDateBanner && dateInput && dateInput._flatpickr && dateInput._flatpickr.selectedDates.length === 2) {
        const startDate = dateInput._flatpickr.selectedDates[0];
        const endDate = dateInput._flatpickr.selectedDates[1];
        const opts = { day: '2-digit', month: 'short', year: 'numeric' };
        const start = startDate.toLocaleDateString('pt-BR', opts);
        const end = endDate.toLocaleDateString('pt-BR', opts);
        tripDateBanner.innerHTML = `<svg style='vertical-align:middle;margin-right:6px;' width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='3' y='5' width='18' height='16' rx='3' fill='#fff' stroke='#fff' stroke-width='1.7'/><path d='M7 3v4M17 3v4' stroke='#0a7c6a' stroke-width='1.5' stroke-linecap='round'/></svg>` + `${start} - ${end}`;
      }
      document.getElementById('editTripModal').style.display = 'none';
      attachRoadmapEventListeners();
    };
  }

  // Dropdown orçamento
  const budgetBtn = document.getElementById('budgetBtn');
  const budgetDropdown = document.getElementById('budgetDropdown');
  document.addEventListener('click', function(e) {
    if (budgetBtn && budgetDropdown) {
      if (budgetBtn.contains(e.target)) {
        budgetDropdown.classList.toggle('show');
      } else if (!budgetDropdown.contains(e.target)) {
        budgetDropdown.classList.remove('show');
      }
    }
  });

  // Máscara de moeda
  function formatCurrency(value, currency) {
    if (!value) return '';
    let number = Number(value.replace(/\D/g, '')) / 100;
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
      minimumFractionDigits: 2
    });
  }
  function getCurrencyLocale(currency) {
    switch(currency) {
      case 'USD': return 'en-US';
      case 'EUR': return 'de-DE';
      default: return 'pt-BR';
    }
  }
  function formatInput(e) {
    let currency = budgetCurrency.value;
    let locale = getCurrencyLocale(currency);
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
      e.target.value = '';
      return;
    }
    let number = Number(value) / 100;
    e.target.value = number.toLocaleString(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
  }
  if (budgetInput) {
    budgetInput.addEventListener('input', formatInput);
    budgetInput.addEventListener('keydown', function(e) {
      if (!["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key) && !/\d/.test(e.key)) {
        e.preventDefault();
      }
    });
  }
  if (budgetCurrency) {
    budgetCurrency.addEventListener('change', function() {
      if (budgetInput.value) {
        let raw = budgetInput.value.replace(/\D/g, '');
        let number = Number(raw) / 100;
        let locale = getCurrencyLocale(budgetCurrency.value);
        budgetInput.value = number.toLocaleString(locale, {
          style: 'currency',
          currency: budgetCurrency.value,
          minimumFractionDigits: 2
        });
      }
    });
  }

  attachRoadmapEventListeners();

  // Listener para adicionar local do InfoWindow do mapa
  window.addEventListener('addPlaceToRoadmap', async function(e) {
    const { name, address } = e.detail;
    // Adiciona no primeiro dia do roteiro
    const firstDayContent = document.querySelector('.day-content');
    if (!firstDayContent) return;
    // Remove mensagem de vazio, se existir
    const emptyMsg = firstDayContent.querySelector('.place-card.empty');
    if (emptyMsg) emptyMsg.remove();
    // Garante que existe .day-timeline
    let timeline = firstDayContent.querySelector('.day-timeline');
    const addBtn = firstDayContent.querySelector('.add-place-btn');
    if (!timeline) {
      timeline = document.createElement('div');
      timeline.className = 'day-timeline';
      timeline.innerHTML = '<div class="timeline-line"></div>';
      if (addBtn) {
        firstDayContent.insertBefore(timeline, addBtn);
      } else {
        firstDayContent.appendChild(timeline);
      }
    } else if (addBtn && addBtn.parentElement === timeline) {
      firstDayContent.appendChild(addBtn);
    }

    // Busca o marker correspondente
    const key = getPlaceKey(name, address);
    let markerObj = window.roadmapMarkers.find(m => m.key === key);
    let marker = null;
    let markerPlace = null;
    if (!markerObj) {
      // Tenta encontrar o marker no mapa (pode ter sido criado mas não adicionado ao array)
      if (window.map && window.google && window.google.maps) {
        // Procura entre todos os markers do mapa (pode ser necessário adaptar se markers não forem globais)
        // Aqui, como fallback, geocodifica e cria um novo marker
        const geocoder = new window.google.maps.Geocoder();
        await new Promise(resolve => {
          geocoder.geocode({ address }, function(results, status) {
            if (status === 'OK' && results[0]) {
              markerPlace = {
                name,
                geometry: { location: results[0].geometry.location },
                vicinity: address
              };
              import('../../js/core/map/markers.js').then(({ createMarker }) => {
                marker = createMarker(window.map, markerPlace);
                window.roadmapMarkers.push({ key, marker, markerPlace });
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
      }
    } else {
      marker = markerObj.marker;
      markerPlace = markerObj.markerPlace;
    }

    // Se markerPlace não tem rating/types, tenta obter do marker (caso tenha sido criado via Nearby/POI)
    if (marker && marker.placeData) {
      markerPlace = marker.placeData;
    }

    // Cria card de local igual ao do modal
    let ratingHtml = '';
    if (markerPlace && markerPlace.rating) {
      const stars = '★'.repeat(Math.round(markerPlace.rating)) + '☆'.repeat(5 - Math.round(markerPlace.rating));
      ratingHtml = `<div class="local-rating"><span class="stars">${stars}</span></div>`;
    }
    const card = document.createElement('div');
    card.className = 'local-card';
    card.innerHTML = `
      ${getDragHandleSVG()}
      <button class="remove-place-btn" title="Remover local">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8.5V14.5C6 15.3284 6.67157 16 7.5 16H12.5C13.3284 16 14 15.3284 14 14.5V8.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4 5.5H16" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M8.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M11.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M7 5.5V4.5C7 3.94772 7.44772 3.5 8 3.5H12C12.5523 3.5 13 3.94772 13 4.5V5.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="local-img"></div>
      <div class="local-info">
        <div class="local-title">${name}</div>
        <div class="local-address">${address || ''}</div>
        ${ratingHtml}
        <div class="local-actions">
          <button class="local-note-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 4h12v12H4z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M6 8h8M6 12h5" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> + Anotação</button>
          <button class="local-expense-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v7A2.5 2.5 0 0 1 14.5 16h-9A2.5 2.5 0 0 1 3 13.5v-7Z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M7 10h6M10 8v4" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> + Gastos</button>
        </div>
      </div>
    `;
    timeline.appendChild(card);
    // Adiciona evento de remover ao botão do novo card
    const removeBtn = card.querySelector('.remove-place-btn');
    if (removeBtn) {
      removeBtn.onclick = function() {
        card.remove();
        setTimeout(updateFinanceSummary, 50);
        // Remove marcador do mapa
        const idx = window.roadmapMarkers.findIndex(m => m.key === key);
        if (idx !== -1) {
          window.roadmapMarkers[idx].marker.setMap(null);
          window.roadmapMarkers.splice(idx, 1);
        }
      };
    }
    // Eventos de hover para animar e centralizar marcador
    card.addEventListener('mouseenter', async function() {
      const { updateMarkerAnimation } = await import('../../js/core/map/markers.js');
      const m = window.roadmapMarkers.find(m => m.key === key);
      if (m && m.marker) {
        updateMarkerAnimation(m.marker, true);
        // Centraliza o mapa no marcador
        if (m.marker.getPosition) {
          window.map.panTo(m.marker.getPosition());
          window.map.setZoom(16);
        }
      }
    });
    card.addEventListener('mouseleave', async function() {
      const { updateMarkerAnimation } = await import('../../js/core/map/markers.js');
      const m = window.roadmapMarkers.find(m => m.key === key);
      if (m && m.marker) {
        updateMarkerAnimation(m.marker, false);
      }
    });
    attachLocalCardActions(card);
    setTimeout(updateFinanceSummary, 50);
  });

  // Funções de drag and drop para local-card
  let _draggedLocalCardGroup = null;
  function handleLocalCardDragStart(e) {
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
  function handleLocalCardDragOver(e) {
    e.preventDefault();
    this.classList.add('over');
    e.dataTransfer.dropEffect = 'move';
  }
  function handleLocalCardDragLeave(e) {
    this.classList.remove('over');
  }
  function handleLocalCardDrop(e) {
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
    }
  }
  function handleLocalCardDragEnd(e) {
    this.classList.remove('over');
    this.classList.remove('dragElem');
    window._draggedLocalCard = null;
    _draggedLocalCardGroup = null;
  }
  function handleDayContentDragOver(e) {
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
  function handleDayContentDrop(e) {
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
  }
  function handleDayContentDragLeave(e) {
    this.classList.remove('over');
    clearInterval(autoScrollInterval);
  }
  function addLocalCardDnDHandlers(card) {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', handleLocalCardDragStart, false);
    card.addEventListener('dragover', handleLocalCardDragOver, false);
    card.addEventListener('dragleave', handleLocalCardDragLeave, false);
    card.addEventListener('drop', handleLocalCardDrop, false);
    card.addEventListener('dragend', handleLocalCardDragEnd, false);
  }
  function addDayContentDnDHandlers(dayContent) {
    dayContent.addEventListener('dragover', handleDayContentDragOver, false);
    dayContent.addEventListener('drop', handleDayContentDrop, false);
    dayContent.addEventListener('dragleave', handleDayContentDragLeave, false);
  }
  function handleDayHeaderDragOver(e) {
    e.preventDefault();
    const section = this.parentElement;
    const content = section.querySelector('.day-content');
    const arrow = this.querySelector('.day-arrow svg');
    if (content && content.style.display !== 'block') {
      content.style.display = 'block';
      if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
  }
  function addDayHeaderDnDHandlers(header) {
    header.addEventListener('dragover', handleDayHeaderDragOver, false);
  }
  // Adiciona DnD aos cards e dias já existentes ao carregar
  function initLocalCardDnD() {
    document.querySelectorAll('.local-card').forEach(addLocalCardDnDHandlers);
    document.querySelectorAll('.day-content').forEach(addDayContentDnDHandlers);
    document.querySelectorAll('.day-header').forEach(addDayHeaderDnDHandlers);
  }
  initLocalCardDnD();

  function closeModal(modal) {
    if (modal) modal.style.display = 'none';
  }
  function setupModalCloseHandlers() {
    // Add Place Modal
    const addPlaceModal = document.getElementById('addPlaceModal');
    const closeAddBtn = document.getElementById('closeAddPlaceModal');
    if (addPlaceModal) {
      // Clicar fora
      window.addEventListener('click', function(e) {
        if (e.target === addPlaceModal) closeModal(addPlaceModal);
      });
      // ESC
      window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && addPlaceModal.style.display === 'flex') closeModal(addPlaceModal);
      });
      // Cancelar
      if (closeAddBtn) closeAddBtn.onclick = function() { closeModal(addPlaceModal); };
    }
    // Edit Trip Modal
    const editTripModal = document.getElementById('editTripModal');
    const closeEditBtn = document.getElementById('closeEditTripModal');
    if (editTripModal) {
      window.addEventListener('click', function(e) {
        if (e.target === editTripModal) closeModal(editTripModal);
      });
      window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && editTripModal.style.display === 'flex') closeModal(editTripModal);
      });
      if (closeEditBtn) closeEditBtn.onclick = function() { closeModal(editTripModal); };
    }
  }
  setupModalCloseHandlers();

  // Modal de colaboração: abrir ao clicar no botão "Adicionar pessoa"
  var collabBtn = document.querySelector('.cover-action-btn[title="Adicionar pessoa"]');
  var collabModal = document.getElementById('collabModal');
  var collabInput = document.getElementById('collabLinkInput');
  var copyCollabBtn = document.getElementById('copyCollabLinkBtn');
  var closeCollabBtn = document.getElementById('closeCollabModal');
  if (collabBtn && collabModal && collabInput && copyCollabBtn && closeCollabBtn) {
    collabBtn.addEventListener('click', function() {
      collabInput.value = window.location.href;
      collabModal.style.display = 'flex';
      copyCollabBtn.textContent = 'Copiar';
      collabInput.select();
      renderCollabList();
    });
    copyCollabBtn.addEventListener('click', function() {
      collabInput.select();
      document.execCommand('copy');
      copyCollabBtn.textContent = 'Link copiado!';
      setTimeout(function(){ copyCollabBtn.textContent = 'Copiar'; }, 1800);
    });
    closeCollabBtn.addEventListener('click', function() {
      collabModal.style.display = 'none';
    });
    window.addEventListener('click', function(e) {
      if (e.target === collabModal) collabModal.style.display = 'none';
    });
  }

  function renderCollabList() {
    // Quando tiver backend, troque window.currentUser pelos dados reais do usuário
    const user = window.currentUser || {
      name: "Maria Souza",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      isOwner: true
    };
    const collabList = document.getElementById('collabList');
    if (collabList) {
      collabList.innerHTML = `
        <img src="${user.avatar}" alt="${user.name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
        <span style="font-weight:600;">${user.name}</span>
        <span style="color:#888;font-size:0.98rem;">${user.isOwner ? '(Dono)' : ''}</span>
      `;
    }
  }

  window.currentUser = {
    name: "Maria Souza",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    isOwner: true
  };
});

 // Compartilhamento: abrir modal ao clicar no botão do banner
 document.addEventListener('DOMContentLoaded', function() {
  var shareBtn = document.querySelector('.cover-action-btn[title="Compartilhar"]');
  var shareModal = document.getElementById('shareModal');
  var shareInput = document.getElementById('shareLinkInput');
  var copyBtn = document.getElementById('copyShareLinkBtn');
  var closeBtn = document.getElementById('closeShareModal');
  if (shareBtn && shareModal && shareInput && copyBtn && closeBtn) {
    shareBtn.addEventListener('click', function() {
      shareInput.value = window.location.href;
      shareModal.style.display = 'flex';
      copyBtn.textContent = 'Copiar link';
      shareInput.select();
    });
    copyBtn.addEventListener('click', function() {
      shareInput.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Link copiado!';
      setTimeout(function(){ copyBtn.textContent = 'Copiar link'; }, 1800);
    });
    closeBtn.addEventListener('click', function() {
      shareModal.style.display = 'none';
    });
    window.addEventListener('click', function(e) {
      if (e.target === shareModal) shareModal.style.display = 'none';
    });
  }
});


let autoScrollInterval = null;
