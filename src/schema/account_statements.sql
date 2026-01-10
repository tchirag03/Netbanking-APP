-- Account Statements Table
-- Generated monthly/quarterly statements
CREATE TABLE IF NOT EXISTS account_statements (
    id SERIAL PRIMARY KEY,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    statement_period VARCHAR(20) NOT NULL, -- monthly, quarterly, annual
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    opening_balance DECIMAL(15, 2) NOT NULL,
    closing_balance DECIMAL(15, 2) NOT NULL,
    total_credits DECIMAL(15, 2) DEFAULT 0.00,
    total_debits DECIMAL(15, 2) DEFAULT 0.00,
    transaction_count INTEGER DEFAULT 0,
    statement_file_url TEXT, -- PDF URL
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    downloaded_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_statements_account_id ON account_statements(account_id);
CREATE INDEX idx_statements_period ON account_statements(start_date, end_date);
CREATE INDEX idx_statements_generated ON account_statements(generated_at DESC);

-- Ensure unique statement per period per account
CREATE UNIQUE INDEX idx_unique_statement 
ON account_statements(account_id, start_date, end_date);
