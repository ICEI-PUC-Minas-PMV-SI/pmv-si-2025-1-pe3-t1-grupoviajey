import { formatShortDateRange } from '../../js/utils/date.js';
import { updateFinanceSummary, parseCurrencyToNumber } from './roadmap-finance.js';
import { saveRoadmapToStorage } from './roadmap-core.js';

// =============================================
// CRIAÇÃO DE ELEMENTOS
// =============================================

export function createLocalCard({ name, address, rating, img, key, placeName, placeAddress, placeRating, lat, lng, geometry }) {
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
  card.dataset.key = key || name || address || (lat + ',' + lng);
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

  // Remove todos os caracteres não numéricos
  let numericValue = value.replace(/\D/g, '');

  // Converte para número e divide por 100 para considerar os centavos
  let number = Number(numericValue) / 100;

  // Obtém o locale apropriado para a moeda
  let locale = getCurrencyLocale(currency);

  // Formata o número como moeda
  return number.toLocaleString(locale, {
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

function adjustTimelineHeight(timeline) {
  if (!timeline) return;

  const cards = timeline.querySelectorAll('.local-card, .timeline-note, .timeline-expense');
  let totalHeight = 0;

  cards.forEach(card => {
    const cardHeight = card.offsetHeight;
    const cardMargin = parseInt(window.getComputedStyle(card).marginBottom);
    totalHeight += cardHeight + cardMargin;
  });

  // Adiciona um pequeno padding extra para espaçamento
  totalHeight += 20;

  // Define a altura mínima da timeline
  timeline.style.minHeight = Math.max(totalHeight, 100) + 'px';
}

export function attachLocalCardActions(card) {
  // Botão de remover
  const removeBtn = card.querySelector('.remove-place-btn');
  if (removeBtn) {
    removeBtn.onclick = function () {
      // Remove o card do DOM
      card.remove();

      // Remove o local do storage explicitamente
      const roadmap = JSON.parse(localStorage.getItem('userRoadmapData'));
      if (roadmap && Array.isArray(roadmap.days)) {
        for (const day of roadmap.days) {
          const idx = day.places.findIndex(
            p => (p.key || ((p.name || '') + '|' + (p.address || '') + '|' + (p.lat || '') + '|' + (p.lng || ''))) === card.dataset.key
          );
          if (idx !== -1) {
            day.places.splice(idx, 1);
            break;
          }
        }
        localStorage.setItem('userRoadmapData', JSON.stringify(roadmap));
        // LOG para depuração
        console.log('Storage após remoção:', JSON.parse(localStorage.getItem('userRoadmapData')));
      }

      // Atualiza o mapa com os dados atualizados do storage
      if (roadmap && Array.isArray(roadmap.days)) {
        const allPlaces = roadmap.days
          .flatMap(day => day.places)
          .filter(p => p.lat && p.lng)
          .map(p => ({
            ...p,
            latitude: Number(p.lat),
            longitude: Number(p.lng),
            key: p.key || ((p.name || '') + '|' + (p.address || '') + '|' + (p.lat || '') + '|' + (p.lng || '')),
            types: p.types || ['lodging', 'restaurant', 'tourist_attraction']
          }));
        // LOG para depuração
        console.log('Array passado para updateMap:', allPlaces);
        if (typeof window.updateMap === 'function') {
          window.updateMap(allPlaces);
        }
      }

      // Ajusta a altura da timeline
      const timeline = card.closest('.day-timeline');
      if (timeline) {
        adjustTimelineHeight(timeline);
      }
    };
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

  card.addEventListener('mouseenter', () => {
    if (window.roadmapMarkers && window.updateMarkerAnimation) {
      const marker = window.roadmapMarkers.find(m => m._localKey === card.dataset.key);
      if (marker) window.updateMarkerAnimation(marker, true);
    }
  });
  card.addEventListener('mouseleave', () => {
    if (window.roadmapMarkers && window.updateMarkerAnimation) {
      const marker = window.roadmapMarkers.find(m => m._localKey === card.dataset.key);
      if (marker) window.updateMarkerAnimation(marker, false);
    }
  });
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