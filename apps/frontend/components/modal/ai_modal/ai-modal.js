function initAiModal() {
  // IDs dos modais na ordem do fluxo
  const modalOrder = [
    'destination-modal',
    'travel-dates-modal',
    'companions-modal',
    'interests-modal',
    'budget-modal',
    'summary-modal',
    'months-modal',
    'location-modal',
    'loading-modal'
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
    orcamentoFormatado: '',
    dias: 7,
    meses: [],
    localizacao: ''
  };

  let aiFp = null;
  // Pilha de navegação para Voltar
  let modalHistory = [];
  function showModal(idx, pushHistory = true) {
    modalOrder.forEach((id, i) => {
      document.getElementById(id).style.display = (i === idx) ? 'block' : 'none';
    });
    if (pushHistory && typeof currentModal === 'number' && idx !== currentModal) {
      modalHistory.push(currentModal);
    }
    currentModal = idx;
    // Desativa o botão Voltar no modal de interesses se for "Qual a sua vibe para essa viagem?"
    if (modalOrder[idx] === 'interests-modal') {
      const interestsTitle = document.querySelector('#interests-modal h2');
      const interestsBackBtn = document.getElementById('interests-back');
      const interestsContinueBtn = document.getElementById('interests-continue');
      if (interestsTitle && interestsBackBtn && interestsContinueBtn) {
        if (interestsTitle.textContent === 'Qual a sua vibe para essa viagem?') {
          interestsBackBtn.style.display = 'none';
          interestsContinueBtn.style.marginLeft = 'auto';
        } else {
          interestsBackBtn.style.display = '';
          interestsContinueBtn.style.marginLeft = '';
        }
      }
    }

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
            state.dataIda = selectedDates[0]?.toISOString().split('T')[0] || '';
            state.dataVolta = selectedDates[1]?.toISOString().split('T')[0] || '';
            datesContinue.disabled = selectedDates.length !== 2;
          }
        });
      } else if (aiFp) {
        // Garante que o listener está correto mesmo se já inicializado
        setupFlatpickrListener();
      }
    }
  }

  function goBackModal() {
    if (modalHistory.length > 0) {
      const prev = modalHistory.pop();
      showModal(prev, false);
    }
  }

  // Navegação dos botões
  // Destino
  const destinationContinue = document.getElementById('destination-continue');
  destinationContinue.disabled = true;
  const destinationInput = document.querySelector('#destination-modal .ai-modal-search-input');
  destinationInput.addEventListener('input', function() {
    destinationContinue.disabled = !this.value.trim();
  });
  destinationContinue.onclick = function() {
    if (destinationInput.value.trim()) {
      state.destino = destinationInput.value.trim();
      showModal(1);
    }
  };
  document.getElementById('destination-inspire').onclick = function() {
    state.destino = 'AI Sugerido';
    showModal(3); // 3 = interests-modal
    const interestsTitle = document.querySelector('#interests-modal h2');
    if (interestsTitle) interestsTitle.textContent = 'Qual a sua vibe para essa viagem?';
  };

  // Datas
  const datesBack = document.getElementById('dates-back');
  datesBack.onclick = goBackModal;
  const datesContinue = document.getElementById('dates-continue');
  datesContinue.disabled = true;

  // Sempre que o modal de datas for exibido, garanta o listener:
  function setupFlatpickrListener() {
    if (aiFp) {
      aiFp.config.onChange = function(selectedDates) {
        datesContinue.disabled = selectedDates.length !== 2;
      };
      // Se já houver datas selecionadas, atualize o botão
      if (aiFp.selectedDates && aiFp.selectedDates.length === 2) {
        datesContinue.disabled = false;
      }
    }
  }

  // FLUXO PADRÃO: Datas → Companhia
  datesContinue.onclick = function() {
    if (state.dataIda && state.dataVolta) {
      // Antes de avançar, garanta que o botão de interesses está no fluxo padrão
      interestsContinue.onclick = function() {
        if (state.interesses.length > 0) {
          showModal(4); // 4 = budget-modal
        }
      };
      showModal(2); // 2 = companions-modal
    }
  };

  // Companhia
  const companionsBack = document.getElementById('companions-back');
  companionsBack.onclick = goBackModal;
  const companionsContinue = document.getElementById('companions-continue');
  companionsContinue.disabled = true;
  let companhiaSelecionada = false;
  let petSelecionado = false;

  function updateCompanionsContinue() {
    companionsContinue.disabled = !(companhiaSelecionada && petSelecionado);
  }

  Array.from(document.querySelectorAll('#companions-cards .ai-modal-card')).forEach(card => {
    card.onclick = function() {
      Array.from(document.querySelectorAll('#companions-cards .ai-modal-card')).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.companhia = card.getAttribute('data-value');
      companhiaSelecionada = true;
      updateCompanionsContinue();
    };
  });

  const petBtns = document.querySelectorAll('.companions-pet-btn');
  petBtns.forEach(btn => {
    btn.onclick = function() {
      petBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.pet = btn.getAttribute('data-value');
      petSelecionado = true;
      updateCompanionsContinue();
    };
  });

  // FLUXO PADRÃO: Companhia → Interesses
  companionsContinue.onclick = function() {
    if (companhiaSelecionada && petSelecionado) {
      showModal(3); // 3 = interests-modal
    }
  };

  // Interesses
  const interestsBack = document.getElementById('interests-back');
  interestsBack.onclick = function() {
    if (modalHistory.length > 0) {
      const prev = modalHistory[modalHistory.length - 1];
      goBackModal();
      if (modalOrder[prev] === 'destination-modal') {
        const interestsTitle = document.querySelector('#interests-modal h2');
        if (interestsTitle) interestsTitle.textContent = 'Quais são seus interesses?';
      }
    }
  };
  const interestsContinue = document.getElementById('interests-continue');
  interestsContinue.disabled = true;
  Array.from(document.querySelectorAll('#interests-cards .ai-modal-card')).forEach(card => {
    card.onclick = function() {
      card.classList.toggle('selected');
      const value = card.getAttribute('data-value');
      if (card.classList.contains('selected')) {
        if (!state.interesses.includes(value)) state.interesses.push(value);
      } else {
        state.interesses = state.interesses.filter(i => i !== value);
      }
      interestsContinue.disabled = state.interesses.length === 0;
    };
  });

  // FLUXO PADRÃO: Interesses → Orçamento
  interestsContinue.onclick = function() {
    if (state.interesses.length > 0) {
      showModal(4); // 4 = budget-modal
    }
  };

  // FLUXO 'ME INSPIRE':
  document.getElementById('destination-inspire').onclick = function() {
    state.destino = 'AI Sugerido';
    showModal(3); // 3 = interests-modal
    const interestsTitle = document.querySelector('#interests-modal h2');
    if (interestsTitle) interestsTitle.textContent = 'Qual a sua vibe para essa viagem?';
    // Ajusta o botão continuar para ir para meses/dias
    interestsContinue.onclick = function() {
      if (state.interesses.length > 0) {
        showModal(6); // 6 = months-modal
      }
    };
  };

  // FLUXO 'ME INSPIRE': Meses/Dias → Localização
  document.getElementById('months-continue').onclick = function() {
    showModal(7); // 7 = location-modal
  };
  // FLUXO 'ME INSPIRE': Localização → Companhia
  const locationContinue = document.getElementById('location-continue');
  locationContinue.disabled = true;
  Array.from(document.querySelectorAll('#location-cards .ai-modal-card')).forEach(card => {
    card.onclick = function() {
      Array.from(document.querySelectorAll('#location-cards .ai-modal-card')).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.localizacao = card.getAttribute('data-value');
      locationContinue.disabled = false;
    };
  });
  locationContinue.onclick = function() {
    if (state.localizacao) {
      showModal(2); // 2 = companions-modal
    }
  };

  // Orçamento: seleção de tipo
  const budgetTypeDaily = document.getElementById('budget-type-daily');
  const budgetTypeTotal = document.getElementById('budget-type-total');
  const budgetTypeNoLimit = document.getElementById('budget-type-no-limit');
  const budgetInputRow = document.getElementById('budget-input-row');
  const budgetContinue = document.getElementById('budget-continue');
  budgetContinue.disabled = true;

  function selectBudgetType(tipo) {
    state.orcamentoTipo = tipo;
    if (tipo === 'diario' || tipo === 'total') {
      budgetInputRow.style.display = 'flex';
      // Só habilita se o input tiver valor
      budgetContinue.disabled = !document.querySelector('#budget-modal .ai-modal-budget-input').value;
    } else {
      budgetInputRow.style.display = 'none';
      budgetContinue.disabled = false; // Habilita para "Prefiro não me limitar"
    }
    budgetTypeDaily.classList.toggle('selected', tipo === 'diario');
    budgetTypeTotal.classList.toggle('selected', tipo === 'total');
    budgetTypeNoLimit.classList.toggle('selected', tipo === 'no-limit');
  }

  budgetTypeDaily.onclick = function() { selectBudgetType('diario'); };
  budgetTypeTotal.onclick = function() { selectBudgetType('total'); };
  budgetTypeNoLimit.onclick = function() { selectBudgetType('no-limit'); };

  // Habilita/desabilita o botão ao digitar no input de valor
  const budgetInput = document.querySelector('#budget-modal .ai-modal-budget-input');
  budgetInput.addEventListener('input', function() {
    if (state.orcamentoTipo === 'diario' || state.orcamentoTipo === 'total') {
      budgetContinue.disabled = !this.value;
    }
  });

  // Orçamento
  const budgetBack = document.getElementById('budget-back');
  budgetBack.onclick = function() {
    goBackModal();
  };

  // Resumo
  const summaryBack = document.getElementById('summary-back');
  summaryBack.onclick = goBackModal;
  document.getElementById('summary-generate').onclick = function() {
    // Mostra o modal de loading final
    showModal(8); // 8 = loading-modal
    // Preenche o nome da cidade
    document.getElementById('loading-cidade').textContent = state.destino || '[Cidade]';
  };

  function fillSummary() {
    document.getElementById('summary-destino').textContent = state.destino;
    document.getElementById('summary-datas').textContent = `${state.dataIda} a ${state.dataVolta}`;
    document.getElementById('summary-dias').textContent = `${state.dias} dias`;
    document.getElementById('summary-meses').textContent = state.meses.length > 0 ? state.meses.join(', ') : 'Nenhum mês selecionado';
    document.getElementById('summary-localizacao').textContent = state.localizacao;
    let orcamentoLabel = '';
    let valor = '';
    if (state.orcamentoTipo === 'no-limit') {
      orcamentoLabel = 'Sem limite';
    } else if (state.orcamentoTipo === 'total') {
      orcamentoLabel = state.orcamentoFormatado || '';
    } else if (state.orcamentoTipo === 'diario') {
      orcamentoLabel = state.orcamentoFormatado || '';
    }
    document.getElementById('summary-orcamento').textContent = orcamentoLabel;
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

  // Interesses -> Meses/Dias
  document.getElementById('interests-continue').onclick = function() {
    if (state.interesses.length > 0) {
      showModal(6); // 6 = months-modal
    }
  };

  // Meses/Dias
  const monthsBack = document.getElementById('months-back');
  monthsBack.onclick = function() { showModal(3); };
  document.getElementById('months-continue').onclick = function() {
    showModal(7); // 7 = location-modal
  };
  // Checkbox para mostrar/esconder meses e descrição
  const monthsCheckbox = document.getElementById('months-checkbox');
  const monthsCards = document.getElementById('months-cards');
  const monthsDesc = document.getElementById('months-desc');
  if (monthsCheckbox && monthsCards && monthsDesc) {
    monthsCheckbox.checked = false;
    monthsCards.style.display = 'none';
    monthsDesc.style.display = 'none';
    monthsCheckbox.addEventListener('change', function() {
      const show = monthsCheckbox.checked;
      monthsCards.style.display = show ? 'grid' : 'none';
      monthsDesc.style.display = show ? 'block' : 'none';
    });
  }
  // Slider + input sincronizados + alerta se > 30 dias
  const daysSlider = document.getElementById('days-slider');
  const daysInput = document.getElementById('days-input');
  const daysSliderValue = document.getElementById('days-slider-value');
  const daysAlert = document.getElementById('days-alert');
  state.dias = 7;
  if (daysSlider && daysInput && daysAlert) {
    function checkLongTrip(val) {
      if (val > 30) {
        daysAlert.style.display = 'block';
        daysAlert.textContent = 'Nosso roteiro funciona melhor até 30 dias. Para viagens longas, crie por partes!';
      } else {
        daysAlert.style.display = 'none';
        daysAlert.textContent = '';
      }
    }
    daysSlider.addEventListener('input', function() {
      daysInput.value = daysSlider.value;
      state.dias = Number(daysSlider.value);
      checkLongTrip(state.dias);
    });
    daysInput.addEventListener('input', function() {
      let val = Math.max(1, Math.min(60, Number(daysInput.value) || 1));
      daysSlider.value = val;
      state.dias = val;
      checkLongTrip(val);
    });
    // Chama ao abrir para garantir estado inicial
    checkLongTrip(Number(daysSlider.value));
  }
  // Seleção múltipla dos meses
  state.meses = [];
  Array.from(document.querySelectorAll('#months-cards .ai-modal-card')).forEach(card => {
    card.onclick = function() {
      card.classList.toggle('selected');
      const value = card.getAttribute('data-value');
      if (card.classList.contains('selected')) {
        if (!state.meses.includes(value)) state.meses.push(value);
      } else {
        state.meses = state.meses.filter(m => m !== value);
      }
    };
  });

  budgetContinue.onclick = function() {
    // Atualiza o state.orcamento e state.orcamentoFormatado se necessário
    if (state.orcamentoTipo === 'diario' || state.orcamentoTipo === 'total') {
      const input = document.querySelector('#budget-modal .ai-modal-budget-input');
      state.orcamento = input.value;
    } else if (state.orcamentoTipo === 'no-limit') {
      state.orcamento = '';
      state.orcamentoFormatado = '';
    }
    showModal(5); // 5 = summary-modal
    fillSummary();
  };
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