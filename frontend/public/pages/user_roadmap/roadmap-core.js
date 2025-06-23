// Importações
import { updateFinanceSummary } from './roadmap-finance.js';
import { attachRoadmapEventListeners, recalculateAccordionHeight } from './roadmap-events.js';
import { attachLocalCardActions, formatTripPeriod } from './roadmap-utils.js';
import { updateMap, clearMap } from './roadmap-map.js';
import { apiService } from '../../services/api/apiService.js';

// =============================================
// CRIAÇÃO E GESTÃO DE DIAS
// =============================================

export function createDaySection(date, isoDate, dayId) {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const diaSemana = dias[date.getDay()];
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = meses[date.getMonth()];

  const section = document.createElement('div');
  section.className = 'day-section';
  section.dataset.dayId = dayId;

  section.innerHTML = `
    <div class="day-header">
      <h3>${diaSemana}, ${dia} de ${mes}</h3>
      <span class="day-arrow"><svg width="20" height="20" viewBox="0 0 20 24"><path d="M6 8l4 4 4-4" stroke="#1a3c4e" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span>
    </div>
    <div class="day-content" data-date="${isoDate}">
      <div class="day-timeline">
        <div class="timeline-line"></div>
      </div>
      <button class="add-place-btn btn btn-small outlined">+ Adicionar local</button>
    </div>
  `;
  return section;
}

// =============================================
// GESTÃO DE LOCAIS
// =============================================

export function handleAddToTimeline(placeData, dayContent) {
  if (!dayContent || !(dayContent instanceof Element)) {
    console.error('dayContent inválido em handleAddToTimeline:', dayContent, typeof dayContent);
    return;
  }

  console.log('handleAddToTimeline - dayContent:', dayContent);

  const key = 
    (placeData.name || placeData.placeName || '') + '|' +
    (placeData.address || placeData.placeAddress || '') + '|' +
    (placeData.rating || placeData.placeRating || '');

  const card = createLocalCard(placeData);
  if (!card) {
    console.error('Falha ao criar card do local:', placeData);
    return;
  }

  let timeline = dayContent.querySelector('.day-timeline');
  if (!timeline) {
    console.log('Criando nova timeline');
    timeline = document.createElement('div');
    timeline.className = 'day-timeline';
    timeline.innerHTML = '<div class="timeline-line"></div>';
    const addBtn = dayContent.querySelector('.add-place-btn');
    if (addBtn) {
      dayContent.insertBefore(timeline, addBtn);
    } else {
      dayContent.appendChild(timeline);
    }
  }

  timeline.appendChild(card);
  attachLocalCardActions(card);

  // TODO: Implementar salvamento via API
  console.log('Local adicionado à timeline:', placeData);

  adjustTimelineHeight();

  // Abre o accordion se estiver fechado e recalcula a altura
  const header = dayContent.previousElementSibling;
  if (header && !header.classList.contains('active')) {
    header.classList.add('active');
    const arrow = header.querySelector('.day-arrow svg');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  }
  
  // Recalcula a altura do accordion usando a função importada
  recalculateAccordionHeight(dayContent);
  
  adjustTimelineHeight();
}

export function createTimeline(dayContent) {
  let timeline = dayContent.querySelector('.day-timeline');
  if (!timeline) {
    timeline = document.createElement('div');
    timeline.className = 'day-timeline';
    timeline.innerHTML = '<div class="timeline-line"></div>';
    dayContent.insertBefore(timeline, dayContent.firstChild);
  }
  return timeline;
}

// =============================================
// CRIAÇÃO DE ELEMENTOS
// =============================================

export function createLocalCard(place) {
  // place é o objeto tripPlace da API
  const { id, placeDetails } = place;

  const card = document.createElement('div');
  card.className = 'local-card';
  card.draggable = true;
  card.dataset.placeId = id; // ID do TripPlace, não do Google Place
  
  // Lida com placeId do Google vindo de `placeDetails` ou diretamente
  if (placeDetails && placeDetails.place_id) {
    card.dataset.googlePlaceId = placeDetails.place_id;
  } else if (place.placeId) {
    card.dataset.googlePlaceId = place.placeId;
  }

  // Prioriza dados de `placeDetails` (quando vem do Google), 
  // mas usa os dados de `place` (quando vem do nosso banco) como fallback.
  const name = placeDetails?.name || place.name || 'Local desconhecido';
  const address = placeDetails?.formatted_address || place.address || 'Endereço não disponível';
  const ratingNumber = placeDetails?.rating || place.rating;
  
  const stars = ratingNumber ? '★'.repeat(Math.round(ratingNumber)) + '☆'.repeat(5 - Math.round(ratingNumber)) : 'Sem avaliação';
  const ratingText = ratingNumber ? ratingNumber.toFixed(1) : 'N/A';

  // Usa a primeira foto disponível ou uma imagem padrão
  const imageUrl = placeDetails?.photos?.[0]?.getUrl?.() || place.photo || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80';

  card.innerHTML = `
    <div class="local-img">
      <img src="${imageUrl}" alt="${name}" onerror="this.style.display='none';">
    </div>
    <div class="local-info">
      <div class="local-title">${name}</div>
      <div class="local-address">${address}</div>
      <div class="local-rating">
        <span class="stars">${stars}</span>
        <span class="rating-value">${ratingText}</span>
      </div>
      <div class="local-actions">
        <button class="local-note-btn" title="Adicionar anotação">
          <svg width="16" height="16" viewBox="0 0 20 20">
            <rect x="3" y="5" width="14" height="10" rx="2" fill="none" stroke="#222" stroke-width="1.3"/>
            <path d="M6 8h8M6 12h5" stroke="#222" stroke-width="1.1" stroke-linecap="round"/>
          </svg>
          Anotação
        </button>
        <button class="local-expense-btn" title="Adicionar despesa">
          <svg width="16" height="16" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="#222" stroke-width="1.3"/>
            <path d="M10 6v8M7 10h6" stroke="#222" stroke-width="1.1" stroke-linecap="round"/>
          </svg>
          Despesa
        </button>
      </div>
    </div>
  `;
  return card;
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
// FUNÇÕES AUXILIARES
// =============================================

function collectRoadmapData() {
  const tripName = document.getElementById('tripNameBanner')?.textContent || '';
  const tripDestination = document.getElementById('tripDestinationBanner')?.textContent || '';
  const tripDate = document.getElementById('tripDateBanner')?.textContent || '';
  let tripStartDate = document.getElementById('tripStartDate')?.value || '';
  let tripEndDate = document.getElementById('tripEndDate')?.value || '';

  if (tripStartDate) tripStartDate = formatShortDate(new Date(tripStartDate));
  if (tripEndDate) tripEndDate = formatShortDate(new Date(tripEndDate));

  const tripDescription = document.getElementById('tripDescriptionBanner')?.textContent || '';
  const days = collectDaysData();

  return {
    tripName,
    tripDestination,
    tripDate,
    tripStartDate,
    tripEndDate,
    tripDescription,
    days
  };
}

function collectDaysData() {
  const days = [];
  const daySections = document.querySelectorAll('.day-section');

  daySections.forEach((section) => {
    const dayData = {
      date: section.querySelector('.day-header h3')?.textContent || '',
      places: []
    };

    const localCards = section.querySelectorAll('.local-card');
    localCards.forEach((card) => {
      const placeData = {
        name: card.querySelector('.local-title')?.textContent || '',
        address: card.querySelector('.local-address')?.textContent || '',
        rating: card.querySelector('.local-rating .stars')?.textContent || '',
        img: card.querySelector('.local-img img')?.src || '',
        lat: card.dataset.lat || null,
        lng: card.dataset.lng || null,
        key: card.dataset.key || null
      };
      dayData.places.push(placeData);
    });
    days.push(dayData);
  });

  return days;
}

function updateUIWithLoadedData(data) {
  const { days } = data;

  if (days && Array.isArray(days)) {
    const daySections = document.querySelectorAll('.day-section');
    days.forEach((dayData, index) => {
      const section = daySections[index];
      if (!section) return;

      const h3 = section.querySelector('.day-header h3');
      if (h3) h3.textContent = dayData.date;

      section.querySelectorAll('.local-card').forEach(card => card.remove());

      const timeline = section.querySelector('.day-timeline') || (() => {
        const t = document.createElement('div');
        t.className = 'day-timeline';
        t.innerHTML = '<div class="timeline-line"></div>';
        const addBtn = section.querySelector('.add-place-btn');
        if (addBtn) section.insertBefore(t, addBtn);
        else section.appendChild(t);
        return t;
      })();

      if (dayData.places && Array.isArray(dayData.places)) {
        dayData.places.forEach(place => {
          const key = place.key || ((place.name || '') + '|' + (place.address || '') + '|' + (place.lat || '') + '|' + (place.lng || ''));
          const card = createLocalCard({ ...place, key });
          if (card) {
            timeline.appendChild(card);
            attachLocalCardActions(card);
          }
        });
      }
    });
  }

  attachRoadmapEventListeners();
  setTimeout(updateFinanceSummary, 100);
  setTimeout(adjustTimelineHeight, 120);

  if (days && Array.isArray(days)) {
    const allPlaces = days
      .flatMap(day => day.places)
      .filter(p => p.lat && p.lng)
      .map(p => ({
        ...p,
        lat: Number(p.lat),
        lng: Number(p.lng),
        key: p.key || ((p.name || '') + '|' + (p.address || '') + '|' + (p.lat || '') + '|' + (p.lng || '')),
        types: p.types || ['lodging', 'restaurant', 'tourist_attraction']
      }))
      .filter(p => !isNaN(p.lat) && !isNaN(p.lng));
    if (typeof updateMap === 'function') {
      updateMap(allPlaces);
    }
  }

  const dayContents = document.querySelectorAll('.day-content');
  dayContents.forEach(content => {
    content.style.maxHeight = '0';
    content.classList.remove('active');
  });
}

function updateElement(id, value, isHtml = false) {
  const el = document.getElementById(id);
  if (el) {
    if (isHtml) el.innerHTML = value;
    else el.textContent = value;
  }
}

export function moveFinanceSummaryAfterDays() {
  const tabItinerary = document.getElementById('tab-itinerary');
  const finance = document.getElementById('financeSummaryRow');
  if (!tabItinerary || !finance) return;

  const days = tabItinerary.querySelectorAll('.day-section');
  if (days.length > 0) {
    days[days.length - 1].after(finance);
  } else {
    tabItinerary.prepend(finance);
  }
}

function parseDate(str) {
  console.log('[DEBUG] parseDate input:', str);
  if (!str || typeof str !== 'string') return null;

  // Se vier no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    console.log('[DEBUG] parseDate YYYY-MM-DD result:', date);
    return date;
  }

  // Se vier no formato 'DD mon YYYY'
  const parts = str.split(' ');
  if (parts.length === 3) {
    const [dia, mes, ano] = parts;
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const idx = meses.findIndex(m => mes && mes.toLowerCase().startsWith(m));
    if (idx !== -1) {
      const date = new Date(Number(ano), idx, parseInt(dia));
      console.log('[DEBUG] parseDate DD mon YYYY result:', date);
      return date;
    }
  }

  // fallback
  const date = new Date(str);
  console.log('[DEBUG] parseDate fallback result:', date);
  return isNaN(date.getTime()) ? null : date;
}

export function getPlaceData(input, place) {
  if (place) {
    return {
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      rating: place.rating,
    };
  }
  if (input && input.value) {
    return {
      name: input.value,
      address: '',
      lat: null,
      lng: null
    };
  }
  return null;
}

function getRandomPlaceImage() {
  const rand = Math.floor(Math.random() * 10000);
  return `https://source.unsplash.com/400x300/?travel,city,landscape&sig=${rand}`;
}

function adjustTimelineHeight() {
    const timelines = document.querySelectorAll('.day-timeline');
    timelines.forEach(timeline => {
        const line = timeline.querySelector('.timeline-line');
        if (line) {
            const lastChild = timeline.lastElementChild;
            if (lastChild && lastChild !== line) {
                const height = lastChild.offsetTop + lastChild.offsetHeight / 2;
                line.style.height = `${height}px`;
            } else {
                line.style.height = '0px';
            }
    }
  });
}

export function getTrashSVG() {
  return `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M3 6h18M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" stroke="#555" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function getDragHandleSVG() {
  return `<span class="drag-handle" title="Arraste para mover">&#9776;</span>`;
}
