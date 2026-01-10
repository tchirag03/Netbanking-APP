-- Cards Table
-- Stores debit and credit card information
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE, -- For debit cards
    card_number VARCHAR(19) UNIQUE NOT NULL, -- Encrypted/Masked
    card_type VARCHAR(20) NOT NULL, -- debit, credit
    card_variant VARCHAR(30), -- platinum, gold, classic
    card_holder_name VARCHAR(100) NOT NULL,
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    cvv_hash VARCHAR(255), -- Hashed CVV for verification
    credit_limit DECIMAL(15, 2), -- For credit cards
    available_credit DECIMAL(15, 2), -- For credit cards
    billing_day INTEGER, -- Day of month for credit card billing
    card_status VARCHAR(20) DEFAULT 'active', -- active, blocked, expired, lost
    is_international_enabled BOOLEAN DEFAULT false,
    is_online_enabled BOOLEAN DEFAULT true,
    is_contactless_enabled BOOLEAN DEFAULT true,
    daily_limit DECIMAL(15, 2),
    monthly_limit DECIMAL(15, 2),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_account_id ON cards(account_id);
CREATE INDEX idx_cards_number ON cards(card_number);
CREATE INDEX idx_cards_status ON cards(card_status);
CREATE INDEX idx_cards_type ON cards(card_type);
