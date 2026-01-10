-- Login History Table
-- Audit trail for user authentication events
CREATE TABLE IF NOT EXISTS login_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_status VARCHAR(20) NOT NULL, -- success, failed, blocked
    login_method VARCHAR(30), -- password, totp, biometric
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(20), -- mobile, desktop, tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    geolocation_lat DECIMAL(10, 8),
    geolocation_lng DECIMAL(11, 8),
    is_safe_zone BOOLEAN DEFAULT false,
    failure_reason TEXT, -- wrong password, invalid totp, etc.
    totp_verified BOOLEAN,
    session_id VARCHAR(255),
    logout_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_status ON login_history(login_status);
CREATE INDEX idx_login_history_date ON login_history(created_at DESC);
CREATE INDEX idx_login_history_session ON login_history(session_id);
