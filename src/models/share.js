// Share model - for sharing itineraries with other users
module.exports = (sequelize, DataTypes) => {
  const Share = sequelize.define('Share', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,  // Can be null for link sharing
      references: {
        model: 'users',
        key: 'id'
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,  // Email of invited user who hasn't signed up yet
      validate: {
        isEmail: true
      }
    },
    shareType: {
      type: DataTypes.ENUM('user', 'email', 'link'),
      allowNull: false,
      defaultValue: 'user'
    },
    permission: {
      type: DataTypes.ENUM('view', 'edit', 'admin'),
      allowNull: false,
      defaultValue: 'view'
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true  // Access token for link sharing
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true  // Optional expiration date for shared access
    },
    invitationStatus: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined'),
      allowNull: false,
      defaultValue: 'pending'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true  // Optional message to recipient
    },
    lastAccessed: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'shares',
    timestamps: true
  });
  
  return Share;
};