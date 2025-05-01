// Itinerary model
module.exports = (sequelize, DataTypes) => {
  const Itinerary = sequelize.define('Itinerary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    visibility: {
      type: DataTypes.ENUM('private', 'link', 'friends', 'public'),
      defaultValue: 'private',
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('planning', 'ongoing', 'completed', 'canceled'),
      defaultValue: 'planning'
    }
  }, {
    tableName: 'itineraries',
    timestamps: true,
    paranoid: true // Enable soft deletes
  });
  
  return Itinerary;
};