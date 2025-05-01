// Day model
module.exports = (sequelize, DataTypes) => {
  const Day = sequelize.define('Day', {
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
    dayNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    weatherForecast: {
      type: DataTypes.JSON,
      allowNull: true
    },
    dayColor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#4dabf5' // Default color for days
    }
  }, {
    tableName: 'days',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['itineraryId', 'dayNumber']
      }
    ]
  });
  
  return Day;
};