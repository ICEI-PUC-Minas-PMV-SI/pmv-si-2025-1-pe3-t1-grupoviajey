import { formatShortDateRange } from '../../js/utils/date.js';

// =============================================
// CRIAÇÃO DE ELEMENTOS
// =============================================

export function createLocalCard({ name, address, rating, img, key, placeName, placeAddress, placeRating }) {
  // rating pode ser string ("★★★☆☆") ou número
  let ratingHtml = '';
  // Prioriza rating numérico
  const ratingNumber = typeof rating === 'number' ? rating : (typeof placeRating === 'number' ? placeRating : null);
  if (ratingNumber) {
    ratingHtml = `<div class="local-rating"><span class="stars">${getStarsHtml(ratingNumber)}</span></div>`;
  } else if (rating) {
    ratingHtml = `<div class="local-rating"><span class="stars">${rating}</span></div>`;
  }
  const card = document.createElement('div');
  card.className = 'local-card';
  card.innerHTML = `
    ${getDragHandleSVG()}
    <button class="remove-place-btn" title="Remover local">
      ${getTrashSVG()}
    </button>
    <div class="local-img">${img ? `<img src="${img}" alt="Imagem do local" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : ''}</div>
    <div class="local-info">
      <div class="local-title">${name || placeName || ''}</div>
      <div class="local-address">${address || placeAddress || ''}</div>
      ${ratingHtml}
      <div class="local-actions">
        <button class="local-note-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 4h12v12H4z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M6 8h8M6 12h5" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> + Anotação</button>
        <button class="local-expense-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v7A2.5 2.5 0 0 1 14.5 16h-9A2.5 2.5 0 0 1 3 13.5v-7Z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M7 10h6M10 8v4" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> + Gastos</button>
      </div>
    </div>
  `;
  return card;
}

export function createChecklistItem(text) {
  const li = document.createElement('li');
  li.className = 'checklist-item';
  li.setAttribute('draggable', 'true');
  li.innerHTML = `
    ${getDragHandleSVG()}
    <label><input type="checkbox"> ${text}</label>
    <button class="remove-checklist-btn" title="Remover item">${getTrashSVG()}</button>
  `;
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

export function parseCurrencyToNumber(str) {
  if (!str) return 0;
  str = str.replace(/(BRL|USD|EUR)/g, '').trim();
  str = str.replace(/[^\d,\.]/g, '');
  if (str.indexOf(',') > -1 && str.indexOf('.') === -1) {
    str = str.replace(',', '.');
  } else if (str.indexOf('.') > -1 && str.indexOf(',') > -1) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  return parseFloat(str) || 0;
}

// Utilitário para gerar estrelas exatas com meia estrela
function getStarsHtml(rating) {
  rating = Number(rating);
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  let stars = '★'.repeat(fullStars);
  if (halfStar) stars += '½';
  stars += '☆'.repeat(emptyStars);
  return `<span class="stars">${stars}</span> <span class="rating-value">${rating.toFixed(1)}</span>`;
}

export function formatCurrencyInput(input, currency) {
  let value = input.value.replace(/\D/g, '');
  if (!value) {
    input.value = '';
    return;
  }
  let number = Number(value) / 100;
  let locale = getCurrencyLocale(currency);
  input.value = number.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
}

export function formatCurrency(value, currency) {
  if (value === undefined || value === null || value === '') return '';
  let number;
  if (typeof value === 'string') {
    number = Number(value.replace(/\D/g, '')) / 100;
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
    return new Date(Number(ano), idx, parseInt(dia));
  }
  return null;
}

// =============================================
// MANIPULAÇÃO DE ELEMENTOS
// =============================================

export function attachLocalCardActions(card) {
  // implementação...
}

export function attachNoteActions(noteDiv, card) {
  noteDiv.querySelector('.edit-note-btn').onclick = function () {
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

    // Adiciona event listeners
    form.querySelector('.cancel-note-btn').onclick = function (e) {
      if (e) e.stopPropagation();
      form.remove();
    };

    form.querySelector('.save-note-btn').onclick = function (e) {
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

  noteDiv.querySelector('.delete-note-btn').onclick = function () {
    noteDiv.remove();
  };
}

export function attachExpenseActions(expenseDiv, card) {
  expenseDiv.querySelector('.edit-expense-btn').onclick = function () {
    let next = card.nextElementSibling;
    if (next && next.classList.contains('note-inline-form')) next = next.nextElementSibling;
    if (next && next.classList.contains('expense-inline-form')) return;

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

    const form = document.createElement('div');
    form.className = 'expense-inline-form';
    form.innerHTML = `
      <div class="expense-input-row">
        <input type="text" class="expense-name-input" placeholder="Nome do gasto (opcional)" value="${expenseName}">
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

    // Formata o input de gasto
    input.addEventListener('input', function () {
      formatCurrencyInput(input, select.value);
    });

    select.addEventListener('change', function () {
      formatCurrencyInput(input, select.value);
    });

    // Adiciona event listeners
    form.querySelector('.cancel-expense-btn').onclick = function (e) {
      if (e) e.stopPropagation();
      form.remove();
    };

    form.querySelector('.save-expense-btn').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      const expenseName = form.querySelector('.expense-name-input').value.trim();
      const value = input.value.trim();
      const currency = select.value;

      if (value) {
        const newExpenseDiv = createExpenseDiv(expenseName, value, currency);
        form.parentNode.insertBefore(newExpenseDiv, form.nextElementSibling);
        attachExpenseActions(newExpenseDiv, card);
        if (typeof updateFinanceSummary === 'function') updateFinanceSummary();
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

  expenseDiv.querySelector('.delete-expense-btn').onclick = function () {
    expenseDiv.remove();
    if (typeof updateFinanceSummary === 'function') updateFinanceSummary();
  };
}

// =============================================
// UTILITÁRIOS DE SVG
// =============================================

export function getTrashSVG() {
  return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8.5V14.5C6 15.3284 6.67157 16 7.5 16H12.5C13.3284 16 14 15.3284 14 14.5V8.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 5.5H16" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M11.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M7 5.5V4.5C7 3.94772 7.44772 3.5 8 3.5H12C12.5523 3.5 13 3.94772 13 4.5V5.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

export function getDragHandleSVG() {
  return `<span class="drag-handle" title="Arraste para mover">&#9776;</span>`;
} 