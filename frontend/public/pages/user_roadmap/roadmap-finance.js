// Importações
import { budgetStorage } from './roadmap-storage.js';
import { formatCurrencyInput, formatCurrency, parseCurrencyToNumber } from './roadmap-utils.js';

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
        if (value <= 0) {
            throw new Error('Valor deve ser maior que zero');
        }

        const budget = {
            total: value,
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

    if (!financeRow || !spentValue) return;

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

// =============================================
// INICIALIZAÇÃO
// =============================================

function init() {
    loadBudgetFromStorage();
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
    currentBudget
};