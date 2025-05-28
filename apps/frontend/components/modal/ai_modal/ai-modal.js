function initAiModal() {
  // IDs dos modais na ordem do fluxo
  const modalOrder = [
    'destination-modal',
    'travel-dates-modal',
    'companions-modal',
    'interests-modal',
    'budget-modal',
    'summary-modal'
  ];
  let currentModal = 0;

  // Estado dos dados
  const state = {
    destino: '',
    dataIda: '',
    dataVolta: '',
    companhia: '',
    interesses: [],
    orcamento: '',
    pet: '',
    orcamentoTipo: '',
    orcamentoFormatado: ''
  };

  let aiFp = null;
  function showModal(idx) {
    modalOrder.forEach((id, i) => {
      document.getElementById(id).style.display = (i === idx) ? 'block' : 'none';
    });
    currentModal = idx;

    // Inicializa o Flatpickr somente quando o modal de datas for exibido
    if (modalOrder[idx] === 'travel-dates-modal') {
      const aiDateRangeInput = document.getElementById('ai-date-range');
      if (aiDateRangeInput && !aiFp) {
        console.log('Inicializando Flatpickr no input do modal...');
        aiFp = flatpickr(aiDateRangeInput, {
          mode: 'range',
          minDate: 'today',
          dateFormat: 'd/m/Y',
          locale: 'pt',
          showMonths: 2,
          inline: true,
          onChange: function(selectedDates) {
            if (selectedDates.length === 2) {
              state.dataIda = selectedDates[0].toISOString().split('T')[0];
              state.dataVolta = selectedDates[1].toISOString().split('T')[0];
            }
          }
        });
      }
    }
  }

  // Navegação dos botões
  // Destino
  const destinationContinue = document.getElementById('destination-continue');
  destinationContinue.onclick = function() {
    const input = document.querySelector('#destination-modal .ai-modal-search-input');
    if (input.value.trim()) {
      state.destino = input.value.trim();
      showModal(1);
    } else {
      input.focus();
    }
  };
  document.getElementById('destination-inspire').onclick = function() {
    // Inspiração: apenas avança para o próximo modal
    state.destino = 'AI Sugerido';
    showModal(1);
  };

  // Datas
  const datesBack = document.getElementById('dates-back');
  datesBack.onclick = function() { showModal(0); };
  document.getElementById('dates-continue').onclick = function() {
    if (state.dataIda && state.dataVolta) {
      showModal(2);
    }
  };

  // Companhia
  const companionsBack = document.getElementById('companions-back');
  companionsBack.onclick = function() { showModal(1); };
  document.getElementById('companions-continue').onclick = function() {
    if (state.companhia) showModal(3);
  };
  // Seleção única para cards de companhia
  Array.from(document.querySelectorAll('#companions-cards .ai-modal-card')).forEach(card => {
    card.onclick = function() {
      Array.from(document.querySelectorAll('#companions-cards .ai-modal-card')).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.companhia = card.getAttribute('data-value');
    };
  });
  // Seleção única para botões de pet
  const petBtns = document.querySelectorAll('.companions-pet-btn');
  petBtns.forEach(btn => {
    btn.onclick = function() {
      petBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.pet = btn.getAttribute('data-value');
    };
  });

  // Interesses
  const interestsBack = document.getElementById('interests-back');
  interestsBack.onclick = function() { showModal(2); };
  document.getElementById('interests-continue').onclick = function() {
    if (state.interesses.length > 0) showModal(4);
  };
  // Seleção múltipla
  Array.from(document.querySelectorAll('#interests-cards .ai-modal-card')).forEach(card => {
    card.onclick = function() {
      card.classList.toggle('selected');
      const value = card.getAttribute('data-value');
      if (card.classList.contains('selected')) {
        if (!state.interesses.includes(value)) state.interesses.push(value);
      } else {
        state.interesses = state.interesses.filter(i => i !== value);
      }
    };
  });

  // Adicionar interesse customizado
  const showAddInterestBtn = document.getElementById('show-add-interest');
  const addInterestForm = document.getElementById('add-interest-form');
  const addInterestInput = addInterestForm.querySelector('.interests-add-input');
  const addInterestConfirm = addInterestForm.querySelector('.interests-add-confirm');
  const interestsCardsGrid = document.getElementById('interests-cards');

  showAddInterestBtn.onclick = function() {
    addInterestForm.style.display = 'flex';
    addInterestInput.focus();
  };
  addInterestConfirm.onclick = function() {
    const value = addInterestInput.value.trim();
    if (!value) return addInterestInput.focus();
    // Não permite duplicados
    if ([...interestsCardsGrid.querySelectorAll('.ai-modal-card')].some(card => card.getAttribute('data-value').toLowerCase() === value.toLowerCase())) {
      addInterestInput.value = '';
      addInterestInput.focus();
      return;
    }
    // Cria novo card
    const card = document.createElement('div');
    card.className = 'ai-modal-card selected';
    card.setAttribute('data-value', value);
    card.innerHTML = `<div class='icon-placeholder'></div>${value}`;
    interestsCardsGrid.appendChild(card);
    // Seleciona e adiciona ao estado
    state.interesses.push(value);
    card.onclick = function() {
      card.classList.toggle('selected');
      if (card.classList.contains('selected')) {
        if (!state.interesses.includes(value)) state.interesses.push(value);
      } else {
        state.interesses = state.interesses.filter(i => i !== value);
      }
    };
    addInterestInput.value = '';
    addInterestForm.style.display = 'none';
  };

  // Orçamento: seleção de tipo
  const budgetTypeDaily = document.getElementById('budget-type-daily');
  const budgetTypeTotal = document.getElementById('budget-type-total');
  const budgetInputRow = document.getElementById('budget-input-row');
  function selectBudgetType(tipo) {
    state.orcamentoTipo = tipo;
    budgetInputRow.style.display = 'flex';
    if (tipo === 'diario') {
      budgetTypeDaily.classList.add('selected');
      budgetTypeTotal.classList.remove('selected');
    } else {
      budgetTypeTotal.classList.add('selected');
      budgetTypeDaily.classList.remove('selected');
    }
  }
  budgetTypeDaily.onclick = function() { selectBudgetType('diario'); };
  budgetTypeTotal.onclick = function() { selectBudgetType('total'); };

  // Orçamento
  const budgetBack = document.getElementById('budget-back');
  budgetBack.onclick = function() { showModal(3); };
  document.getElementById('budget-continue').onclick = function() {
    const input = document.querySelector('#budget-modal .ai-modal-budget-input');
    if (input.value) {
      state.orcamento = input.value;
      showModal(5);
      fillSummary();
    } else {
      input.focus();
    }
  };

  // Resumo
  const summaryBack = document.getElementById('summary-back');
  summaryBack.onclick = function() { showModal(4); };
  document.getElementById('summary-generate').onclick = function() {
    alert('Geração de roteiro por IA acionada!');
  };

  function fillSummary() {
    document.getElementById('summary-destino').textContent = state.destino;
    document.getElementById('summary-datas').textContent = `${state.dataIda} a ${state.dataVolta}`;
    let orcamentoLabel = state.orcamentoTipo === 'total' ? 'Orçamento total' : 'Orçamento diário';
    let valor = state.orcamentoFormatado || '';
    document.getElementById('summary-orcamento').textContent = valor ? `${orcamentoLabel}: ${valor}` : '';
    document.getElementById('summary-companhia').textContent = state.companhia;
    document.getElementById('summary-interesses').textContent = state.interesses.join(', ');
  }

  // Função para abrir o modal (pode ser chamada externamente)
  window.openAiModal = function() {
    document.getElementById('ai-modal-overlay').style.display = 'flex';
    showModal(0);
    // Inicializa autocomplete Google Places SEM _autocompleteInit
    if (window.google && window.google.maps && window.google.maps.places) {
      const destinationInput = document.querySelector('#destination-modal .ai-modal-search-input');
      if (destinationInput) {
        new google.maps.places.Autocomplete(destinationInput, {
          types: ['(cities)'],
          componentRestrictions: { country: 'br' }
        });
      }
    }
  };

  // Fechar modal com ESC e clicando fora
  const overlay = document.getElementById('ai-modal-overlay');
  overlay.addEventListener('mousedown', function(e) {
    if (e.target === overlay) {
      overlay.style.display = 'none';
      // Resetar estado e campos (igual ao botão X)
      state.destino = '';
      state.dataIda = '';
      state.dataVolta = '';
      state.companhia = '';
      state.interesses = [];
      state.orcamento = '';
      state.pet = '';
      document.querySelectorAll('.ai-modal-search-input').forEach(i => i.value = '');
      if (aiFp) aiFp.clear();
      document.querySelectorAll('.ai-modal-budget-input').forEach(i => i.value = '');
      document.querySelectorAll('.ai-modal-card.selected').forEach(c => c.classList.remove('selected'));
      document.querySelectorAll('.companions-pet-btn.selected').forEach(b => b.classList.remove('selected'));
      const interestsCardsGrid = document.getElementById('interests-cards');
      Array.from(interestsCardsGrid.querySelectorAll('.ai-modal-card')).forEach(card => {
        const value = card.getAttribute('data-value');
        if (!['Natureza','Aventura','Gastronomia','Vida Noturna','Cultura','Compras','Relaxamento','Esportes'].includes(value)) {
          card.remove();
        }
      });
      document.getElementById('add-interest-form').style.display = 'none';
      document.querySelectorAll('.interests-add-input').forEach(i => i.value = '');
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      overlay.style.display = 'none';
      // Resetar estado e campos (igual ao botão X)
      state.destino = '';
      state.dataIda = '';
      state.dataVolta = '';
      state.companhia = '';
      state.interesses = [];
      state.orcamento = '';
      state.pet = '';
      document.querySelectorAll('.ai-modal-search-input').forEach(i => i.value = '');
      if (aiFp) aiFp.clear();
      document.querySelectorAll('.ai-modal-budget-input').forEach(i => i.value = '');
      document.querySelectorAll('.ai-modal-card.selected').forEach(c => c.classList.remove('selected'));
      document.querySelectorAll('.companions-pet-btn.selected').forEach(b => b.classList.remove('selected'));
      const interestsCardsGrid = document.getElementById('interests-cards');
      Array.from(interestsCardsGrid.querySelectorAll('.ai-modal-card')).forEach(card => {
        const value = card.getAttribute('data-value');
        if (!['Natureza','Aventura','Gastronomia','Vida Noturna','Cultura','Compras','Relaxamento','Esportes'].includes(value)) {
          card.remove();
        }
      });
      document.getElementById('add-interest-form').style.display = 'none';
      document.querySelectorAll('.interests-add-input').forEach(i => i.value = '');
    }
  });

  // Botões de fechar (X)
  document.querySelectorAll('.ai-modal-btn-close').forEach(btn => {
    btn.onclick = function() {
      overlay.style.display = 'none';
      // Resetar estado e campos (igual ESC/click fora)
      state.destino = '';
      state.dataIda = '';
      state.dataVolta = '';
      state.companhia = '';
      state.interesses = [];
      state.orcamento = '';
      state.pet = '';
      document.querySelectorAll('.ai-modal-search-input').forEach(i => i.value = '');
      if (aiFp) aiFp.clear();
      document.querySelectorAll('.ai-modal-budget-input').forEach(i => i.value = '');
      document.querySelectorAll('.ai-modal-card.selected').forEach(c => c.classList.remove('selected'));
      document.querySelectorAll('.companions-pet-btn.selected').forEach(b => b.classList.remove('selected'));
      const interestsCardsGrid = document.getElementById('interests-cards');
      Array.from(interestsCardsGrid.querySelectorAll('.ai-modal-card')).forEach(card => {
        const value = card.getAttribute('data-value');
        if (!['Natureza','Aventura','Gastronomia','Vida Noturna','Cultura','Compras','Relaxamento','Esportes'].includes(value)) {
          card.remove();
        }
      });
      document.getElementById('add-interest-form').style.display = 'none';
      document.querySelectorAll('.interests-add-input').forEach(i => i.value = '');
    };
  });

  // Máscara de moeda no input de orçamento
  const budgetInput = document.querySelector('.ai-modal-budget-input');
  const currencySelect = document.querySelector('.ai-modal-currency-select');
  function formatCurrency(value, currency) {
    let locale = 'pt-BR', curr = 'BRL';
    if (currency === 'USD') { locale = 'en-US'; curr = 'USD'; }
    if (currency === 'EUR') { locale = 'de-DE'; curr = 'EUR'; }
    return new Intl.NumberFormat(locale, { style: 'currency', currency: curr, minimumFractionDigits: 2 }).format(value/100);
  }
  function getRawValue(str) {
    return Number(str.replace(/\D/g, ''));
  }
  function updateBudgetInputMask() {
    let raw = getRawValue(budgetInput.value);
    const formatted = formatCurrency(raw, currencySelect.value);
    budgetInput.value = formatted.replace(/[^0-9.,]/g, '');
    state.orcamentoFormatado = formatted;
  }
  budgetInput.addEventListener('input', function(e) {
    let raw = getRawValue(budgetInput.value);
    const formatted = formatCurrency(raw, currencySelect.value);
    budgetInput.value = formatted.replace(/[^0-9.,]/g, '');
    state.orcamento = (raw/100).toFixed(2);
    state.orcamentoFormatado = formatted;
  });
  currencySelect.addEventListener('change', function() {
    updateBudgetInputMask();
  });
  budgetInput.addEventListener('keydown', function(e) {
    // Permite: backspace, delete, tab, escape, enter, setas, ctrl/cmd+A/C/V/X, home/end
    if ([
      'Backspace','Delete','Tab','Escape','Enter','ArrowLeft','ArrowRight','Home','End'
    ].includes(e.key) || (e.ctrlKey || e.metaKey)) return;
    // Permite números
    if ((e.key >= '0' && e.key <= '9')) return;
    // Bloqueia o resto
    e.preventDefault();
  });
}

// Só inicializa quando o overlay estiver no DOM
(function() {
  function tryInit() {
    if (document.getElementById('ai-modal-overlay')) {
      initAiModal();
    } else {
      setTimeout(tryInit, 50);
    }
  }
  tryInit();
})(); 