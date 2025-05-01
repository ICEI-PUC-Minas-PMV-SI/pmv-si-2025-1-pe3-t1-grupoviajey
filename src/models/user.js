// User model
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'beginner',
      validate: {
        isIn: [['beginner', 'experienced', 'pro', 'expert', 'master']]
      }
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        travelGoal: '',
        travelDays: 0,
        travelStyle: '',
        planningStyle: '',
        theme: 'dark'
      }
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true // Enable soft deletes
  });

  return User;
};