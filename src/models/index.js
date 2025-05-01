// Models index file - imports and associates all models

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with PostgreSQL
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://viajey:viajey@viajey_viajey:5432/viajey?sslmode=disable',
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
    },
    logging: false
  }
);

// Import models
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Itinerary = require('./itinerary')(sequelize, Sequelize.DataTypes);
const Day = require('./day')(sequelize, Sequelize.DataTypes);
const Activity = require('./activity')(sequelize, Sequelize.DataTypes);
const Checklist = require('./checklist')(sequelize, Sequelize.DataTypes);
const ChecklistItem = require('./checklistItem')(sequelize, Sequelize.DataTypes);
const Expense = require('./expense')(sequelize, Sequelize.DataTypes);
const Budget = require('./budget')(sequelize, Sequelize.DataTypes);
const Share = require('./share')(sequelize, Sequelize.DataTypes);
const PointOfInterest = require('./pointOfInterest')(sequelize, Sequelize.DataTypes);

// Define model associations

// User associations
User.hasMany(Itinerary, { foreignKey: 'userId', as: 'itineraries' });
Itinerary.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Itinerary associations
Itinerary.hasMany(Day, { foreignKey: 'itineraryId', as: 'days' });
Day.belongsTo(Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

Itinerary.hasOne(Checklist, { foreignKey: 'itineraryId', as: 'checklist' });
Checklist.belongsTo(Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

Itinerary.hasMany(Expense, { foreignKey: 'itineraryId', as: 'expenses' });
Expense.belongsTo(Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

Itinerary.hasOne(Budget, { foreignKey: 'itineraryId', as: 'budget' });
Budget.belongsTo(Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

Itinerary.hasMany(Share, { foreignKey: 'itineraryId', as: 'shares' });
Share.belongsTo(Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

Itinerary.hasMany(PointOfInterest, { foreignKey: 'itineraryId', as: 'pointsOfInterest' });
PointOfInterest.belongsTo(Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

// Day associations
Day.hasMany(Activity, { foreignKey: 'dayId', as: 'activities' });
Activity.belongsTo(Day, { foreignKey: 'dayId', as: 'day' });

// Checklist associations
Checklist.hasMany(ChecklistItem, { foreignKey: 'checklistId', as: 'items' });
ChecklistItem.belongsTo(Checklist, { foreignKey: 'checklistId', as: 'checklist' });

// Share associations
User.hasMany(Share, { foreignKey: 'userId', as: 'sharedWithMe' });
Share.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export models and Sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  Itinerary,
  Day,
  Activity,
  Checklist,
  ChecklistItem,
  Expense,
  Budget,
  Share,
  PointOfInterest
};