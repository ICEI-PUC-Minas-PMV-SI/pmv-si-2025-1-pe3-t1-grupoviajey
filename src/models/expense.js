// Expense model
module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define('Expense', {
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
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
    },
    category: {
      type: DataTypes.ENUM(
        'accommodation', 
        'food', 
        'transport', 
        'activities', 
        'shopping', 
        'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    paidBy: {
      type: DataTypes.INTEGER, // User ID of the person who paid
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    splitMethod: {
      type: DataTypes.ENUM('equal', 'percentage', 'fixed', 'none'),
      defaultValue: 'equal'
    },
    splitDetails: {
      type: DataTypes.JSON, // { userId: amount/percentage }
      allowNull: true
    },
    isSettled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    receipt: {
      type: DataTypes.STRING, // URL to receipt image
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    locationName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activities',
        key: 'id'
      }
    }
  }, {
    tableName: 'expenses',
    timestamps: true
  });
  
  return Expense;
};