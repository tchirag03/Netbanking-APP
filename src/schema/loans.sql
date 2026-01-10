-- Loans Table
-- Manages personal, home, and vehicle loans
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    loan_number VARCHAR(20) UNIQUE NOT NULL,
    loan_type VARCHAR(30) NOT NULL, -- personal, home, vehicle, education, business
    loan_amount DECIMAL(15, 2) NOT NULL,
    outstanding_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    emi_amount DECIMAL(15, 2) NOT NULL,
    emi_day INTEGER NOT NULL, -- Day of month for EMI
    disbursement_date DATE NOT NULL,
    first_emi_date DATE NOT NULL,
    last_emi_date DATE,
    next_emi_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, paid, defaulted, closed
    prepayment_allowed BOOLEAN DEFAULT true,
    prepayment_charges DECIMAL(5, 2), -- Percentage
    collateral_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_account_id ON loans(account_id);
CREATE INDEX idx_loans_number ON loans(loan_number);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_next_emi ON loans(next_emi_date);
