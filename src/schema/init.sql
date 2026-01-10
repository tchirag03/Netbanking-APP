-- Master Database Initialization Script
-- Run this to create all tables in the correct order
-- Based on foreign key dependencies

-- Step 1: Create Users table (no dependencies)
\i users.sql

-- Step 2: Create Accounts table (depends on users)
\i accounts.sql

-- Step 3: Create Transactions table (depends on accounts and users)
\i transactions.sql

-- Step 4: Create Beneficiaries table (depends on users)
\i beneficiaries.sql

-- Step 5: Create Safe Zones table (depends on users)
\i safe_zones.sql

-- Step 6: Create Payments table (depends on users, accounts, transactions)
\i payments.sql

-- Step 7: Create Cards table (depends on users and accounts)
\i cards.sql

-- Step 8: Create Card Transactions table (depends on cards)
\i card_transactions.sql

-- Step 9: Create Login History table (depends on users)
\i login_history.sql

-- Step 10: Create Notifications table (depends on users, transactions, payments)
\i notifications.sql

-- Step 11: Create Support Tickets table (depends on users, transactions, payments)
\i support_tickets.sql

-- Step 12: Create Sessions table (depends on users)
\i sessions.sql

-- Step 13: Create Scheduled Payments table (depends on users, accounts, beneficiaries)
\i scheduled_payments.sql

-- Step 14: Create Account Statements table (depends on accounts)
\i account_statements.sql

-- Step 15: Create UPI IDs table (depends on users and accounts)
\i upi_ids.sql

-- Step 16: Create Fixed Deposits table (depends on users and accounts)
\i fixed_deposits.sql

-- Step 17: Create Loans table (depends on users and accounts)
\i loans.sql

-- Step 18: Create Security Alerts table (depends on users)
\i security_alerts.sql

-- Verify all tables were created
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;
