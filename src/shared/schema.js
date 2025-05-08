/**
 * Definição do esquema do banco de dados do Viajey
 * Este arquivo define a estrutura das tabelas conforme o modelo de dados
 */

// Definição dos tipos de colunas
const TYPES = {
  // Tipos de texto
  TEXT: { type: 'TEXT' },
  VARCHAR: (length) => ({ type: 'VARCHAR', length }),
  CHAR: (length) => ({ type: 'CHAR', length }),
  
  // Tipos numéricos
  INTEGER: { type: 'INTEGER' },
  BIGINT: { type: 'BIGINT' },
  SERIAL: { type: 'SERIAL' },
  BIGSERIAL: { type: 'BIGSERIAL' },
  DECIMAL: (precision, scale) => ({ type: 'DECIMAL', precision, scale }),
  NUMERIC: (precision, scale) => ({ type: 'NUMERIC', precision, scale }),
  REAL: { type: 'REAL' },
  DOUBLE: { type: 'DOUBLE PRECISION' },
  
  // Tipos booleanos
  BOOLEAN: { type: 'BOOLEAN' },
  
  // Tipos de data e hora
  DATE: { type: 'DATE' },
  TIMESTAMP: { type: 'TIMESTAMP' },
  TIMESTAMP_TZ: { type: 'TIMESTAMP WITH TIME ZONE' },
  TIME: { type: 'TIME' },
  
  // Tipos JSON
  JSON: { type: 'JSON' },
  JSONB: { type: 'JSONB' },
  
  // Tipos de array
  ARRAY: (itemType) => ({ type: `${itemType.type}[]` }),
  
  // Opções comuns para colunas
  NULL: { nullable: true },
  NOT_NULL: { nullable: false },
  PRIMARY_KEY: { primaryKey: true },
  UNIQUE: { unique: true },
  DEFAULT: (value) => ({ default: value }),
  REFERENCES: (table, column = 'id') => ({ references: { table, column } }),
  CASCADE: { onDelete: 'CASCADE' },
  SET_NULL: { onDelete: 'SET NULL' },
  CHECK: (expression) => ({ check: expression }),
};

// Esquema das tabelas
const schema = {
  users: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    username: { ...TYPES.VARCHAR(50), ...TYPES.NOT_NULL, ...TYPES.UNIQUE },
    email: { ...TYPES.VARCHAR(100), ...TYPES.NOT_NULL, ...TYPES.UNIQUE },
    password_hash: { ...TYPES.VARCHAR(255), ...TYPES.NOT_NULL },
    full_name: { ...TYPES.VARCHAR(100), ...TYPES.NULL },
    profile_image: { ...TYPES.VARCHAR(255), ...TYPES.NULL },
    preferences: { ...TYPES.JSONB, ...TYPES.NULL },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    updated_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    last_login: { ...TYPES.TIMESTAMP, ...TYPES.NULL },
    indexes: [
      { columns: ['email'], type: 'btree' },
      { columns: ['username'], type: 'btree' }
    ]
  },

  itineraries: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    user_id: { ...TYPES.INTEGER, ...TYPES.NULL, ...TYPES.REFERENCES('users'), ...TYPES.SET_NULL },
    title: { ...TYPES.VARCHAR(100), ...TYPES.NOT_NULL },
    destination: { ...TYPES.VARCHAR(100), ...TYPES.NOT_NULL },
    start_date: { ...TYPES.DATE, ...TYPES.NOT_NULL },
    end_date: { ...TYPES.DATE, ...TYPES.NOT_NULL },
    description: { ...TYPES.TEXT, ...TYPES.NULL },
    cover_image: { ...TYPES.VARCHAR(255), ...TYPES.NULL },
    budget: { ...TYPES.DECIMAL(10, 2), ...TYPES.NULL },
    budget_currency: { ...TYPES.CHAR(3), ...TYPES.NULL },
    options: { ...TYPES.JSONB, ...TYPES.NULL },
    status: { ...TYPES.VARCHAR(20), ...TYPES.NOT_NULL, ...TYPES.DEFAULT("'planning'") },
    share_code: { ...TYPES.VARCHAR(20), ...TYPES.UNIQUE },
    location_lat: { ...TYPES.DECIMAL(9, 6), ...TYPES.NULL },
    location_lng: { ...TYPES.DECIMAL(9, 6), ...TYPES.NULL },
    travel_mode: { ...TYPES.VARCHAR(20), ...TYPES.NULL },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    updated_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    indexes: [
      { columns: ['user_id'], type: 'btree' },
      { columns: ['destination'], type: 'btree' },
      { columns: ['share_code'], type: 'btree' }
    ]
  },

  itinerary_days: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    itinerary_id: { ...TYPES.INTEGER, ...TYPES.NOT_NULL, ...TYPES.REFERENCES('itineraries'), ...TYPES.CASCADE },
    day_number: { ...TYPES.INTEGER, ...TYPES.NOT_NULL },
    date: { ...TYPES.DATE, ...TYPES.NOT_NULL },
    title: { ...TYPES.VARCHAR(100), ...TYPES.NULL },
    notes: { ...TYPES.TEXT, ...TYPES.NULL },
    weather_forecast: { ...TYPES.JSONB, ...TYPES.NULL },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    updated_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    indexes: [
      { columns: ['itinerary_id', 'day_number'], type: 'btree', unique: true }
    ]
  },

  activities: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    itinerary_day_id: { ...TYPES.INTEGER, ...TYPES.NOT_NULL, ...TYPES.REFERENCES('itinerary_days'), ...TYPES.CASCADE },
    name: { ...TYPES.VARCHAR(100), ...TYPES.NOT_NULL },
    type: { ...TYPES.VARCHAR(50), ...TYPES.NOT_NULL },
    location: { ...TYPES.VARCHAR(255), ...TYPES.NULL },
    period: { ...TYPES.VARCHAR(20), ...TYPES.NOT_NULL },
    start_time: { ...TYPES.TIME, ...TYPES.NULL },
    end_time: { ...TYPES.TIME, ...TYPES.NULL },
    notes: { ...TYPES.TEXT, ...TYPES.NULL },
    position: { ...TYPES.INTEGER, ...TYPES.NOT_NULL, ...TYPES.DEFAULT(0) },
    place_id: { ...TYPES.VARCHAR(100), ...TYPES.NULL },
    location_lat: { ...TYPES.DECIMAL(9, 6), ...TYPES.NULL },
    location_lng: { ...TYPES.DECIMAL(9, 6), ...TYPES.NULL },
    cost: { ...TYPES.DECIMAL(10, 2), ...TYPES.NULL },
    currency: { ...TYPES.CHAR(3), ...TYPES.NULL },
    reservation_info: { ...TYPES.JSONB, ...TYPES.NULL },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    updated_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    indexes: [
      { columns: ['itinerary_day_id'], type: 'btree' },
      { columns: ['itinerary_day_id', 'period', 'position'], type: 'btree' }
    ]
  },

  checklists: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    itinerary_id: { ...TYPES.INTEGER, ...TYPES.NOT_NULL, ...TYPES.REFERENCES('itineraries'), ...TYPES.CASCADE },
    title: { ...TYPES.VARCHAR(100), ...TYPES.NOT_NULL },
    category: { ...TYPES.VARCHAR(50), ...TYPES.NULL },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    updated_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    indexes: [
      { columns: ['itinerary_id'], type: 'btree' }
    ]
  },

  checklist_items: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    checklist_id: { ...TYPES.INTEGER, ...TYPES.NOT_NULL, ...TYPES.REFERENCES('checklists'), ...TYPES.CASCADE },
    description: { ...TYPES.VARCHAR(255), ...TYPES.NOT_NULL },
    completed: { ...TYPES.BOOLEAN, ...TYPES.NOT_NULL, ...TYPES.DEFAULT(false) },
    priority: { ...TYPES.VARCHAR(20), ...TYPES.NULL },
    notes: { ...TYPES.TEXT, ...TYPES.NULL },
    position: { ...TYPES.INTEGER, ...TYPES.NOT_NULL, ...TYPES.DEFAULT(0) },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    updated_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    indexes: [
      { columns: ['checklist_id'], type: 'btree' },
      { columns: ['checklist_id', 'position'], type: 'btree' }
    ]
  },

  expenses: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    itinerary_id: { ...TYPES.INTEGER, ...TYPES.NOT_NULL, ...TYPES.REFERENCES('itineraries'), ...TYPES.CASCADE },
    activity_id: { ...TYPES.INTEGER, ...TYPES.NULL, ...TYPES.REFERENCES('activities'), ...TYPES.SET_NULL },
    category: { ...TYPES.VARCHAR(50), ...TYPES.NOT_NULL },
    description: { ...TYPES.VARCHAR(255), ...TYPES.NOT_NULL },
    amount: { ...TYPES.DECIMAL(10, 2), ...TYPES.NOT_NULL },
    currency: { ...TYPES.CHAR(3), ...TYPES.NOT_NULL },
    date: { ...TYPES.DATE, ...TYPES.NOT_NULL },
    paid: { ...TYPES.BOOLEAN, ...TYPES.NOT_NULL, ...TYPES.DEFAULT(false) },
    payment_method: { ...TYPES.VARCHAR(50), ...TYPES.NULL },
    receipt_image: { ...TYPES.VARCHAR(255), ...TYPES.NULL },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    updated_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    indexes: [
      { columns: ['itinerary_id'], type: 'btree' },
      { columns: ['activity_id'], type: 'btree' },
      { columns: ['date'], type: 'btree' }
    ]
  },

  places: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    place_id: { ...TYPES.VARCHAR(100), ...TYPES.NOT_NULL, ...TYPES.UNIQUE },
    name: { ...TYPES.VARCHAR(255), ...TYPES.NOT_NULL },
    address: { ...TYPES.VARCHAR(255), ...TYPES.NULL },
    lat: { ...TYPES.DECIMAL(9, 6), ...TYPES.NOT_NULL },
    lng: { ...TYPES.DECIMAL(9, 6), ...TYPES.NOT_NULL },
    place_types: { ...TYPES.JSONB, ...TYPES.NULL },
    rating: { ...TYPES.DECIMAL(2, 1), ...TYPES.NULL },
    photos: { ...TYPES.JSONB, ...TYPES.NULL },
    open_hours: { ...TYPES.JSONB, ...TYPES.NULL },
    price_level: { ...TYPES.INTEGER, ...TYPES.NULL },
    city: { ...TYPES.VARCHAR(100), ...TYPES.NULL },
    country: { ...TYPES.VARCHAR(100), ...TYPES.NULL },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    updated_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    indexes: [
      { columns: ['place_id'], type: 'btree' },
      { columns: ['lat', 'lng'], type: 'btree' },
      { columns: ['city', 'country'], type: 'btree' }
    ]
  },

  collaborators: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    itinerary_id: { ...TYPES.INTEGER, ...TYPES.NOT_NULL, ...TYPES.REFERENCES('itineraries'), ...TYPES.CASCADE },
    user_id: { ...TYPES.INTEGER, ...TYPES.NULL, ...TYPES.REFERENCES('users'), ...TYPES.SET_NULL },
    email: { ...TYPES.VARCHAR(100), ...TYPES.NOT_NULL },
    role: { ...TYPES.VARCHAR(20), ...TYPES.NOT_NULL, ...TYPES.DEFAULT("'viewer'") },
    invitation_status: { ...TYPES.VARCHAR(20), ...TYPES.NOT_NULL, ...TYPES.DEFAULT("'pending'") },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    updated_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    indexes: [
      { columns: ['itinerary_id'], type: 'btree' },
      { columns: ['user_id'], type: 'btree' },
      { columns: ['email'], type: 'btree' }
    ]
  },

  notifications: {
    id: { ...TYPES.SERIAL, ...TYPES.PRIMARY_KEY },
    user_id: { ...TYPES.INTEGER, ...TYPES.NOT_NULL, ...TYPES.REFERENCES('users'), ...TYPES.CASCADE },
    title: { ...TYPES.VARCHAR(255), ...TYPES.NOT_NULL },
    message: { ...TYPES.TEXT, ...TYPES.NOT_NULL },
    type: { ...TYPES.VARCHAR(50), ...TYPES.NOT_NULL },
    read: { ...TYPES.BOOLEAN, ...TYPES.NOT_NULL, ...TYPES.DEFAULT(false) },
    action_url: { ...TYPES.VARCHAR(255), ...TYPES.NULL },
    created_at: { ...TYPES.TIMESTAMP, ...TYPES.NOT_NULL, ...TYPES.DEFAULT('CURRENT_TIMESTAMP') },
    indexes: [
      { columns: ['user_id'], type: 'btree' },
      { columns: ['read'], type: 'btree' }
    ]
  }
};

module.exports = {
  schema,
  TYPES
};