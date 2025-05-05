/**
 * Viajey - Definição do schema do banco de dados
 * Este arquivo define a estrutura das tabelas do banco de dados
 */

// Definição das tabelas do sistema
const schema = {
  // Tabela de usuários
  users: {
    id: { type: 'serial', primaryKey: true },
    username: { type: 'varchar(100)', notNull: true, unique: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    profile_pic: { type: 'varchar(255)' },
    preferences: { type: 'jsonb' },
    travel_style: { type: 'varchar(50)' },
    created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' }
  },

  // Tabela de itinerários
  itineraries: {
    id: { type: 'serial', primaryKey: true },
    user_id: { 
      type: 'integer', 
      references: { table: 'users', column: 'id' } 
    },
    title: { type: 'varchar(255)', notNull: true },
    destination: { type: 'varchar(255)', notNull: true },
    start_date: { type: 'date', notNull: true },
    end_date: { type: 'date', notNull: true },
    preferences: { type: 'jsonb' },
    price_range: { type: 'varchar(50)' },
    cover_image: { type: 'varchar(255)' },
    is_public: { type: 'boolean', defaultValue: false },
    share_code: { type: 'varchar(20)', unique: true },
    created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' }
  },

  // Tabela de dias do itinerário
  itinerary_days: {
    id: { type: 'serial', primaryKey: true },
    itinerary_id: { 
      type: 'integer', 
      references: { table: 'itineraries', column: 'id' },
      onDelete: 'CASCADE'
    },
    day_number: { type: 'integer', notNull: true },
    date: { type: 'date', notNull: true },
    title: { type: 'varchar(100)' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' }
  },

  // Tabela de atividades
  activities: {
    id: { type: 'serial', primaryKey: true },
    itinerary_day_id: { 
      type: 'integer', 
      references: { table: 'itinerary_days', column: 'id' },
      onDelete: 'CASCADE'
    },
    name: { type: 'varchar(255)', notNull: true },
    type: { type: 'varchar(50)', notNull: true },
    location: { type: 'varchar(255)' },
    address: { type: 'text' },
    latitude: { type: 'decimal(10,8)' },
    longitude: { type: 'decimal(11,8)' },
    period: { type: 'varchar(50)', notNull: true },
    start_time: { type: 'time' },
    end_time: { type: 'time' },
    notes: { type: 'text' },
    position: { type: 'integer' },
    price: { type: 'decimal(10,2)' },
    rating: { type: 'decimal(2,1)' },
    image_url: { type: 'varchar(255)' },
    place_id: { type: 'varchar(255)' },
    created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' }
  },

  // Tabela de lista de verificação
  checklists: {
    id: { type: 'serial', primaryKey: true },
    itinerary_id: { 
      type: 'integer', 
      references: { table: 'itineraries', column: 'id' },
      onDelete: 'CASCADE'
    },
    title: { type: 'varchar(100)', notNull: true },
    created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' }
  },

  // Tabela de itens do checklist
  checklist_items: {
    id: { type: 'serial', primaryKey: true },
    checklist_id: { 
      type: 'integer', 
      references: { table: 'checklists', column: 'id' },
      onDelete: 'CASCADE'
    },
    description: { type: 'varchar(255)', notNull: true },
    is_checked: { type: 'boolean', defaultValue: false },
    category: { type: 'varchar(50)' },
    priority: { type: 'integer', defaultValue: 0 },
    created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' }
  },

  // Tabela para cache de lugares (reduzir chamadas à API)
  cached_places: {
    id: { type: 'serial', primaryKey: true },
    place_id: { type: 'varchar(255)', notNull: true, unique: true },
    name: { type: 'varchar(255)', notNull: true },
    type: { type: 'varchar(50)' },
    address: { type: 'text' },
    latitude: { type: 'decimal(10,8)' },
    longitude: { type: 'decimal(11,8)' },
    phone: { type: 'varchar(50)' },
    website: { type: 'varchar(255)' },
    rating: { type: 'decimal(2,1)' },
    price_level: { type: 'integer' },
    place_data: { type: 'jsonb' },
    photos: { type: 'jsonb' },
    last_updated: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' }
  },

  // Tabela para comentários
  comments: {
    id: { type: 'serial', primaryKey: true },
    itinerary_id: { 
      type: 'integer', 
      references: { table: 'itineraries', column: 'id' },
      onDelete: 'CASCADE'
    },
    user_id: { 
      type: 'integer', 
      references: { table: 'users', column: 'id' }
    },
    comment: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' }
  },

  // Tabela para favoritos
  favorites: {
    id: { type: 'serial', primaryKey: true },
    user_id: { 
      type: 'integer', 
      references: { table: 'users', column: 'id' }
    },
    itinerary_id: { 
      type: 'integer', 
      references: { table: 'itineraries', column: 'id' },
      onDelete: 'CASCADE'
    },
    created_at: { type: 'timestamp', defaultValue: 'CURRENT_TIMESTAMP' },
    unique: ['user_id', 'itinerary_id']
  }
};

module.exports = schema;