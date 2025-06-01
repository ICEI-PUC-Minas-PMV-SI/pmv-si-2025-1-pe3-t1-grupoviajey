import { includeSearchBar } from '../../js/utils/include.js';

document.addEventListener('DOMContentLoaded', () => {
  includeSearchBar();
  // ...outros includes...
});

function initAutocomplete() {
  const input = document.getElementById('autocomplete');
  if (input && window.google && window.google.maps) {
    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['(cities)'],
    });
    autocomplete.addListener('place_changed', function() {
      const place = autocomplete.getPlace();
      if (place.address_components) {
        const city = place.address_components.find(comp => comp.types.includes('locality'));
        if (city) {
          input.value = city.long_name;
        } else {
          input.value = place.name;
        }
      }
    });
  }
}

if (window.google && window.google.maps && window.google.maps.places) {
  initAutocomplete();
} else {
  let interval = setInterval(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      clearInterval(interval);
      initAutocomplete();
    }
  }, 100);
}

// Flatpickr para calendário
const calendarBtn = document.querySelector('.calendar-btn');
let fp = null;

if (calendarBtn) {
  let input = document.getElementById('date-range');
  if (!input) {
    input = document.createElement('input');
    input.type = 'text';
    input.id = 'date-range';
    input.style.display = 'none';
    calendarBtn.parentNode.appendChild(input);
  }

  fp = flatpickr(input, {
    mode: 'range',
    minDate: 'today',
    dateFormat: 'D, d \\de M',
    locale: 'pt',
    showMonths: 2,
    positionElement: calendarBtn,
    onClose: function(selectedDates) {
      if (selectedDates.length === 2) {
        const opts = { weekday: 'short', day: '2-digit', month: 'short' };
        const start = selectedDates[0].toLocaleDateString('pt-BR', opts).replace('.', '');
        const end = selectedDates[1].toLocaleDateString('pt-BR', opts).replace('.', '');
        calendarBtn.querySelector('.calendar-text').textContent = `${start} — ${end}`;
      }
    }
  });

  calendarBtn.addEventListener('click', function(e) {
    e.preventDefault();
    fp.open();
  });
}

// Redireciona para a página de resultados ao clicar em Pesquisar
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
  searchBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const cidade = document.getElementById('autocomplete')?.value || '';
    let checkin = '', checkout = '';
    const fpInstance = document.getElementById('date-range')?._flatpickr;
    if (fpInstance && fpInstance.selectedDates.length === 2) {
      const [start, end] = fpInstance.selectedDates;
      checkin = `${String(start.getDate()).padStart(2, '0')}/${String(start.getMonth()+1).padStart(2, '0')}/${start.getFullYear()}`;
      checkout = `${String(end.getDate()).padStart(2, '0')}/${String(end.getMonth()+1).padStart(2, '0')}/${end.getFullYear()}`;
    }
    const tipo = 'hotel';
    // Salva no localStorage
    localStorage.setItem('buscaViajey', JSON.stringify({ cidade, checkin, checkout, tipo }));
    // Monta a query string
    const params = new URLSearchParams({ cidade, checkin, checkout, tipo });
    window.location.href = '../search-results/search-results.html?' + params.toString();
  });
}