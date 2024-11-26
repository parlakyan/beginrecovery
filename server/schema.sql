-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facilities table
CREATE TABLE facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facility Images table
CREATE TABLE facility_images (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  url VARCHAR(255) NOT NULL,
  order_index INTEGER
);

-- Amenities table
CREATE TABLE amenities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Facility Amenities junction table
CREATE TABLE facility_amenities (
  facility_id INTEGER REFERENCES facilities(id),
  amenity_id INTEGER REFERENCES amenities(id),
  PRIMARY KEY (facility_id, amenity_id)
);

-- Reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  author_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50),
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);