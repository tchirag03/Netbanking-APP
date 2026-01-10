-- Payments Table
-- Stores payment flow information with security levels
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    payment_type VARCHAR(30) NOT NULL, -- upi, card, netbanking, wallet
    amount DECIMAL(15, 2) NOT NULL,
    recipient_type VARCHAR(20), -- beneficiary, merchant, utility
    recipient_id INTEGER, -- Could reference beneficiaries or merchants
    recipient_name VARCHAR(100),
    recipient_account VARCHAR(50),
    security_level VARCHAR(10) NOT NULL, -- green, amber, red
    security_score INTEGER, -- 0-100
    requires_otp BOOLEAN DEFAULT false,
    requires_biometric BOOLEAN DEFAULT false,
    otp_sent VARCHAR(6),
    otp_verified BOOLEAN DEFAULT false,
    geolocation_lat DECIMAL(10, 8),
    geolocation_lng DECIMAL(11, 8),
    is_safe_zone BOOLEAN DEFAULT false,
    device_info TEXT, -- Browser, OS, etc.
    ip_address VARCHAR(45),
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    failure_reason TEXT,
    transaction_id INTEGER REFERENCES transactions(id),
    reference_number VARCHAR(50) UNIQUE,
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_account_id ON payments(account_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_security_level ON payments(security_level);
CREATE INDEX idx_payments_date ON payments(initiated_at DESC);
CREATE INDEX idx_payments_reference ON payments(reference_number);
