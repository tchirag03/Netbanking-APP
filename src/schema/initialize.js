import { pool } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Initialization Script
 * Run this to create all tables in the correct order
 */

const schemaFiles = [
    'users.sql',
    'accounts.sql',
    'transactions.sql',
    'beneficiaries.sql',
    'safe_zones.sql',
    'payments.sql',
    'cards.sql',
    'card_transactions.sql',
    'login_history.sql',
    'notifications.sql',
    'support_tickets.sql',
    'sessions.sql',
    'scheduled_payments.sql',
    'account_statements.sql',
    'upi_ids.sql',
    'fixed_deposits.sql',
    'loans.sql',
    'security_alerts.sql',
];

async function initializeDatabase() {
    console.log('🚀 Starting database initialization...\n');

    try {
        for (const file of schemaFiles) {
            const filePath = path.join(__dirname, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            await pool.query(sql);
            console.log(`✅ Created schema: ${file}`);
        }

        // Verify tables were created
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);

        console.log('\n📊 Database tables created:');
        result.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

        console.log('\n✨ Database initialization completed successfully!');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeDatabase();
}

export { initializeDatabase };
