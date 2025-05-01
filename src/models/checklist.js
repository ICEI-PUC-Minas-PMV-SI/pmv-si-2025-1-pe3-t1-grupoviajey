// Checklist model
module.exports = (sequelize, DataTypes) => {
  const Checklist = sequelize.define('Checklist', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Travel Checklist'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'checklists',
    timestamps: true
  });
  
  return Checklist;
};