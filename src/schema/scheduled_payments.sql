-- Scheduled Payments Table
-- Stores recurring and scheduled future payments
CREATE TABLE IF NOT EXISTS scheduled_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    beneficiary_id INTEGER REFERENCES beneficiaries(id),
    payment_type VARCHAR(30) NOT NULL, -- utility, loan_emi, investment, transfer
    amount DECIMAL(15, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- once, daily, weekly, monthly, yearly
    start_date DATE NOT NULL,
    end_date DATE,
    next_execution_date DATE,
    last_execution_date DATE,
    execution_day INTEGER, -- Day of month/week for recurring payments
    max_executions INTEGER, -- Optional limit
    executed_count INTEGER DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, paused, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_scheduled_payments_user_id ON scheduled_payments(user_id);
CREATE INDEX idx_scheduled_payments_account_id ON scheduled_payments(account_id);
CREATE INDEX idx_scheduled_payments_next_date ON scheduled_payments(next_execution_date);
CREATE INDEX idx_scheduled_payments_status ON scheduled_payments(status);
CREATE INDEX idx_scheduled_payments_active ON scheduled_payments(is_active);
