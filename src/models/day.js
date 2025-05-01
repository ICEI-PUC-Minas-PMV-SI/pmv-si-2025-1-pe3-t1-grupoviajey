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
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    weatherForecast: {
      type: DataTypes.JSON, // { temp: number, condition: string, icon: string }
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    coordinates: {
      type: DataTypes.JSON, // { lat: number, lng: number }
      allowNull: true
    },
    totalDistance: {
      type: DataTypes.FLOAT, // Distance in km
      allowNull: true
    },
    totalBudget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: 'USD'
    },
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