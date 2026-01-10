-- Fixed Deposits Table
-- Manages term deposits and FD accounts
CREATE TABLE IF NOT EXISTS fixed_deposits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    fd_number VARCHAR(20) UNIQUE NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL, -- Annual interest rate
    tenure_months INTEGER NOT NULL,
    maturity_amount DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    auto_renewal BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active', -- active, matured, premature_withdrawal, closed
    interest_payout VARCHAR(20) DEFAULT 'maturity', -- maturity, monthly, quarterly, annual
    nomination_name VARCHAR(100),
    nomination_relation VARCHAR(50),
    premature_withdrawal_date DATE,
    premature_amount DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_fixed_deposits_user_id ON fixed_deposits(user_id);
CREATE INDEX idx_fixed_deposits_account_id ON fixed_deposits(account_id);
CREATE INDEX idx_fixed_deposits_number ON fixed_deposits(fd_number);
CREATE INDEX idx_fixed_deposits_status ON fixed_deposits(status);
CREATE INDEX idx_fixed_deposits_maturity ON fixed_deposits(maturity_date);
