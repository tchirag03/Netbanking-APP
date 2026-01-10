# Database Schema Documentation

## Overview
This directory contains all SQL schema files for the Netbanking Application. The schemas are designed for PostgreSQL and include comprehensive tables for user management, banking operations, payments, security, and customer support.

## Schema Files

### Core Banking
1. **users.sql** - User authentication, profiles, KYC, TOTP, and security PINs
2. **accounts.sql** - Bank accounts with multiple account types and balances
3. **transactions.sql** - Complete transaction history with categorization
4. **beneficiaries.sql** - Saved payees for quick transfers

### Payments & Transfers
5. **payments.sql** - Payment records with adaptive security levels (Green/Amber/Red)
6. **safe_zones.sql** - Trusted geolocation zones for enhanced security
7. **scheduled_payments.sql** - Recurring and scheduled future payments
8. **upi_ids.sql** - UPI virtual payment addresses

### Cards
9. **cards.sql** - Debit and credit card management
10. **card_transactions.sql** - Card usage history and merchant details

### Security & Audit
11. **login_history.sql** - Authentication audit trail with geolocation
12. **security_alerts.sql** - Suspicious activity tracking
13. **sessions.sql** - Active session and JWT token management

### Financial Products
14. **fixed_deposits.sql** - Term deposit accounts with interest calculations
15. **loans.sql** - Personal, home, vehicle, and other loan types
16. **account_statements.sql** - Periodic financial summaries

### User Experience
17. **notifications.sql** - User alerts and notifications
18. **support_tickets.sql** - Customer support ticketing system

## Installation

### Using the Master Script
```bash
# Navigate to the schema directory
cd backend/src/schema

# Run the initialization script
psql -U your_username -d your_database -f init.sql
```

### Manual Installation
If you prefer to run schemas individually:
```bash
psql -U your_username -d your_database -f users.sql
psql -U your_username -d your_database -f accounts.sql
# ... continue with other files in dependency order
```

### Using Node.js
```javascript
import { pool } from '../db.js';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
    const schemaFiles = [
        'users.sql',
        'accounts.sql',
        'transactions.sql',
        // ... add all schema files in order
    ];

    for (const file of schemaFiles) {
        const sql = fs.readFileSync(
            path.join(__dirname, 'schema', file),
            'utf-8'
        );
        await pool.query(sql);
        console.log(`✅ Created schema: ${file}`);
    }
}

initializeDatabase().catch(console.error);
```

## Key Features

### Security Features
- **TOTP Integration**: Two-factor authentication support via `totp_secret` in users table
- **Geolocation Tracking**: Payment and login geolocation for fraud detection
- **Safe Zones**: Trusted location management for enhanced security
- **Security PINs**: Hashed 4-digit transaction PINs
- **Adaptive Payment Security**: Green/Amber/Red security levels based on risk assessment

### Advanced Payment Flow
The `payments` table implements a sophisticated security system:
- **Green Zone**: Low-risk transactions (safe location, small amount)
- **Amber Zone**: Medium-risk requiring OTP
- **Red Zone**: High-risk requiring OTP + Biometric + 4-digit PIN

### Audit Trail
- Complete login history with device fingerprinting
- Transaction tracking with reference numbers
- Security alerts for suspicious activities

### Financial Products
- Fixed deposits with auto-renewal
- Loans with EMI tracking
- Scheduled recurring payments
- UPI payment support

## Important Notes

1. **Indexes**: All tables include optimized indexes for common query patterns
2. **Foreign Keys**: Proper referential integrity with CASCADE deletes
3. **Timestamps**: Most tables include `created_at` and `updated_at` for audit purposes
4. **Unique Constraints**: Prevents duplicate data (e.g., one primary account per user)
5. **Sensitive Data**: Remember to encrypt/hash sensitive fields like passwords, PINs, and card numbers

## Database Triggers (Optional)
Consider adding these triggers for enhanced functionality:

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Migration Strategy
When modifying existing schemas:
1. Create migration files in `schema/migrations/`
2. Use version numbers: `001_add_field.sql`, `002_modify_index.sql`
3. Always include rollback scripts

## Best Practices
1. **Never store plain text passwords** - Always use bcrypt or similar
2. **Encrypt card numbers** - PCI-DSS compliance required
3. **Hash CVVs** - Never store plain text CVVs
4. **Use transactions** - Wrap related operations in database transactions
5. **Regular backups** - Implement automated backup策略

## Support
For schema-related questions or modifications, refer to the main project documentation.
