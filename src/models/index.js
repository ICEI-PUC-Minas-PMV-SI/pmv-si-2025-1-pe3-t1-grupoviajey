// Database models index
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

// Connect to database
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: env === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: env === 'development' ? console.log : false
});

// Load models
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Define model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Associations
// User <-> Itinerary
db.User.hasMany(db.Itinerary, { foreignKey: 'userId', as: 'itineraries' });
db.Itinerary.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Itinerary <-> Day
db.Itinerary.hasMany(db.Day, { foreignKey: 'itineraryId', as: 'days' });
db.Day.belongsTo(db.Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

// Day <-> Activity
db.Day.hasMany(db.Activity, { foreignKey: 'dayId', as: 'activities' });
db.Activity.belongsTo(db.Day, { foreignKey: 'dayId', as: 'day' });

// Itinerary <-> Checklist
db.Itinerary.hasMany(db.Checklist, { foreignKey: 'itineraryId', as: 'checklists' });
db.Checklist.belongsTo(db.Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

// Checklist <-> ChecklistItem
db.Checklist.hasMany(db.ChecklistItem, { foreignKey: 'checklistId', as: 'items' });
db.ChecklistItem.belongsTo(db.Checklist, { foreignKey: 'checklistId', as: 'checklist' });

// Itinerary <-> Expense
db.Itinerary.hasMany(db.Expense, { foreignKey: 'itineraryId', as: 'expenses' });
db.Expense.belongsTo(db.Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

// User <-> Expense (for the paidBy relation)
db.User.hasMany(db.Expense, { foreignKey: 'paidBy', as: 'paidExpenses' });
db.Expense.belongsTo(db.User, { foreignKey: 'paidBy', as: 'payer' });

// Activity <-> Expense
db.Activity.hasMany(db.Expense, { foreignKey: 'activityId', as: 'expenses' });
db.Expense.belongsTo(db.Activity, { foreignKey: 'activityId', as: 'activity' });

// Itinerary <-> Budget
db.Itinerary.hasOne(db.Budget, { foreignKey: 'itineraryId', as: 'budget' });
db.Budget.belongsTo(db.Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

// Itinerary <-> PointOfInterest
db.Itinerary.hasMany(db.PointOfInterest, { foreignKey: 'itineraryId', as: 'pointsOfInterest' });
db.PointOfInterest.belongsTo(db.Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

// Day <-> PointOfInterest
db.Day.hasMany(db.PointOfInterest, { foreignKey: 'dayId', as: 'pointsOfInterest' });
db.PointOfInterest.belongsTo(db.Day, { foreignKey: 'dayId', as: 'day' });

// Activity <-> PointOfInterest
db.Activity.hasOne(db.PointOfInterest, { foreignKey: 'activityId', as: 'pointOfInterest' });
db.PointOfInterest.belongsTo(db.Activity, { foreignKey: 'activityId', as: 'activity' });

// Itinerary <-> Share
db.Itinerary.hasMany(db.Share, { foreignKey: 'itineraryId', as: 'shares' });
db.Share.belongsTo(db.Itinerary, { foreignKey: 'itineraryId', as: 'itinerary' });

// User <-> Share
db.User.hasMany(db.Share, { foreignKey: 'userId', as: 'receivedShares' });
db.Share.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;