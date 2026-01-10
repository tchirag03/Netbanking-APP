-- UPI IDs Table
-- Manages UPI virtual payment addresses
CREATE TABLE IF NOT EXISTS upi_ids (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    upi_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., user@bankname
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    daily_limit DECIMAL(15, 2) DEFAULT 100000.00,
    monthly_limit DECIMAL(15, 2) DEFAULT 1000000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deactivated_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_upi_ids_user_id ON upi_ids(user_id);
CREATE INDEX idx_upi_ids_account_id ON upi_ids(account_id);
CREATE INDEX idx_upi_ids_upi_id ON upi_ids(upi_id);
CREATE INDEX idx_upi_ids_active ON upi_ids(is_active);

-- Ensure only one primary UPI ID per user
CREATE UNIQUE INDEX idx_one_primary_upi 
ON upi_ids(user_id) 
WHERE is_primary = true;
