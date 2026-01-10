
import { pool } from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Reset Script
 * WARNING: This will drop all tables and recreate them
 * USE WITH CAUTION - ALL DATA WILL BE LOST
 */

const tables = [
    'security_alerts',
    'loans',
    'fixed_deposits',
    'upi_ids',
    'account_statements',
    'scheduled_payments',
    'sessions',
    'support_tickets',
    'notifications',
    'login_history',
    'card_transactions',
    'cards',
    'payments',
    'safe_zones',
    'beneficiaries',
    'transactions',
    'accounts',
    'users',
];

async function resetDatabase() {
    console.log('⚠️  WARNING: This will delete ALL data in the database!\n');

    try {
        // Drop all tables in reverse dependency order
        console.log('🗑️  Dropping existing tables...\n');

        for (const table of tables) {
            await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
            console.log(`   Dropped: ${table}`);
        }

        console.log('\n✅ All tables dropped successfully!\n');
        console.log('💡 Run initialize.js to recreate the schema.\n');

    } catch (error) {
        console.error('❌ Database reset failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    resetDatabase();
}

export { resetDatabase };
