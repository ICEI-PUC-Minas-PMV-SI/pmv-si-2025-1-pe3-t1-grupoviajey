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
    return {
        value: currentBudget.total,
        text: formatCurrency(currentBudget.total, currentBudget.currency)
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
    str = str.replace(/(BRL|USD|EUR)/g, '').trim();
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
    spentValue.textContent = formatCurrency(totalSpent, 'BRL');

    const budget = getBudgetInfo();
    if (budget && budget.value > 0) {
        budgetDiv.style.display = '';
        budgetValue.textContent = budget.text;
        availableDiv.style.display = '';
        const available = budget.value - totalSpent;
        availableValue.textContent = formatCurrency(available, currentBudget.currency);
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

    // Toggle do dropdown
    budgetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        budgetDropdown.classList.toggle('show');
    });

    // Fecha o dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!budgetBtn.contains(e.target) && !budgetDropdown.contains(e.target)) {
            budgetDropdown.classList.remove('show');
        }
    });

    // Previne que o clique no dropdown feche ele
    budgetDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Formatação do input
    budgetInput.addEventListener('input', (e) => {
        const value = e.target.value.replace(/[^\d,\.]/g, '');
        const currency = budgetCurrency.value;

        // Mantém a posição do cursor
        const cursorPosition = e.target.selectionStart;
        const oldLength = e.target.value.length;

        // Aplica a formatação
        const formattedValue = formatCurrencyInput(value, currency);
        e.target.value = formattedValue;

        // Ajusta a posição do cursor
        const newLength = formattedValue.length;
        const newPosition = cursorPosition + (newLength - oldLength);
        e.target.setSelectionRange(newPosition, newPosition);
    });

    // Validação de entrada
    budgetInput.addEventListener('keypress', (e) => {
        const char = String.fromCharCode(e.which);
        if (!/[\d,\.]/.test(char)) {
            e.preventDefault();
        }
    });

    // Atualiza formatação ao mudar moeda
    budgetCurrency.addEventListener('change', () => {
        const value = budgetInput.value.replace(/[^\d,\.]/g, '');
        budgetInput.value = formatCurrencyInput(value, budgetCurrency.value);
    });

    // Salvar orçamento
    saveButton.addEventListener('click', () => {
        const value = budgetInput.value;
        const currency = budgetCurrency.value;

        if (saveBudget(value, currency)) {
            // Feedback visual de sucesso
            saveButton.textContent = 'Salvo!';
            saveButton.classList.add('success');

            // Fecha o dropdown após salvar
            setTimeout(() => {
                budgetDropdown.classList.remove('show');
                saveButton.textContent = 'Salvar';
                saveButton.classList.remove('success');
            }, 2000);
        } else {
            // Feedback visual de erro
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