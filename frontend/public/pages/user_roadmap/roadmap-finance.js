// Importações
import { formatCurrencyInput, formatCurrency } from './roadmap-utils.js';
import { apiService } from '../../services/api/apiService.js';
import { showLoading, hideLoading, showErrorToast, showSuccessToast } from '../../js/utils/ui-utils.js';

// =============================================
// GESTÃO DE ORÇAMENTO
// =============================================

let currentTripId = null;
let currentBudget = null;

async function loadBudget() {
  if (!currentTripId) return;
  try {
    const budget = await apiService.getRoadmapBudget(currentTripId);
    if (budget && budget.success && budget.data) {
      currentBudget = budget.data;
      updateBudgetUI(currentBudget);
    }
  } catch (error) {
    console.error('Error loading budget:', error);
    // Não mostra toast aqui para não poluir a UI no carregamento inicial
  }
}

function updateBudgetUI(budget) {
    const budgetInput = document.getElementById('budgetInput');
    const budgetCurrency = document.getElementById('budgetCurrency');
    if (budgetInput) {
        budgetInput.value = formatCurrency(budget.total, budget.currency);
    }
    if (budgetCurrency) {
        budgetCurrency.value = budget.currency || 'BRL';
    }
    updateFinanceSummary();
}


async function saveBudget(value, currency) {
  if (!currentTripId) {
    showErrorToast("ID da viagem não encontrado.");
    return false;
  }
  
  showLoading('Salvando orçamento...');
  try {
    const numericValue = parseCurrencyToNumber(value);
    if (numericValue <= 0) throw new Error('Valor do orçamento deve ser maior que zero.');

    const budgetData = {
      total: numericValue,
      currency: currency || 'BRL'
    };

    const response = await apiService.updateTripBudget(currentTripId, budgetData);

    if (!response || !response.success) {
      throw new Error(response.message || 'Falha ao salvar o orçamento.');
    }
    
    showSuccessToast('Orçamento salvo!');
    currentBudget = response.data;
    updateFinanceSummary();
    return true;

  } catch (error) {
    console.error('Error saving budget:', error);
    showErrorToast(error.message || 'Não foi possível salvar o orçamento.');
    return false;
  } finally {
      hideLoading();
  }
}

// =============================================
// GESTÃO DE GASTOS
// =============================================

function parseCurrencyToNumber(str) {
  if (!str) return 0;
  str = String(str).replace(/(BRL|USD|EUR)/g, '').trim();
  str = str.replace(/[^\d,\.]/g, '');
  if (str.indexOf(',') > -1 && str.indexOf('.') === -1) {
    str = str.replace(',', '.');
  } else if (str.indexOf('.') > -1 && str.indexOf(',') > -1) {
    str = str.replace(/\./g, '').replace(',', '.');
  }
  return parseFloat(str) || 0;
}

function getAllExpenses() {
  const expenses = Array.from(document.querySelectorAll('.timeline-expense .expense-text'));
  return expenses.map(e => parseCurrencyToNumber(e.textContent));
}

function updateFinanceSummary() {
  const financeRow = document.getElementById('financeSummaryRow');
  const spentValue = document.getElementById('summarySpentValue');
  const budgetDiv = document.getElementById('summaryBudget');
  const budgetValue = document.getElementById('summaryBudgetValue');
  const availableDiv = document.getElementById('summaryAvailableRow');
  const availableValue = document.getElementById('summaryAvailableValue');

  if (!financeRow || !spentValue) {
    console.log('Finance summary elements not found');
    return;
  }

  const expenses = getAllExpenses();
  const totalSpent = expenses.reduce((a, b) => a + b, 0);
  spentValue.textContent = formatCurrency(totalSpent, currentBudget?.currency || 'BRL');

  if (currentBudget && currentBudget.total > 0) {
    budgetDiv.style.display = '';
    budgetValue.textContent = formatCurrency(currentBudget.total, currentBudget.currency);
    availableDiv.style.display = '';
    const available = currentBudget.total - totalSpent;
    availableValue.textContent = formatCurrency(available, currentBudget.currency);
    availableValue.style.color = available >= 0 ? '#0a7c6a' : '#e05a47';
  } else {
    budgetDiv.style.display = 'none';
    availableDiv.style.display = 'none';
  }
  financeRow.style.display = '';
}

// =============================================
// ATUALIZAÇÃO DE UI
// =============================================

function setupBudgetInput() {
  const budgetInput = document.getElementById('budgetInput');
  const budgetCurrency = document.getElementById('budgetCurrency');
  const saveButton = document.getElementById('saveBudgetBtn');
  const budgetBtn = document.getElementById('budgetBtn');
  const budgetDropdown = document.getElementById('budgetDropdown');

  if (!budgetInput || !budgetCurrency || !saveButton || !budgetBtn || !budgetDropdown) {
    console.error('Missing required budget elements');
    return;
  }

  let isDropdownOpen = false;

  budgetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
    budgetDropdown.classList.toggle('show', isDropdownOpen);
    if (isDropdownOpen) {
      budgetInput.focus();
      budgetInput.value = '';
    }
  });

  const closeDropdown = () => {
    isDropdownOpen = false;
    budgetDropdown.classList.remove('show');
  };

  document.addEventListener('click', (e) => {
    const isClickInside = budgetBtn.contains(e.target) || budgetDropdown.contains(e.target);
    if (!isClickInside && isDropdownOpen) {
      closeDropdown();
    }
  });

  budgetInput.addEventListener('input', (e) => {
    const value = String(e.target.value).replace(/[^\d,\.]/g, '');
    const currency = budgetCurrency.value;
    const cursorPosition = e.target.selectionStart;
    const oldLength = e.target.value.length;
    const formattedValue = formatCurrencyInput(value, currency);
    e.target.value = formattedValue;
    const newLength = formattedValue.length;
    const newPosition = cursorPosition + (newLength - oldLength);
    e.target.setSelectionRange(newPosition, newPosition);
  });

  budgetInput.addEventListener('keypress', (e) => {
    const char = String.fromCharCode(e.which);
    if (!/[\d,\.]/.test(char)) {
      e.preventDefault();
    }
  });

  budgetCurrency.addEventListener('change', () => {
    const value = String(budgetInput.value).replace(/[^\d,\.]/g, '');
    budgetInput.value = formatCurrencyInput(value, budgetCurrency.value);
  });

  saveButton.addEventListener('click', () => {
    const value = String(budgetInput.value);
    const currency = budgetCurrency.value;

    if (!value || value.trim() === '') {
      saveButton.textContent = 'Digite um valor!';
      saveButton.classList.add('error');
      setTimeout(() => {
        saveButton.textContent = 'Salvar';
        saveButton.classList.remove('error');
      }, 2000);
      return;
    }

    if (saveBudget(value, currency)) {
      saveButton.textContent = 'Salvo!';
      saveButton.classList.add('success');
      updateFinanceSummary();
      setTimeout(() => {
        closeDropdown();
        saveButton.textContent = 'Salvar';
        saveButton.classList.remove('success');
      }, 2000);
    } else {
      saveButton.textContent = 'Erro!';
      saveButton.classList.add('error');
      setTimeout(() => {
        saveButton.textContent = 'Salvar';
        saveButton.classList.remove('error');
      }, 2000);
    }
  });
}

// =============================================
// INICIALIZAÇÃO
// =============================================

export async function init(tripId) {
  currentTripId = tripId;
  if (!currentTripId) {
    console.error("Finance module initialized without tripId.");
    return;
  }
  
  setupBudgetInput();
  await loadBudget();
  updateFinanceSummary();
}

// =============================================
// EXPORTAÇÕES
// =============================================

export {
  updateFinanceSummary,
  saveBudget,
  currentBudget,
  parseCurrencyToNumber
};
