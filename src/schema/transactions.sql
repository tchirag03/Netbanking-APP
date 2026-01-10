-- Transactions Table
-- Stores all financial transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- debit, credit
    category VARCHAR(50), -- salary, shopping, bills, transfer, etc.
    amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL, -- Balance after this transaction
    transaction_mode VARCHAR(30), -- upi, neft, rtgs, imps, atm, pos, online
    description TEXT,
    reference_number VARCHAR(50) UNIQUE,
    beneficiary_account VARCHAR(20),
    beneficiary_name VARCHAR(100),
    beneficiary_ifsc VARCHAR(11),
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed, reversed
    initiated_by INTEGER REFERENCES users(id),
    failed_reason TEXT,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_reference ON transactions(reference_number);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_category ON transactions(category);
