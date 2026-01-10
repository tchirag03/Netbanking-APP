-- Security Alerts Table
-- Tracks security events and suspicious activities
CREATE TABLE IF NOT EXISTS security_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- suspicious_login, unusual_transaction, multiple_failed_attempts, new_device, foreign_location
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    description TEXT NOT NULL,
    event_data JSONB, -- Stores additional context
    ip_address VARCHAR(45),
    device_info TEXT,
    geolocation_lat DECIMAL(10, 8),
    geolocation_lng DECIMAL(11, 8),
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP,
    action_taken VARCHAR(100), -- account_locked, password_reset, otp_sent, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_security_alerts_acknowledged ON security_alerts(is_acknowledged);
CREATE INDEX idx_security_alerts_date ON security_alerts(created_at DESC);
