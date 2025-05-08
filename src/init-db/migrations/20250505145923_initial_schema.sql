-- Schema do banco de dados Viajey
-- Gerado automaticamente em 2025-05-05T14:59:23.260Z

BEGIN;


CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(50) NOT NULL UNIQUE,
  "email" VARCHAR(100) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "full_name" VARCHAR(100),
  "profile_image" VARCHAR(255),
  "preferences" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_login" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "itineraries" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "title" VARCHAR(100) NOT NULL,
  "destination" VARCHAR(100) NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "description" TEXT,
  "cover_image" VARCHAR(255),
  "budget" DECIMAL(10,2),
  "budget_currency" CHAR(3),
  "options" JSONB,
  "status" VARCHAR(20) NOT NULL DEFAULT 'planning',
  "share_code" VARCHAR(20) UNIQUE,
  "location_lat" DECIMAL(9,6),
  "location_lng" DECIMAL(9,6),
  "travel_mode" VARCHAR(20),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "itinerary_days" (
  "id" SERIAL PRIMARY KEY,
  "itinerary_id" INTEGER NOT NULL REFERENCES "itineraries"("id") ON DELETE CASCADE,
  "day_number" INTEGER NOT NULL,
  "date" DATE NOT NULL,
  "title" VARCHAR(100),
  "notes" TEXT,
  "weather_forecast" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "activities" (
  "id" SERIAL PRIMARY KEY,
  "itinerary_day_id" INTEGER NOT NULL REFERENCES "itinerary_days"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "location" VARCHAR(255),
  "period" VARCHAR(20) NOT NULL,
  "start_time" TIME,
  "end_time" TIME,
  "notes" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "place_id" VARCHAR(100),
  "location_lat" DECIMAL(9,6),
  "location_lng" DECIMAL(9,6),
  "cost" DECIMAL(10,2),
  "currency" CHAR(3),
  "reservation_info" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "checklists" (
  "id" SERIAL PRIMARY KEY,
  "itinerary_id" INTEGER NOT NULL REFERENCES "itineraries"("id") ON DELETE CASCADE,
  "title" VARCHAR(100) NOT NULL,
  "category" VARCHAR(50),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "checklist_items" (
  "id" SERIAL PRIMARY KEY,
  "checklist_id" INTEGER NOT NULL REFERENCES "checklists"("id") ON DELETE CASCADE,
  "description" VARCHAR(255) NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "priority" VARCHAR(20),
  "notes" TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "expenses" (
  "id" SERIAL PRIMARY KEY,
  "itinerary_id" INTEGER NOT NULL REFERENCES "itineraries"("id") ON DELETE CASCADE,
  "activity_id" INTEGER REFERENCES "activities"("id") ON DELETE SET NULL,
  "category" VARCHAR(50) NOT NULL,
  "description" VARCHAR(255) NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" CHAR(3) NOT NULL,
  "date" DATE NOT NULL,
  "paid" BOOLEAN NOT NULL DEFAULT false,
  "payment_method" VARCHAR(50),
  "receipt_image" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "places" (
  "id" SERIAL PRIMARY KEY,
  "place_id" VARCHAR(100) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "address" VARCHAR(255),
  "lat" DECIMAL(9,6) NOT NULL,
  "lng" DECIMAL(9,6) NOT NULL,
  "place_types" JSONB,
  "rating" DECIMAL(2,1),
  "photos" JSONB,
  "open_hours" JSONB,
  "price_level" INTEGER,
  "city" VARCHAR(100),
  "country" VARCHAR(100),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "collaborators" (
  "id" SERIAL PRIMARY KEY,
  "itinerary_id" INTEGER NOT NULL REFERENCES "itineraries"("id") ON DELETE CASCADE,
  "user_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
  "email" VARCHAR(100) NOT NULL,
  "role" VARCHAR(20) NOT NULL DEFAULT 'viewer',
  "invitation_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "action_url" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" USING btree ("username");

CREATE INDEX IF NOT EXISTS "idx_itineraries_user_id" ON "itineraries" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_itineraries_destination" ON "itineraries" USING btree ("destination");
CREATE INDEX IF NOT EXISTS "idx_itineraries_share_code" ON "itineraries" USING btree ("share_code");

CREATE UNIQUE INDEX IF NOT EXISTS "idx_itinerary_days_itinerary_id_day_number" ON "itinerary_days" USING btree ("itinerary_id", "day_number");

CREATE INDEX IF NOT EXISTS "idx_activities_itinerary_day_id" ON "activities" USING btree ("itinerary_day_id");
CREATE INDEX IF NOT EXISTS "idx_activities_itinerary_day_id_period_position" ON "activities" USING btree ("itinerary_day_id", "period", "position");

CREATE INDEX IF NOT EXISTS "idx_checklists_itinerary_id" ON "checklists" USING btree ("itinerary_id");

CREATE INDEX IF NOT EXISTS "idx_checklist_items_checklist_id" ON "checklist_items" USING btree ("checklist_id");
CREATE INDEX IF NOT EXISTS "idx_checklist_items_checklist_id_position" ON "checklist_items" USING btree ("checklist_id", "position");

CREATE INDEX IF NOT EXISTS "idx_expenses_itinerary_id" ON "expenses" USING btree ("itinerary_id");
CREATE INDEX IF NOT EXISTS "idx_expenses_activity_id" ON "expenses" USING btree ("activity_id");
CREATE INDEX IF NOT EXISTS "idx_expenses_date" ON "expenses" USING btree ("date");

CREATE INDEX IF NOT EXISTS "idx_places_place_id" ON "places" USING btree ("place_id");
CREATE INDEX IF NOT EXISTS "idx_places_lat_lng" ON "places" USING btree ("lat", "lng");
CREATE INDEX IF NOT EXISTS "idx_places_city_country" ON "places" USING btree ("city", "country");

CREATE INDEX IF NOT EXISTS "idx_collaborators_itinerary_id" ON "collaborators" USING btree ("itinerary_id");
CREATE INDEX IF NOT EXISTS "idx_collaborators_user_id" ON "collaborators" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_collaborators_email" ON "collaborators" USING btree ("email");

CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON "notifications" USING btree ("read");

COMMIT;
