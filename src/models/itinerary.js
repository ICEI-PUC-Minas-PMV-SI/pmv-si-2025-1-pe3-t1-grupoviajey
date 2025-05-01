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
      allowNull: false
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
      type: DataTypes.ENUM('private', 'shared', 'public'),
      allowNull: false,
      defaultValue: 'private'
    },
    coverImage: {
      type: DataTypes.STRING, // URL to cover image
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('planning', 'booked', 'ongoing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planning'
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isFavorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    rating: {
      type: DataTypes.INTEGER, // 1-5 star rating for completed trips
      allowNull: true
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tripType: {
      type: DataTypes.ENUM('solo', 'family', 'couple', 'friends', 'business', 'other'),
      allowNull: true
    },
    mainTransportMode: {
      type: DataTypes.ENUM('air', 'train', 'car', 'bus', 'ship', 'other'),
      allowNull: true
    },
    locationCoordinates: {
      type: DataTypes.JSON, // { lat: number, lng: number }
      allowNull: true
    },
    sharedWith: {
      type: DataTypes.VIRTUAL,
      get() {
        return []; // This will be populated from the Share model
      }
    }
  }, {
    tableName: 'itineraries',
    timestamps: true
  });
  
  return Itinerary;
};