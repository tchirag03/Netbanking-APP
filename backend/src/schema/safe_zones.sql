-- Safe Zones Table
-- Stores trusted geolocation zones for enhanced security
CREATE TABLE IF NOT EXISTS safe_zones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    zone_name VARCHAR(50) NOT NULL, -- Home, Office, etc.
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius INTEGER DEFAULT 500, -- Radius in meters
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_safe_zones_user_id ON safe_zones(user_id);
CREATE INDEX idx_safe_zones_active ON safe_zones(is_active);
