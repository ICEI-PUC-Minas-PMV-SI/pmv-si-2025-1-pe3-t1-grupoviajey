// Activity model
module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dayId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'days',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('place', 'activity', 'transport', 'accommodation', 'meal', 'ticket', 'other'),
      allowNull: false,
      defaultValue: 'place'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    coordinates: {
      type: DataTypes.JSON, // { lat: number, lng: number }
      allowNull: true
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in minutes
      allowNull: true
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: 'USD'
    },
    bookingReference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bookingUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timeBlock: {
      type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'allday'),
      allowNull: false,
      defaultValue: 'morning'
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'activities',
    timestamps: true
  });
  
  return Activity;
};