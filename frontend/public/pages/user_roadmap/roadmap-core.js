// Importações
import { roadmapStorage } from './roadmap-storage.js';
import { updateFinanceSummary } from './roadmap-finance.js';
import { attachRoadmapEventListeners } from './roadmap-events.js';

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
            <button class="add-place-btn outlined">+ Adicionar local</button>
          </div>
        </div>
    `;
    return section;
}

// =============================================
// GESTÃO DE LOCAIS
// =============================================

export function handleAddToTimeline(placeData, dayContent) {
    const card = createLocalCard(placeData);
    let timeline = dayContent.querySelector('.day-timeline');

    if (!timeline) {
        timeline = createTimeline(dayContent);
    }

    timeline.appendChild(card);
    attachLocalCardActions(card);
    saveRoadmapToStorage();
}

export function createTimeline(dayContent) {
    let timeline = dayContent.querySelector('.day-timeline');
    if (!timeline) {
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
    return timeline;
}

// =============================================
// CRIAÇÃO DE ELEMENTOS
// =============================================

function createLocalCard(placeData) {
    // ... existing code ...
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

        // Cria os dias do roteiro conforme as datas salvas
        if (data.tripStart && data.tripEnd) {
            createDaysFromStorage(data.tripStart, data.tripEnd);
        }

        // Atualiza a UI com os dados carregados
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
                img: card.querySelector('.local-img img')?.src || ''
            };
            dayData.places.push(placeData);
        });
        days.push(dayData);
    });

    return days;
}

function updateUIWithLoadedData(data) {
    const { days } = data;

    // Processa os dias e locais
    if (days && Array.isArray(days)) {
        const daySections = document.querySelectorAll('.day-section');
        days.forEach((dayData, index) => {
            const section = daySections[index];
            if (!section) return;

            // Atualiza data
            const h3 = section.querySelector('.day-header h3');
            if (h3) h3.textContent = dayData.date;

            // Remove locais antigos
            section.querySelectorAll('.local-card').forEach(card => card.remove());

            // Adiciona locais salvos
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
                    const card = createLocalCard(place);
                    if (card) {
                        timeline.appendChild(card);
                        attachLocalCardActions(card);
                    }
                });
            }
        });
    }

    // Reatribui listeners e atualiza UI
    attachRoadmapEventListeners();
    setTimeout(updateFinanceSummary, 100);
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

export function getPlaceData(input, lastSelectedPlace) {
    if (!input) return null;

    // Prioriza dados do Google Places
    if (lastSelectedPlace) {
        return {
            name: lastSelectedPlace.name,
            address: lastSelectedPlace.formatted_address || lastSelectedPlace.vicinity || '',
            rating: lastSelectedPlace.rating,
            img: getRandomPlaceImage()
        };
    }

    // Fallback para input manual
    const placeName = input.value.trim();
    if (!placeName) return null;

    return {
        name: placeName,
        address: '',
        rating: null,
        img: getRandomPlaceImage()
    };
}

function getRandomPlaceImage() {
    const rand = Math.floor(Math.random() * 10000);
    return `https://source.unsplash.com/400x300/?travel,city,landscape&sig=${rand}`;
}