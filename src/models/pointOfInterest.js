// PointOfInterest model - for map points
module.exports = (sequelize, DataTypes) => {
  const PointOfInterest = sequelize.define('PointOfInterest', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('attraction', 'restaurant', 'accommodation', 'transport', 'experience', 'other'),
      allowNull: false,
      defaultValue: 'attraction'
    },
    coordinates: {
      type: DataTypes.JSON, // { lat: number, lng: number }
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    openingHours: {
      type: DataTypes.JSON, // { day: { open: string, close: string } }
      allowNull: true
    },
    priceLevel: {
      type: DataTypes.INTEGER, // 1-4 for price level
      allowNull: true
    },
    rating: {
      type: DataTypes.FLOAT, // e.g., 4.5 out of 5
      allowNull: true
    },
    reviews: {
      type: DataTypes.JSON, // Array of review objects
      allowNull: true
    },
    photos: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of photo URLs
      defaultValue: []
    },
    isSaved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isVisited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activities',
        key: 'id'
      }
    },
    dayId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'days',
        key: 'id'
      }
    },
    categoryColor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'points_of_interest',
    timestamps: true
  });
  
  return PointOfInterest;
};