// Budget model
module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    itineraryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'itineraries',
        key: 'id'
      }
    },
    totalBudget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    },
    dailyBudget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    categoryBudgets: {
      type: DataTypes.JSON, // { category: amount }
      allowNull: true,
      defaultValue: {
        accommodation: 0,
        food: 0,
        transport: 0,
        activities: 0,
        shopping: 0,
        other: 0
      }
    },
    alertThreshold: {
      type: DataTypes.INTEGER, // Percentage of budget when to alert
      allowNull: true,
      defaultValue: 90
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'budgets',
    timestamps: true
  });
  
  return Budget;
};