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
          // Inicializa autocomplete Google restrito à cidade do roteiro
          const city = document.querySelector('.cover-info h1')?.textContent?.trim() || '';
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
  document.querySelectorAll('.add-place-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      // Salva referência do dia clicado
      lastAddPlaceDayContent = btn.closest('.day-content');
      openAddPlaceModal();
    });
  });
  const closeBtn = document.getElementById('closeAddPlaceModal');
  if (closeBtn) closeBtn.onclick = closeAddPlaceModal;

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
          const key = getPlaceKey(placeName, placeAddress);
          const m = window.roadmapMarkers.find(m => m.key === key);
          if (m && m.marker) {
            updateMarkerAnimation(m.marker, false);
          }
        });
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
    tripDestinationInput.value = tripDestinationBanner ? tripDestinationBanner.textContent : '';
    // Preencher datas atuais do banner, se houver
    const tripDateInput = document.getElementById('editTripDateRange');
    if (tripDateInput && window.flatpickr) {
      let start = null, end = null;
      if (tripDateBanner && tripDateBanner.textContent && tripDateBanner.textContent.includes('-')) {
        // Espera formato "23 Maio - 25 Maio" ou similar
        const parts = tripDateBanner.textContent.split('-').map(p => p.trim());
        if (parts.length === 2) {
          // Tenta converter para Date
          const parseDate = (str) => {
            // Aceita "23 Maio" ou "23 Mai"
            const [dia, mes] = str.split(' ');
            const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            const idx = meses.findIndex(m => mes.toLowerCase().startsWith(m));
            if (idx !== -1) {
              const ano = new Date().getFullYear();
              return new Date(ano, idx, parseInt(dia));
            }
            return null;
          };
          start = parseDate(parts[0]);
          end = parseDate(parts[1]);
        }
      }
      // Sempre atualiza as datas do flatpickr ao abrir o modal
      if (tripDateInput._flatpickr) {
        tripDateInput._flatpickr.setDate([start, end].filter(Boolean), true);
        tripDateInput._flatpickr.set('position', 'below');
      } else {
        window.flatpickr(tripDateInput, {
          mode: 'range',
          dateFormat: 'd M',
          locale: 'pt',
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
  // Salvar atualiza os campos na tela
  const editTripForm = document.getElementById('editTripForm');
  if (editTripForm) {
    editTripForm.onsubmit = function(e) {
      e.preventDefault();
      const name = document.getElementById('tripName').value;
      const dest = document.getElementById('tripDestination').value;
      const dateInput = document.getElementById('editTripDateRange');
      const tripNameBanner = document.getElementById('tripNameBanner');
      const tripDestinationBanner = document.getElementById('tripDestinationBanner');
      const tripDateBanner = document.getElementById('tripDateBanner');
      // Atualiza na tela
      if (tripNameBanner) tripNameBanner.textContent = name;
      if (tripDestinationBanner) tripDestinationBanner.textContent = dest;
      if (tripDateBanner && dateInput && dateInput._flatpickr && dateInput._flatpickr.selectedDates.length === 2) {
        const opts = { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' };
        const startDate = dateInput._flatpickr.selectedDates[0];
        const endDate = dateInput._flatpickr.selectedDates[1];
        const start = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const end = endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        tripDateBanner.textContent = `${start} - ${end}`;

        // Atualizar as day-sections do roteiro
        const itinerary = document.getElementById('tab-itinerary');
        if (itinerary) {
          // Remove todas as day-sections existentes
          itinerary.querySelectorAll('.day-section').forEach(ds => ds.remove());
          // Gera os dias do intervalo
          let current = new Date(startDate);
          current.setHours(0,0,0,0);
          const endDay = new Date(endDate);
          endDay.setHours(0,0,0,0);
          const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          while (current <= endDay) {
            const weekday = diasSemana[current.getDay()];
            const dia = current.toLocaleDateString('pt-BR', { day: '2-digit' });
            const mes = current.toLocaleDateString('pt-BR', { month: 'long' });
            const ano = current.getFullYear();
            // Cria a estrutura da day-section
            const daySection = document.createElement('div');
            daySection.className = 'day-section';
            daySection.innerHTML = `
              <div class="day-header clickable">
                <h3>${weekday}, ${dia} de ${mes} de ${ano}</h3>
                <span class="day-arrow"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#1a3c4e" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span>
              </div>
              <div class="day-content">
                <div class="place-card empty">
                  <span>Adicione um local para este dia</span>
                </div>
                <button class="add-place-btn outlined">+ Adicionar local</button>
              </div>
            `;
            itinerary.appendChild(daySection);
            // Avança para o próximo dia
            current.setDate(current.getDate() + 1);
          }
          // Move o bloco de orçamento para logo após o último dia
          const financeRow = document.getElementById('financeSummaryRow');
          if (financeRow) {
            itinerary.appendChild(financeRow);
          }
        }
      }
      document.getElementById('editTripModal').style.display = 'none';
    };
  }
});
