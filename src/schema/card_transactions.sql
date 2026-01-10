-- Card Transactions Table
-- Stores card usage history
CREATE TABLE IF NOT EXISTS card_transactions (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- purchase, withdrawal, refund
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    merchant_name VARCHAR(100),
    merchant_category VARCHAR(50), -- retail, dining, fuel, etc.
    merchant_city VARCHAR(50),
    merchant_country VARCHAR(50),
    is_international BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    is_contactless BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'completed', -- pending, completed, declined, reversed
    decline_reason TEXT,
    reference_number VARCHAR(50) UNIQUE,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_card_transactions_card_id ON card_transactions(card_id);
CREATE INDEX idx_card_transactions_date ON card_transactions(transaction_date DESC);
CREATE INDEX idx_card_transactions_status ON card_transactions(status);
CREATE INDEX idx_card_transactions_merchant ON card_transactions(merchant_name);
CREATE INDEX idx_card_transactions_category ON card_transactions(merchant_category);
