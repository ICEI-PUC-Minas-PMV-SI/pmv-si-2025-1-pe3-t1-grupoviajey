document.addEventListener('DOMContentLoaded', function() {
  function getTrashSVG() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8.5V14.5C6 15.3284 6.67157 16 7.5 16H12.5C13.3284 16 14 15.3284 14 14.5V8.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 5.5H16" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M8.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M11.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M7 5.5V4.5C7 3.94772 7.44772 3.5 8 3.5H12C12.5523 3.5 13 3.94772 13 4.5V5.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
  }

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

  document.querySelectorAll('.local-note-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const card = btn.closest('.local-card');
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
      form.querySelector('.cancel-note-btn').onclick = function() {
        form.remove();
      };
      form.querySelector('.save-note-btn').onclick = function(e) {
        e.preventDefault();
        const value = form.querySelector('.note-input').value.trim();
        if (value) {
          const noteDiv = createNoteDiv(value);
          card.parentNode.insertBefore(noteDiv, form.nextElementSibling);
          attachNoteActions(noteDiv, card);
        }
        form.remove();
      };
    });
  });

  document.querySelectorAll('.local-expense-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const card = btn.closest('.local-card');
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
      form.querySelector('.cancel-expense-btn').onclick = function() { form.remove(); };
      form.querySelector('.save-expense-btn').onclick = function(e) {
        e.preventDefault();
        const value = input.value.trim();
        const currency = select.value;
        if (value) {
          const expenseDiv = createExpenseDiv(value, currency);
          form.parentNode.insertBefore(expenseDiv, form.nextElementSibling);
          attachExpenseActions(expenseDiv, card);
        }
        form.remove();
      };
    });
  });

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
      form.querySelector('.cancel-note-btn').onclick = function() { form.remove(); };
      form.querySelector('.save-note-btn').onclick = function(e) {
        e.preventDefault();
        const newValue = form.querySelector('.note-input').value.trim();
        if (newValue) {
          const newNoteDiv = createNoteDiv(newValue);
          card.parentNode.insertBefore(newNoteDiv, form.nextElementSibling);
          attachNoteActions(newNoteDiv, card);
        }
        noteDiv.remove();
        form.remove();
      };
    };
    noteDiv.querySelector('.delete-note-btn').onclick = function() { noteDiv.remove(); };
  }

  function attachExpenseActions(expenseDiv, card) {
    expenseDiv.querySelector('.edit-expense-btn').onclick = function() {
      // Garante que só um campo de gastos fique aberto
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
      form.querySelector('.cancel-expense-btn').onclick = function() { form.remove(); };
      form.querySelector('.save-expense-btn').onclick = function(e) {
        e.preventDefault();
        const value = input.value.trim();
        const currency = select.value;
        if (value) {
          const newExpenseDiv = createExpenseDiv(value, currency);
          form.parentNode.insertBefore(newExpenseDiv, form.nextElementSibling);
          attachExpenseActions(newExpenseDiv, card);
        }
        expenseDiv.remove();
        form.remove();
      };
    };
    expenseDiv.querySelector('.delete-expense-btn').onclick = function() { expenseDiv.remove(); };
  }

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
    // Aguarda DOM pronto
    if (document.readyState === 'loading') {
      await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    // Obtém cidade do título
    const title = document.querySelector('.cover-info h1');
    const cidade = title ? title.textContent.trim() : 'Florianópolis';
    // Importa módulos do mapa
    try {
      const loader = await import('../../js/core/map/loader.js');
      const mapConfig = await import('../search-results/map-config.js');
      // Carrega Google Maps e inicializa o mapa
      await loader.loadGoogleMapsScript();
      await mapConfig.initializeMapWithCity(cidade);
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
});
