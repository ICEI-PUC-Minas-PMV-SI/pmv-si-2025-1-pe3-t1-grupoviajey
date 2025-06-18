/**
 * Calcula o saldo disponível baseado no orçamento total e gastos
 * @param {number} totalBudget - Orçamento total
 * @param {Array} roadmapDays - Array de dias do roteiro com locais e gastos
 * @returns {Object} - Objeto com totalBudget, totalExpenses e availableBalance
 */
const calculateBudget = (totalBudget, roadmapDays = []) => {
  let totalExpenses = 0;

  // Calcular gastos dos locais em roadmapDays
  roadmapDays.forEach(day => {
    if (day.places && Array.isArray(day.places)) {
      day.places.forEach(place => {
        if (place.expenses && typeof place.expenses === 'number') {
          totalExpenses += place.expenses;
        }
      });
    }
  });

  const availableBalance = totalBudget - totalExpenses;

  return {
    totalBudget,
    totalExpenses,
    availableBalance: Math.max(0, availableBalance) // Não pode ser negativo
  };
};

/**
 * Calcula gastos por dia
 * @param {Array} roadmapDays - Array de dias do roteiro
 * @returns {Array} - Array com gastos por dia
 */
const calculateDailyExpenses = (roadmapDays = []) => {
  return roadmapDays.map(day => {
    let dayExpenses = 0;
    
    if (day.places && Array.isArray(day.places)) {
      day.places.forEach(place => {
        if (place.expenses && typeof place.expenses === 'number') {
          dayExpenses += place.expenses;
        }
      });
    }

    return {
      date: day.date,
      title: day.title,
      expenses: dayExpenses
    };
  });
};

/**
 * Calcula estatísticas de gastos
 * @param {number} totalBudget - Orçamento total
 * @param {Array} roadmapDays - Array de dias do roteiro
 * @returns {Object} - Estatísticas de gastos
 */
const calculateExpenseStats = (totalBudget, roadmapDays = []) => {
  const budget = calculateBudget(totalBudget, roadmapDays);
  const dailyExpenses = calculateDailyExpenses(roadmapDays);
  
  const totalDays = roadmapDays.length;
  const averageDailyExpense = totalDays > 0 ? budget.totalExpenses / totalDays : 0;
  
  const maxDailyExpense = dailyExpenses.length > 0 
    ? Math.max(...dailyExpenses.map(day => day.expenses))
    : 0;

  return {
    ...budget,
    totalDays,
    averageDailyExpense,
    maxDailyExpense,
    dailyExpenses
  };
};

module.exports = {
  calculateBudget,
  calculateDailyExpenses,
  calculateExpenseStats
}; 