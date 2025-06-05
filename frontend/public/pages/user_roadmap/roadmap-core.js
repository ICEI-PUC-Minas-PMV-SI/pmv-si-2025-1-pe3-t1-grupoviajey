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
    const tabItinerary = document.getElementById('tab-itinerary');
    if (!tabItinerary) return;
    tabItinerary.querySelectorAll('.day-section').forEach(ds => ds.remove());
    if (!tripStart || !tripEnd) return;

    const startDate = parseDate(tripStart);
    const endDate = parseDate(tripEnd);
    if (!startDate || !endDate) return;

    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    let current = new Date(startDate.getTime());

    while (current <= endDate) {
        const diaSemana = dias[current.getDay()];
        const dia = current.getDate().toString().padStart(2, '0');
        const mes = meses[current.getMonth()];
        const ano = current.getFullYear();

        const section = createDaySection(diaSemana, dia, mes, ano);
        tabItinerary.appendChild(section);
        current.setDate(current.getDate() + 1);
    }

    moveFinanceSummaryAfterDays();
}

function createDaySection(diaSemana, dia, mes, ano) {
    const section = document.createElement('div');
    section.className = 'day-section';
    section.innerHTML = `
        <div class="day-header clickable">
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
    // Gera um key único e persistente para o local
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
    const addBtn = dayContent.querySelector('.add-place-btn');
    if (addBtn) {
        dayContent.insertBefore(card, addBtn);
    } else {
        dayContent.appendChild(card);
    }
    attachLocalCardActions(card);

    // Salva os dados do local com as coordenadas e key
    const placeToSave = {
        name: placeData.name || placeData.placeName,
        address: placeData.address || placeData.placeAddress,
        rating: placeData.rating || placeData.placeRating,
        img: placeData.img,
        lat: placeData.geometry?.location?.lat() || placeData.lat,
        lng: placeData.geometry?.location?.lng() || placeData.lng,
        key
    };

    // Atualiza o storage com o novo local
    saveRoadmapToStorage();
    adjustTimelineHeight();

    // Atualiza o mapa com todos os lugares do roteiro
    const roadmap = JSON.parse(localStorage.getItem('userRoadmapData'));
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

function createLocalCard({ name, address, rating, img, key, placeName, placeAddress, placeRating, lat, lng, geometry }) {
    let ratingHtml = '';
    const ratingNumber = typeof rating === 'number' ? rating : (typeof placeRating === 'number' ? placeRating : null);
    if (ratingNumber) {
        ratingHtml = `<div class="local-rating"><span class="stars">${'★'.repeat(Math.round(ratingNumber))}</span></div>`;
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

    card.innerHTML = `
        <button class="remove-place-btn" title="Remover local">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        </button>
        <div class="local-img">${img ? `<img src="${img}" alt="Imagem do local" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : ''}</div>
        <div class="local-info">
          <div class="local-title">${name || placeName || ''}</div>
          <div class="local-address">${address || placeAddress || ''}</div>
          ${ratingHtml}
          <div class="local-actions">
            <button class="local-note-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M4 4h12v12H4z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M6 8h8M6 12h5" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> Anotação</button>
            <button class="local-expense-btn"><svg width="16" height="16" viewBox="0 0 20 20"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v7A2.5 2.5 0 0 1 14.5 16h-9A2.5 2.5 0 0 1 3 13.5v-7Z" fill="none" stroke="#0a7c6a" stroke-width="1.5"/><path d="M7 10h6M10 8v4" stroke="#0a7c6a" stroke-width="1.2" stroke-linecap="round"/></svg> Gastos</button>
          </div>
        </div>
    `;
    return card;
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
                lng: card.dataset.lng || null
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
                    // Gera key único para cada card
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

    // Atualiza o mapa com todos os locais do roteiro ao carregar a página
    if (days && Array.isArray(days)) {
        const allPlaces = days
            .flatMap(day => day.places)
            .filter(p => p.lat && p.lng)
            .map(p => ({
                ...p,
                latitude: Number(p.lat),
                longitude: Number(p.lng),
                key: p.key || ((p.name || '') + '|' + (p.address || '') + '|' + (p.lat || '') + '|' + (p.lng || '')),
                types: p.types || ['lodging', 'restaurant', 'tourist_attraction']
            }));
        if (typeof updateMap === 'function') {
            updateMap(allPlaces);
        }
    }
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
    if (!str) return null;
    const [dia, mes, ano] = str.split(' ');
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const idx = meses.findIndex(m => mes && mes.toLowerCase().startsWith(m));
    if (idx !== -1) {
        return new Date(Number(ano), idx, parseInt(dia));
    }
    return new Date(str);
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