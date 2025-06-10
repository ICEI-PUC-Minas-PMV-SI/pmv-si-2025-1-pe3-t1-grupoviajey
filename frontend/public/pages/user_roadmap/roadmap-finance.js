// Importações
import { budgetStorage } from './roadmap-storage.js';
import { formatCurrencyInput, formatCurrency } from './roadmap-utils.js';

// =============================================
// GESTÃO DE ORÇAMENTO
// =============================================

let currentBudget = null;

function loadBudgetFromStorage() {
  try {
    const budget = budgetStorage.load();
    if (budget) {
      const budgetInput = document.getElementById('budgetInput');
      const budgetCurrency = document.getElementById('budgetCurrency');
      if (budgetInput) {
        budgetInput.value = formatCurrency(budget.total, budget.currency);
      }
      if (budgetCurrency) {
        budgetCurrency.value = budget.currency || 'BRL';
      }
      currentBudget = budget;
    }
  } catch (error) {
    console.error('Error loading budget:', error);
  }
}

function getBudgetInfo() {
  if (!currentBudget) return null;
  const value = currentBudget.total;
  const currency = currentBudget.currency;

  let locale;
  switch (currency) {
    case 'USD':
      locale = 'en-US';
      break;
    case 'EUR':
      locale = 'de-DE';
      break;
    default:
      locale = 'pt-BR';
  }

  return {
    value: value,
    text: value.toLocaleString(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    })
  };
}

function saveBudget(value, currency) {
  try {
    const numericValue = parseCurrencyToNumber(value);
    if (numericValue <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    const budget = {
      total: numericValue,
      currency: currency || 'BRL'
    };

    const success = budgetStorage.save(budget);
    if (!success) {
      throw new Error('Failed to save budget');
    }

    currentBudget = budget;
    updateFinanceSummary();
    return true;
  } catch (error) {
    console.error('Error saving budget:', error);
    return false;
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

  const budget = getBudgetInfo();
  if (budget && budget.value > 0) {
    budgetDiv.style.display = '';
    budgetValue.textContent = budget.text;
    availableDiv.style.display = '';
    const available = budget.value - totalSpent;
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

function init() {
  loadBudgetFromStorage();
  setupBudgetInput();
  setTimeout(updateFinanceSummary, 200);
}

// =============================================
// EXPORTAÇÕES
// =============================================

export {
  init,
  updateFinanceSummary,
  getBudgetInfo,
  saveBudget,
  currentBudget,
  parseCurrencyToNumber
};
