-- Beneficiaries Table
-- Stores saved beneficiaries/payees for quick transfers
CREATE TABLE IF NOT EXISTS beneficiaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(50) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name VARCHAR(100),
    beneficiary_type VARCHAR(20) DEFAULT 'own', -- own, third_party
    is_verified BOOLEAN DEFAULT false,
    max_transfer_limit DECIMAL(15, 2), -- Optional limit per transaction
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX idx_beneficiaries_account_number ON beneficiaries(account_number);
CREATE INDEX idx_beneficiaries_favorite ON beneficiaries(is_favorite);

-- Ensure unique beneficiary per user
CREATE UNIQUE INDEX idx_unique_beneficiary 
ON beneficiaries(user_id, account_number);
