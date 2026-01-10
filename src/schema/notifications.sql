-- Notifications Table
-- Stores user notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(30) NOT NULL, -- transaction, security, promotion, system
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    category VARCHAR(30), -- payment, login, card, account
    related_transaction_id INTEGER REFERENCES transactions(id),
    related_payment_id INTEGER REFERENCES payments(id),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    action_url TEXT, -- Deep link or URL for notification action
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_date ON notifications(created_at DESC);
CREATE INDEX idx_notifications_priority ON notifications(priority);
