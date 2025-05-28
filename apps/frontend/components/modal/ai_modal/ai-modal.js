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

  // Definir destinationInput no escopo da função
  let destinationInput = null;

  // Inicializa o autocomplete do Google Places
  function initAutocomplete() {
    console.log('Inicializando autocomplete...');
    if (!destinationInput) {
      destinationInput = document.querySelector('#destination-modal .ai-modal-search-input');
    }
    if (!destinationInput) {
      console.error('Input de destino não encontrado');
      return;
    }
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error('Google Maps API não está disponível');
      return;
    }
    try {
      const autocomplete = new google.maps.places.Autocomplete(destinationInput, {
        types: ['(cities)']
      });
      autocomplete.addListener('place_changed', function() {
        console.log('Evento place_changed disparado');
        const place = autocomplete.getPlace();
        console.log('Place selected:', place);
        if (place.address_components) {
          const city = place.address_components.find(comp => comp.types.includes('locality'));
          if (city) {
            destinationInput.value = city.long_name;
          } else {
            destinationInput.value = place.name;
          }
          // Habilita o botão continuar apenas quando um local for selecionado
          destinationContinue.disabled = false;
        }
      });
      console.log('Autocomplete inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar autocomplete:', error);
    }
  }

  // Tenta inicializar o autocomplete quando o modal for aberto
  function tryInitAutocomplete() {
    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
    } else {
      console.log('Google Maps API não está disponível, tentando novamente em 100ms...');
      setTimeout(tryInitAutocomplete, 100);
    }
  }

  function showModal(idx, pushHistory = true) {
    // Esconde todos os modais
    modalOrder.forEach((id, i) => {
      document.getElementById(id).style.display = 'none';
    });
    
    // Mostra o modal atual
    document.getElementById(modalOrder[idx]).style.display = 'block';
    
    // Se for o modal de destino, atualiza o input e inicializa autocomplete
    if (modalOrder[idx] === 'destination-modal') {
      destinationInput = document.querySelector('#destination-modal .ai-modal-search-input');
      tryInitAutocomplete();
      setTimeout(() => {
        destinationInput && destinationInput.focus();
      }, 200);
    }
    
    // Atualiza o histórico se necessário
    if (pushHistory && typeof currentModal === 'number' && idx !== currentModal) {
      modalHistory.push(currentModal);
    }
    currentModal = idx;
    
    // Atualiza o resumo se estiver indo para o modal de resumo
    if (modalOrder[idx] === 'summary-modal') {
      fillSummary();
    }
    
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

    // Resetar radios e blocos ao abrir o modal de meses/dias
    if (modalOrder[idx] === 'months-modal') {
      setupMonthsRadios();
      state.mesesDatas = '';
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

  // Destino
  destinationContinue.onclick = function() {
    if (destinationInput && destinationInput.value.trim()) {
      state.destino = destinationInput.value.trim();
      showModal(1);
    }
  };
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
    // Ajusta o fluxo dos próximos modais
    document.getElementById('months-continue').onclick = function() {
      showModal(7); // 7 = location-modal
    };
    locationContinue.onclick = function() {
      if (state.localizacao) {
        showModal(2); // 2 = companions-modal
      }
    };
    companionsContinue.onclick = function() {
      if (companhiaSelecionada && petSelecionado) {
        showModal(4); // 4 = budget-modal
      }
    };
    budgetContinue.onclick = function() {
      if (
        state.orcamentoTipo === 'diario' ||
        state.orcamentoTipo === 'total' ||
        state.orcamentoTipo === 'no-limit'
      ) {
        showModal(5); // 5 = summary-modal
        fillSummary();
      }
    };
    document.getElementById('summary-generate').onclick = function() {
      showModal(8); // 8 = loading-modal
      document.getElementById('loading-cidade').textContent = state.destino || '[Cidade]';
    };
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
      interestsContinue.onclick = function() {
        if (state.interesses.length > 0) {
          showModal(4); // 4 = budget-modal
        }
      };
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

  // FLUXO 'ME INSPIRE': Meses/Dias
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
  budgetBack.onclick = goBackModal;

  // Resumo
  const summaryBack = document.getElementById('summary-back');
  summaryBack.onclick = function() {
    showModal(4); // 4 = budget-modal
  };

  function fillSummary() {
    document.getElementById('summary-destino').textContent = state.destino;
    document.getElementById('summary-datas').textContent = `${state.dataIda} a ${state.dataVolta}`;
    document.getElementById('summary-dias').textContent = `${state.dias} dias`;
    document.getElementById('summary-meses').textContent = state.meses.length > 0 ? state.meses.join(', ') : 'Nenhum mês selecionado';
    document.getElementById('summary-localizacao').textContent = state.localizacao;
    let orcamentoLabel = '';
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
  };

  // Fechar modal com ESC e clicando fora
  const overlay = document.getElementById('ai-modal-overlay');
  overlay.addEventListener('mousedown', function(e) {
    // Só fecha se o modal visível não for o loading-modal
    const isLoadingModal = document.getElementById('loading-modal').style.display === 'block';
    if (e.target === overlay && !isLoadingModal) {
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
    // Só fecha se o modal visível não for o loading-modal
    const isLoadingModal = document.getElementById('loading-modal').style.display === 'block';
    if (e.key === 'Escape' && overlay.style.display === 'flex' && !isLoadingModal) {
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

  // FLUXO 'ME INSPIRE': Meses/Dias → Localização
  document.getElementById('months-continue').onclick = function() {
    showModal(7); // 7 = location-modal
  };
  // FLUXO 'ME INSPIRE': Localização → Companhia
  const locationBack = document.getElementById('location-back');
  locationBack.onclick = function() { showModal(6); }; // 6 = months-modal
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

  budgetContinue.onclick = function() {
    // Atualiza o state.orcamento e state.orcamentoFormatado se necessário
    if (state.orcamentoTipo === 'diario' || state.orcamentoTipo === 'total') {
      const input = document.querySelector('#budget-modal .ai-modal-budget-input');
      state.orcamento = input.value;
    } else if (state.orcamentoTipo === 'no-limit') {
      state.orcamento = '';
      state.orcamentoFormatado = '';
    }
    // Mostra o modal de resumo e atualiza o conteúdo
    showModal(5); // 5 = summary-modal
    fillSummary();
  };

  // Configuração do botão gerar roteiro
  const summaryGenerate = document.getElementById('summary-generate');
  if (summaryGenerate) {
    summaryGenerate.onclick = function() {
      // Esconde todos os modais
      modalOrder.forEach(id => {
        document.getElementById(id).style.display = 'none';
      });
      
      // Mostra o modal de loading
      const loadingModal = document.getElementById('loading-modal');
      if (loadingModal) {
        loadingModal.style.display = 'block';
        // Atualiza o nome da cidade no loading
        const loadingCidade = document.getElementById('loading-cidade');
        if (loadingCidade) {
          loadingCidade.textContent = state.destino || '[Cidade]';
        }
      }
    };
  }

  // Tooltip para todos os botões continuar desabilitados
  const tooltip = document.createElement('div');
  tooltip.className = 'ai-modal-tooltip';
  document.body.appendChild(tooltip);
  tooltip.style.display = 'none';

  // Mensagens específicas para cada modal
  const continueTooltips = {
    'destination-modal': 'Selecione um destino da lista para continuar',
    'travel-dates-modal': 'Selecione o período da viagem para continuar',
    'companions-modal': 'Selecione a companhia e se vai levar pet para continuar',
    'interests-modal': 'Selecione pelo menos um interesse para continuar',
    'budget-modal': 'Preencha o orçamento ou escolha uma opção para continuar',
    'months-modal': 'Selecione a quantidade de dias para continuar',
    'location-modal': 'Selecione uma opção para continuar',
    'summary-modal': 'Revise suas preferências antes de continuar',
    'loading-modal': ''
  };

  // Adiciona tooltip para todos os botões continuar
  document.querySelectorAll('.ai-modal-btn-continue').forEach(btn => {
    btn.addEventListener('mouseenter', function(e) {
      if (btn.disabled) {
        // Descobre em qual modal o botão está
        let modal = btn.closest('.ai-modal-section');
        let modalId = modal ? modal.id : '';
        let msg = continueTooltips[modalId] || 'Preencha os campos obrigatórios para continuar';
        tooltip.innerText = msg;
        const rect = btn.getBoundingClientRect();
        // Posição inicial
        let left = rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2;
        let top = rect.top + window.scrollY - tooltip.offsetHeight - 8;
        // Limites da tela
        const minLeft = 8;
        const maxLeft = window.innerWidth - tooltip.offsetWidth - 8;
        const minTop = 8;
        if (left < minLeft) left = minLeft;
        if (left > maxLeft) left = maxLeft;
        if (top < minTop) top = minTop;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.style.display = 'block';
      }
    });
    btn.addEventListener('mouseleave', function() {
      tooltip.style.display = 'none';
    });
  });

  // Garante que o botão '+ Adicionar interesse' funcione normalmente
  const addInterestBtn = document.getElementById('show-add-interest');
  const addInterestForm = document.getElementById('add-interest-form');
  if (addInterestBtn && addInterestForm) {
    addInterestBtn.onclick = function() {
      addInterestForm.style.display = 'flex';
      addInterestBtn.style.display = 'none';
      // Foca no input ao abrir
      const input = addInterestForm.querySelector('.interests-add-input');
      if (input) setTimeout(() => input.focus(), 100);
    };
    // Adiciona o card ao clicar em 'Adicionar'
    const addConfirmBtn = addInterestForm.querySelector('.interests-add-confirm');
    const addInput = addInterestForm.querySelector('.interests-add-input');
    const interestsCardsGrid = document.getElementById('interests-cards');
    if (addConfirmBtn && addInput && interestsCardsGrid) {
      addConfirmBtn.onclick = function() {
        const value = addInput.value.trim();
        if (value) {
          // Cria o card
          const card = document.createElement('div');
          card.className = 'ai-modal-card selected';
          card.setAttribute('data-value', value);
          card.textContent = value;
          // Seleciona/desseleciona ao clicar
          card.onclick = function() {
            card.classList.toggle('selected');
            if (card.classList.contains('selected')) {
              if (!state.interesses.includes(value)) state.interesses.push(value);
            } else {
              state.interesses = state.interesses.filter(i => i !== value);
            }
            interestsContinue.disabled = state.interesses.length === 0;
          };
          // Adiciona ao grid
          interestsCardsGrid.appendChild(card);
          // Adiciona ao state e habilita o continuar
          if (!state.interesses.includes(value)) state.interesses.push(value);
          interestsContinue.disabled = state.interesses.length === 0;
          // Limpa input e fecha form
          addInput.value = '';
          addInterestForm.style.display = 'none';
          addInterestBtn.style.display = '';
        }
      };
    }
  }

  // --- Controle robusto dos radios do modal de meses/dias ---
  function setupMonthsRadios() {
    const monthsRadioExact = document.getElementById('months-radio-exact');
    const monthsRadioUnknown = document.getElementById('months-radio-unknown');
    const monthsCalendarRow = document.getElementById('months-calendar-row');
    const monthsFlexibleRow = document.getElementById('months-flexible-row');
    const monthsContinue = document.getElementById('months-continue');
    let monthsFp = null;
    if (!monthsRadioExact || !monthsRadioUnknown || !monthsCalendarRow || !monthsFlexibleRow || !monthsContinue) return;

    function hideAllMonthsBlocks() {
      monthsCalendarRow.classList.remove('active');
      monthsFlexibleRow.classList.remove('active');
    }
    function showMonthsCalendar() {
      hideAllMonthsBlocks();
      monthsCalendarRow.classList.add('active');
      // Inicializa o Flatpickr se ainda não foi
      const monthsCalendarAlert = document.getElementById('months-calendar-alert');
      if (!monthsFp) {
        monthsFp = flatpickr(document.getElementById('months-date-range'), {
          mode: 'range',
          minDate: 'today',
          dateFormat: 'd/m/Y',
          locale: 'pt',
          showMonths: 2,
          inline: true,
          onChange: function(selectedDates) {
            monthsContinue.disabled = !(selectedDates.length === 2);
            if (monthsCalendarAlert) {
              if (selectedDates.length === 2) {
                const diff = Math.ceil((selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24)) + 1;
                if (diff > 30) {
                  monthsCalendarAlert.style.display = 'block';
                  monthsCalendarAlert.textContent = 'Nosso roteiro funciona melhor até 30 dias. Para viagens longas, crie por partes!';
                } else {
                  monthsCalendarAlert.style.display = 'none';
                  monthsCalendarAlert.textContent = '';
                }
              } else {
                monthsCalendarAlert.style.display = 'none';
                monthsCalendarAlert.textContent = '';
              }
            }
          }
        });
      } else {
        // Garante que o botão está correto se já inicializado
        monthsFp.config.onChange = function(selectedDates) {
          monthsContinue.disabled = !(selectedDates.length === 2);
          if (monthsCalendarAlert) {
            if (selectedDates.length === 2) {
              const diff = Math.ceil((selectedDates[1] - selectedDates[0]) / (1000 * 60 * 60 * 24)) + 1;
              if (diff > 30) {
                monthsCalendarAlert.style.display = 'block';
                monthsCalendarAlert.textContent = 'Nosso roteiro funciona melhor até 30 dias. Para viagens longas, crie por partes!';
              } else {
                monthsCalendarAlert.style.display = 'none';
                monthsCalendarAlert.textContent = '';
              }
            } else {
              monthsCalendarAlert.style.display = 'none';
              monthsCalendarAlert.textContent = '';
            }
          }
        };
        // Atualiza o botão se já houver datas
        if (monthsFp.selectedDates && monthsFp.selectedDates.length === 2) {
          monthsContinue.disabled = false;
        } else {
          monthsContinue.disabled = true;
        }
      }
      // Estado inicial
      monthsContinue.disabled = true;
      if (monthsCalendarAlert) {
        monthsCalendarAlert.style.display = 'none';
        monthsCalendarAlert.textContent = '';
      }
    }
    function showMonthsFlexible() {
      hideAllMonthsBlocks();
      monthsFlexibleRow.classList.add('active');
      // Ativa o botão se dias > 0
      const daysSlider = document.getElementById('days-slider');
      monthsContinue.disabled = !(daysSlider && Number(daysSlider.value) > 0);
      if (daysSlider) {
        daysSlider.oninput = function() {
          monthsContinue.disabled = !(Number(daysSlider.value) > 0);
        };
      }
    }
    // Estado inicial: tudo oculto
    hideAllMonthsBlocks();
    monthsRadioExact.checked = false;
    monthsRadioUnknown.checked = false;
    monthsContinue.disabled = true;
    // Listeners
    monthsRadioExact.onchange = function() {
      if (this.checked) {
        state.mesesDatas = 'exatas';
        showMonthsCalendar();
      }
    };
    monthsRadioUnknown.onchange = function() {
      if (this.checked) {
        state.mesesDatas = 'nao-sei';
        showMonthsFlexible();
      }
    };
  }
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