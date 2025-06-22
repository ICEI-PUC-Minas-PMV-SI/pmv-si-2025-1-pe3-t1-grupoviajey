import { formatShortDateRange } from '../../js/utils/date.js';
import { apiService } from '../../services/api/apiService.js';
import { showLoading, hideLoading, showErrorToast, showSuccessToast } from '../../js/utils/ui-utils.js';
import { updateFinanceSummary, parseCurrencyToNumber } from './roadmap-finance.js';
import { setupCardHoverEvents } from './roadmap-map.js';

// =============================================
// CRIAÇÃO DE ELEMENTOS
// =============================================

export function createLocalCard(place) {
  if (!place || !place.placeId) {
    console.error('createLocalCard: place or place.placeId is missing.', place);
    return document.createDocumentFragment(); // Retorna um fragmento vazio para não quebrar a UI
  }

  let ratingHtml = '';
  if (place.rating) {
    ratingHtml = `
      <div class="local-rating">
        <span class="stars">${getStarsHtml(place.rating)}</span>
      </div>
    `;
  }
  
  const photoHtml = ''; // O campo de foto não é mais utilizado.

  const card = document.createElement('div');
  card.className = 'local-card';
  card.setAttribute('data-place-id', place.placeId); // CORREÇÃO: Usar data-place-id

  card.innerHTML = `
    ${getDragHandleSVG()}
    <button class="remove-place-btn" title="Remover local">
      ${getTrashSVG()}
    </button>
    <div class="local-info">
      <div class="local-title">${place.name || ''}</div>
      <div class="local-address">${place.address || ''}</div>
      ${ratingHtml}
      <div class="local-actions">
        <button class="local-card-actions" title="Mais opções">
          ${getActionDotsSVG()}
        </button>
      </div>
    </div>
  `;

  return card;
}

export function createChecklistItem(text) {
  const li = document.createElement('li');
  li.className = 'checklist-item';
  li.setAttribute('draggable', 'true');

  // Criar o drag handle
  const dragHandle = document.createElement('span');
  dragHandle.className = 'drag-handle';
  dragHandle.textContent = '☰';

  // Criar o checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checklist-checkbox';

  // Criar o texto
  const textSpan = document.createElement('span');
  textSpan.className = 'checklist-text';
  textSpan.textContent = text;

  // Criar o label
  const label = document.createElement('label');
  label.className = 'checklist-label';
  label.appendChild(checkbox);
  label.appendChild(textSpan);

  // Criar o botão de remover
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-checklist-btn';
  removeBtn.innerHTML = getTrashSVG();

  // Adicionar o event listener para o checkbox
  checkbox.addEventListener('change', function () {
    if (this.checked) {
      textSpan.style.textDecoration = 'line-through';
      textSpan.style.color = '#888';
    } else {
      textSpan.style.textDecoration = 'none';
      textSpan.style.color = '#1a3c4e';
    }
  });

  // Montar a estrutura
  li.appendChild(dragHandle);
  li.appendChild(label);
  li.appendChild(removeBtn);

  return li;
}

export function createNoteDiv(value) {
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

export function createExpenseDiv(expenseName, value, currency) {
  const expenseDiv = document.createElement('div');
  expenseDiv.className = 'timeline-expense';
  let label = value + ' ' + currency;
  if (expenseName && expenseName.trim() !== '') {
    label = `<b>${expenseName}:</b> ` + label;
  }
  expenseDiv.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="#222" stroke-width="1.3"/><path d="M10 6v8M7 10h6" stroke="#222" stroke-width="1.1" stroke-linecap="round"/></svg>
    <span class="expense-text">${label}</span>
    <button class="edit-expense-btn" title="Editar gasto">
      <svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 14.5V16h1.5l8.1-8.1-1.5-1.5L4 14.5zM15.7 6.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.1 1.1 3 3 1.1-1.1z" fill="#0a7c6a"/></svg>
    </button>
    <button class="delete-expense-btn" title="Excluir gasto">${getTrashSVG()}</button>
  `;
  return expenseDiv;
}

// =============================================
// FORMATAÇÃO
// =============================================

export function formatCurrencyInput(value, currency) {
  if (!value) return '';
  let numericValue = String(value).replace(/\D/g, '');
  let number = Number(numericValue) / 100;
  let locale = getCurrencyLocale(currency);
  return number.toLocaleString(locale, { style: 'currency', currency: currency, minimumFractionDigits: 2 });
}

export function formatCurrency(value, currency) {
  if (value === undefined || value === null || value === '') return '';
  let number;
  if (typeof value === 'string') {
    number = Number(String(value).replace(/\D/g, '')) / 100;
  } else if (typeof value === 'number') {
    number = value;
  } else {
    return '';
  }
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
    minimumFractionDigits: 2
  });
}

export function getCurrencyLocale(currency) {
  switch (currency) {
    case 'USD': return 'en-US';
    case 'EUR': return 'de-DE';
    default: return 'pt-BR';
  }
}

export function formatTripPeriod(start, end) {
  if (start && end) {
    return formatShortDateRange(start, end);
  }
  return '';
}

export function parseDate(str) {
  const [dia, mes, ano] = str.split(' ');
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const idx = meses.findIndex(m => mes.toLowerCase().startsWith(m));
  if (idx !== -1) {
    return new Date(Date.UTC(Number(ano), idx, parseInt(dia)));
  }
  return null;
}

// =============================================
// MANIPULAÇÃO DE ELEMENTOS
// =============================================

function adjustTimelineHeight(timeline) {
  if (!timeline) return;

  const cards = timeline.querySelectorAll('.local-card, .timeline-note, .timeline-expense');
  let totalHeight = 0;

  cards.forEach(card => {
    const cardHeight = card.offsetHeight;
    totalHeight += cardHeight;
  });

  timeline.style.height = totalHeight + 'px';
}

export function attachLocalCardActions(card) {
  const placeId = card.dataset.placeId; // CORREÇÃO: Ler de data-place-id
  if (!placeId) {
    console.error("Não foi possível anexar ações: placeId não encontrado no card.", card);
    return;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('tripId');

  // Adiciona o botão de remover, se não existir
  if (!card.querySelector('.remove-place-btn')) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-place-btn';
    removeBtn.title = 'Remover local';
    removeBtn.innerHTML = getTrashSVG();
    card.prepend(removeBtn); // Adiciona no início do card
  }

  const removeBtn = card.querySelector('.remove-place-btn');
  removeBtn.onclick = async () => {
    if (!confirm('Tem certeza que deseja remover este local do roteiro?')) return;
    
    showLoading('Removendo local...');
    try {
      let response;
      if (dayId) {
        // É um local dentro de um dia
        response = await apiService.removePlaceFromDay(tripId, dayId, placeId);
      } else {
        // É um local não atribuído
        response = await apiService.removeUnassignedPlace(tripId, placeId);
      }

      if (response && response.success) {
        card.remove();
        showSuccessToast('Local removido!');
        // Idealmente, o mapa seria atualizado aqui sem recarregar a página.
        // window.dispatchEvent(new CustomEvent('roadmapUpdated'));
      } else {
        throw new Error(response.message || 'Falha ao remover o local.');
      }
    } catch (error) {
      console.error('Erro ao remover local:', error);
      showErrorToast(error.message || 'Não foi possível remover o local.');
    } finally {
      hideLoading();
    }
  };

  // Adiciona o drag handle, se não existir
  if (!card.querySelector('.drag-handle')) {
      const dragHandle = document.createElement('span');
      dragHandle.className = 'drag-handle';
      dragHandle.title = 'Arraste para reordenar';
      dragHandle.innerHTML = getDragHandleSVG();
      card.prepend(dragHandle);
  }

  // Botão de anotação
  const noteBtn = card.querySelector('.local-note-btn');
  if (noteBtn) {
    noteBtn.onclick = function (e) {
      e.preventDefault();
      if (card.nextElementSibling && card.nextElementSibling.classList.contains('note-inline-form')) return;
      const form = document.createElement('div');
      form.className = 'timeline-note note-inline-form';
      form.innerHTML = `
      <div class="note-form-container">
         <svg width="18" height="18" viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="10" rx="2" fill="none" stroke="#222" stroke-width="1.3"/><path d="M6 8h8M6 12h5" stroke="#222" stroke-width="1.1" stroke-linecap="round"/></svg>
         <textarea class="note-input" rows="2" placeholder="Digite sua anotação..."></textarea>
      </div>

      <div class="note-actions">
         <button class="cancel-note-btn">Cancelar</button>
         <button class="save-note-btn">Salvar</button>
      </div>
      `;
      card.parentNode.insertBefore(form, card.nextElementSibling);
      form.querySelector('.note-input').focus();
      form.querySelector('.cancel-note-btn').onclick = function (e) {
        if (e) e.stopPropagation();
        form.remove();
      };
      form.querySelector('.save-note-btn').onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const value = form.querySelector('.note-input').value.trim();
        if (value) {
          const noteDiv = createNoteDiv(value);
          card.parentNode.insertBefore(noteDiv, form.nextElementSibling);
          attachNoteActions(noteDiv, card);
        }
        form.remove();
      };
    };
  }

  // Botão de gastos
  const expenseBtn = card.querySelector('.local-expense-btn');
  if (expenseBtn) {
    expenseBtn.onclick = function (e) {
      e.preventDefault();
      if (card.nextElementSibling && card.nextElementSibling.classList.contains('expense-inline-form')) return;
      const form = document.createElement('div');
      form.className = 'timeline-expense expense-inline-form';
      form.innerHTML = `
        <div class="expense-form-container">
          <svg width="18" height="18" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="#222" stroke-width="1.3"/><path d="M10 6v8M7 10h6" stroke="#222" stroke-width="1.1" stroke-linecap="round"/></svg>
          <input type="text" class="expense-name-input" placeholder="Nome do gasto (opcional)">
          <input type="text" class="expense-input" placeholder="Valor" inputmode="decimal">
          <select class="expense-currency-select">
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>

          <div class="note-actions">
          <button class="cancel-expense-btn">Cancelar</button>
          <button class="save-expense-btn">Salvar</button>
          </div>
        </div>
      `;
      card.parentNode.insertBefore(form, card.nextElementSibling);

      const valueInput = form.querySelector('.expense-input');
      const currencySelect = form.querySelector('.expense-currency-select');

      // Configura a formatação do input de valor
      valueInput.addEventListener('input', function () {
        const formattedValue = formatCurrencyInput(valueInput.value, currencySelect.value);
        if (formattedValue !== valueInput.value) {
          valueInput.value = formattedValue;
        }
      });

      currencySelect.addEventListener('change', function () {
        const formattedValue = formatCurrencyInput(valueInput.value, currencySelect.value);
        if (formattedValue !== valueInput.value) {
          valueInput.value = formattedValue;
        }
      });

      form.querySelector('.expense-input').focus();

      form.querySelector('.cancel-expense-btn').onclick = function (e) {
        if (e) e.stopPropagation();
        form.remove();
      };

      form.querySelector('.save-expense-btn').onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const expenseName = form.querySelector('.expense-name-input').value.trim();
        const value = valueInput.value.trim();
        const currency = currencySelect.value;
        if (value) {
          const expenseDiv = createExpenseDiv(expenseName, value, currency);
          card.parentNode.insertBefore(expenseDiv, form.nextElementSibling);
          attachExpenseActions(expenseDiv, card);
          if (typeof updateFinanceSummary === 'function') {
            updateFinanceSummary();
          }
        }
        form.remove();
      };
    };
  }

  // Configura os eventos de hover do mapa
  setupCardHoverEvents(card);
}

export function attachNoteActions(noteDiv, card) {
  noteDiv.querySelector('.edit-note-btn').onclick = function () {
    if (card.nextElementSibling && card.nextElementSibling.classList.contains('note-inline-form')) return;
    const value = noteDiv.querySelector('.note-text').textContent;

    // Esconde a nota atual
    noteDiv.style.display = 'none';

    // Reutiliza o formulário de criação
    const noteBtn = card.querySelector('.local-note-btn');
    noteBtn.click();

    // Preenche o valor e configura os botões
    const form = card.nextElementSibling;
    const textarea = form.querySelector('.note-input');
    textarea.value = value;

    // Atualiza os handlers dos botões
    form.querySelector('.cancel-note-btn').onclick = function (e) {
      if (e) e.stopPropagation();
      form.remove();
      noteDiv.style.display = 'flex'; // Mostra a nota novamente
    };

    form.querySelector('.save-note-btn').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      const newValue = form.querySelector('.note-input').value.trim();
      if (newValue) {
        noteDiv.querySelector('.note-text').textContent = newValue;
      }
      form.remove();
      noteDiv.style.display = 'flex'; // Mostra a nota novamente
    };
  };

  noteDiv.querySelector('.delete-note-btn').onclick = function () {
    noteDiv.remove();
  };
}

export function attachExpenseActions(expenseDiv, card) {
  expenseDiv.querySelector('.edit-expense-btn').onclick = function () {
    if (card.nextElementSibling && card.nextElementSibling.classList.contains('expense-inline-form')) return;

    const expenseText = expenseDiv.querySelector('.expense-text').textContent;
    let expenseName = '';
    let value = expenseText;
    let currency = 'BRL';

    // Extrai nome e valor do gasto
    if (expenseText.includes(':')) {
      const parts = expenseText.split(':');
      expenseName = parts[0].trim();
      value = parts[1].trim();
    }

    // Extrai valor e moeda
    const valueParts = value.trim().split(' ');
    if (valueParts.length > 1) {
      value = valueParts[0];
      currency = valueParts[1];
    }

    // Esconde o gasto atual
    expenseDiv.style.display = 'none';

    // Reutiliza o formulário de criação
    const expenseBtn = card.querySelector('.local-expense-btn');
    expenseBtn.click();

    // Preenche os valores e configura os botões
    const form = card.nextElementSibling;
    const nameInput = form.querySelector('.expense-name-input');
    const valueInput = form.querySelector('.expense-input');
    const currencySelect = form.querySelector('.expense-currency-select');

    nameInput.value = expenseName;
    valueInput.value = value;
    currencySelect.value = currency;

    // Configura a formatação do input de valor
    valueInput.addEventListener('input', function () {
      const formattedValue = formatCurrencyInput(valueInput.value, currencySelect.value);
      if (formattedValue !== valueInput.value) {
        valueInput.value = formattedValue;
      }
    });

    currencySelect.addEventListener('change', function () {
      const formattedValue = formatCurrencyInput(valueInput.value, currencySelect.value);
      if (formattedValue !== valueInput.value) {
        valueInput.value = formattedValue;
      }
    });

    // Formata o valor inicial
    const formattedValue = formatCurrencyInput(value, currency);
    if (formattedValue !== value) {
      valueInput.value = formattedValue;
    }

    // Atualiza os handlers dos botões
    form.querySelector('.cancel-expense-btn').onclick = function (e) {
      if (e) e.stopPropagation();
      form.remove();
      expenseDiv.style.display = 'flex'; // Mostra o gasto novamente
    };

    form.querySelector('.save-expense-btn').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      const newExpenseName = nameInput.value.trim();
      const newValue = valueInput.value.trim();
      const newCurrency = currencySelect.value;

      if (newValue) {
        let label = newValue + ' ' + newCurrency;
        if (newExpenseName) {
          label = `<b>${newExpenseName}:</b> ` + label;
        }
        expenseDiv.querySelector('.expense-text').innerHTML = label;

        if (typeof updateFinanceSummary === 'function') {
          updateFinanceSummary();
        }
      }

      form.remove();
      expenseDiv.style.display = 'flex'; // Mostra o gasto novamente
    };
  };

  expenseDiv.querySelector('.delete-expense-btn').onclick = function () {
    expenseDiv.remove();
    if (typeof updateFinanceSummary === 'function') {
      updateFinanceSummary();
    }
  };
}

// =============================================
// UTILITÁRIOS DE SVG
// =============================================

export function getTrashSVG() {
  return `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 6h18M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="#555" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function getDragHandleSVG() {
  return `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 6h8M8 12h8M8 18h8" stroke="#999" stroke-width="2" stroke-linecap="round"/></svg>`;
}

export function getActionDotsSVG() {
  return `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 12m-1 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm0 5a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm0-10a1 1 0 1 0-2 0 1 1 0 0 0 2 0z" fill="#555"/></svg>`;
}

function getStarsHtml(rating) {
  const fullStars = Math.round(rating || 0);
  if (fullStars <= 0) return '';
  const emptyStars = 5 - fullStars;
  return `<span class="star-icon">${'★'.repeat(fullStars)}${'☆'.repeat(emptyStars)}</span>`;
}
