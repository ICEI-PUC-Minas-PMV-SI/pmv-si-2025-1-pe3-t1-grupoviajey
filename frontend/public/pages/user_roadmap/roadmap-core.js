// Importações
import { roadmapStorage } from './roadmap-storage.js';
import { updateFinanceSummary } from './roadmap-finance.js';
import { attachRoadmapEventListeners } from './roadmap-events.js';
import { attachLocalCardActions } from './roadmap-utils.js';
import { updateMap } from './roadmap-map.js';

// =============================================
// CRIAÇÃO E GESTÃO DE DIAS
// =============================================

export function createDaysFromStorage(tripStart, tripEnd) {
  console.log('[DEBUG] createDaysFromStorage tripStart:', tripStart, 'tripEnd:', tripEnd);
  const tabItinerary = document.getElementById('tab-itinerary');
  if (!tabItinerary) return;

  // Remove apenas os dias existentes
  tabItinerary.querySelectorAll('.day-section').forEach(ds => ds.remove());

  if (!tripStart || !tripEnd) return;

  const startDate = parseDate(tripStart);
  const endDate = parseDate(tripEnd);
  console.log('[DEBUG] startDate:', startDate, 'endDate:', endDate);
  if (!startDate || !endDate) return;

  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  let count = 0;

  while (current <= end) {
    const diaSemana = dias[current.getDay()];
    const dia = String(current.getDate()).padStart(2, '0');
    const mes = meses[current.getMonth()];
    const ano = current.getFullYear();

    const section = createDaySection(diaSemana, dia, mes, ano);
    tabItinerary.appendChild(section);

    // Garante que o conteúdo do dia está visível e o accordion está expandido
    const content = section.querySelector('.day-content');
    const arrow = section.querySelector('.day-arrow svg');
    if (content) {
      content.style.display = 'block';
      content.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
    if (arrow) {
      arrow.style.transform = 'rotate(180deg)';
    }

    count++;
    current.setDate(current.getDate() + 1);
  }

  console.log('[DEBUG] Dias criados:', count);
  moveFinanceSummaryAfterDays();

  // Força a atualização do DOM
  setTimeout(() => {
    // Reativa os event listeners
    attachRoadmapEventListeners();

    // Garante que todos os accordions estão visíveis
    const dayContents = document.querySelectorAll('.day-content');
    dayContents.forEach(content => {
      content.style.display = 'block';
      content.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
    });

    const arrows = document.querySelectorAll('.day-arrow svg');
    arrows.forEach(arrow => {
      arrow.style.transform = 'rotate(180deg)';
    });
  }, 0);
}

function createDaySection(diaSemana, dia, mes, ano) {
  const section = document.createElement('div');
  section.className = 'day-section';
  section.innerHTML = `
    <div class="day-header">
      <h3>${diaSemana}, ${dia} de ${mes} de ${ano}</h3>
      <span class="day-arrow"><svg width="20" height="20" viewBox="0 0 20 24"><path d="M6 8l4 4 4-4" stroke="#1a3c4e" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span>
    </div>
    <div class="day-content">
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

  const key = placeData.key || (
    (placeData.name || placeData.placeName || '') + '|' +
    (placeData.address || placeData.placeAddress || '') + '|' +
    (placeData.geometry?.location?.lat?.() || placeData.lat || '') + '|' +
    (placeData.geometry?.location?.lng?.() || placeData.lng || '')
  );

  const card = createLocalCard({ ...placeData, key });
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

  const placeToSave = {
    name: placeData.name || placeData.placeName,
    address: placeData.address || placeData.placeAddress,
    rating: placeData.rating || placeData.placeRating,
    img: placeData.img,
    lat: placeData.geometry?.location?.lat() || placeData.lat,
    lng: placeData.geometry?.location?.lng() || placeData.lng,
    key
  };

  saveRoadmapToStorage();
  adjustTimelineHeight();

  const roadmap = JSON.parse(localStorage.getItem('userRoadmapData'));
  if (roadmap && Array.isArray(roadmap.days)) {
    const allPlaces = roadmap.days
      .flatMap(day => day.places)
      .filter(p => p.lat && p.lng)
      .map(p => {
        const lat = Number(p.lat);
        const lng = Number(p.lng);
        console.log('Convertendo coordenadas:', { original: p, converted: { lat, lng } });
        return {
          ...p,
          lat,
          lng,
          key: p.key || ((p.name || '') + '|' + (p.address || '') + '|' + lat + '|' + lng),
          types: p.types || ['lodging', 'restaurant', 'tourist_attraction']
        };
      })
      .filter(p => !isNaN(p.lat) && !isNaN(p.lng));

    console.log('Places para atualizar mapa:', allPlaces);
    updateMap(allPlaces);
  }

  dayContent.classList.add('active');
  dayContent.style.maxHeight = dayContent.scrollHeight + 'px';
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

  // Armazena as coordenadas nos atributos data
  if (geometry?.location) {
    card.dataset.lat = geometry.location.lat();
    card.dataset.lng = geometry.location.lng();
  } else if (lat && lng) {
    card.dataset.lat = lat;
    card.dataset.lng = lng;
  }

  // Adiciona o key como atributo data
  if (key) {
    card.dataset.key = key;
  }

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
// STORAGE
// =============================================

export function saveRoadmapToStorage() {
  try {
    const data = collectRoadmapData();
    return roadmapStorage.save(data);
  } catch (error) {
    console.error('Error saving roadmap:', error);
    return false;
  }
}

export function loadRoadmapFromStorage() {
  try {
    const data = roadmapStorage.load();
    if (!data) return false;

    if (data.tripStart && data.tripEnd) {
      createDaysFromStorage(data.tripStart, data.tripEnd);
    }

    updateUIWithLoadedData(data);
    return true;
  } catch (error) {
    console.error('Error loading roadmap:', error);
    return false;
  }
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

function collectRoadmapData() {
  const tripName = document.getElementById('tripNameBanner')?.textContent || '';
  const tripDestination = document.getElementById('tripDestinationBanner')?.textContent || '';
  const tripDate = document.getElementById('tripDateBanner')?.textContent || '';
  let tripStart = document.getElementById('tripStart')?.value || '';
  let tripEnd = document.getElementById('tripEnd')?.value || '';

  if (tripStart) tripStart = formatShortDate(new Date(tripStart));
  if (tripEnd) tripEnd = formatShortDate(new Date(tripEnd));

  const tripDescription = document.getElementById('tripDescriptionBanner')?.textContent || '';
  const days = collectDaysData();

  return {
    tripName,
    tripDestination,
    tripDate,
    tripStart,
    tripEnd,
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
  const dayContents = document.querySelectorAll('.day-content');
  dayContents.forEach(content => {
    const timeline = content.querySelector('.day-timeline');
    if (timeline) {
      // Calcula a altura total dos cards e elementos dentro da timeline
      const cards = timeline.querySelectorAll('.local-card, .timeline-note, .timeline-expense');
      let totalHeight = 0;

      cards.forEach(card => {
        const cardHeight = card.offsetHeight;
        const cardMargin = parseInt(window.getComputedStyle(card).marginBottom);
        totalHeight += cardHeight + cardMargin;
      });
    }
  });
}

export function getTrashSVG() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`;
}

export function getDragHandleSVG() {
  return `<span class="drag-handle" title="Arraste para mover">&#9776;</span>`;
}
