import { pool } from '../db.js';
import bcrypt from 'bcrypt';

/**
 * Enhanced Database Seed Script
 * Creates multiple test users with accounts and transactions
 * 
 * Login Info:
 * - Password: crg123 (for all users)
 * - PIN: 1234 (for all users)
 * - Phone: varies per user
 * 
 * Usage: node backend/src/schema/seed.js
 */

async function seedDatabase() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // STEP 1: Clear existing data
        console.log('🗑️  Clearing existing data...');
        await pool.query('DELETE FROM transactions');
        await pool.query('DELETE FROM accounts');
        await pool.query('DELETE FROM safe_zones');
        await pool.query('DELETE FROM users');
        console.log('✅ Database cleared\n');

        // Pre-hash password and PIN for all users
        const passwordHash = bcrypt.hashSync('crg123', 10);
        const pinHash = bcrypt.hashSync('1234', 10);

        // Define test users with unique phone numbers
        const testUsers = [
            {
                name: 'Chirag Aradhya',
                phone: '9998887771',
                initialBalance: 125000.50,
                accountNumber: '1000000001'
            },
            {
                name: 'Priya Sharma',
                phone: '9998887772',
                initialBalance: 89500.00,
                accountNumber: '1000000002'
            },
            {
                name: 'Rahul Kumar',
                phone: '9998887773',
                initialBalance: 156780.25,
                accountNumber: '1000000003'
            },
            {
                name: 'Ananya Singh',
                phone: '9998887774',
                initialBalance: 203450.75,
                accountNumber: '1000000004'
            }
        ];

        console.log('👥 Creating test users...\n');

        for (const userData of testUsers) {
            // Create user
            const result = await pool.query(
                `INSERT INTO users (name, phone, password_hash, security_pin_hash, totp_enabled)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
                [userData.name, userData.phone, passwordHash, pinHash, true]
            );
            const user = result.rows[0];
            console.log(`✅ Created user: ${user.name} (Phone: ${user.phone})`);

            // Create safe zone for user (Bengaluru by default)
            await pool.query(
                `INSERT INTO safe_zones (user_id, zone_name, latitude, longitude, radius, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [user.id, 'Home', 12.9716, 77.5946, 500, true]
            );

            // Create account
            const accountResult = await pool.query(
                `INSERT INTO accounts (user_id, account_number, account_type, balance, currency, account_status, ifsc_code, branch_name, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
                [user.id, userData.accountNumber, 'savings', userData.initialBalance, 'INR', 'active', 'SBIN0001234', 'Bengaluru Main', true]
            );
            const account = accountResult.rows[0];
            console.log(`   💳 Account: ${account.account_number} (Balance: ₹${userData.initialBalance.toLocaleString('en-IN')})`);

            // Generate transactions
            const transactions = generateTransactions(userData.initialBalance);

            for (const txn of transactions) {
                const transactionDate = new Date(Date.now() - txn.daysAgo * 24 * 60 * 60 * 1000);
                const transactionType = txn.amount > 0 ? 'credit' : 'debit';

                await pool.query(
                    `INSERT INTO transactions (account_id, amount, description, category, balance_after, transaction_date, transaction_type, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [account.id, txn.amount, txn.description, txn.category, txn.balanceAfter, transactionDate, transactionType, 'completed']
                );
            }
            console.log(`   📊 ${transactions.length} transactions seeded\n`);
        }

        console.log('✨ Database seeding completed successfully!\n');
        console.log('═══════════════════════════════════════════');
        console.log('🔑 Login Credentials (for ALL users):');
        console.log('   Password: crg123');
        console.log('   PIN: 1234');
        console.log('═══════════════════════════════════════════\n');
        console.log('📱 Test Users:');
        testUsers.forEach((u, i) => {
            console.log(`${i + 1}. ${u.name.padEnd(20)} | ${u.phone} | ₹${u.initialBalance.toLocaleString('en-IN')}`);
        });
        console.log('═══════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

/**
 * Generate random but realistic transactions for a user
 */
function generateTransactions(currentBalance) {
    const transactions = [
        {
            description: 'Salary Credit - Monthly',
            amount: 75000,
            category: 'salary',
            balanceAfter: currentBalance,
            daysAgo: 1
        },
        {
            description: 'Swiggy - Food Delivery',
            amount: -450,
            category: 'food',
            balanceAfter: currentBalance - 450,
            daysAgo: 2
        },
        {
            description: 'Amazon - Online Shopping',
            amount: -2500,
            category: 'shopping',
            balanceAfter: currentBalance - 2950,
            daysAgo: 3
        },
        {
            description: 'Electricity Bill',
            amount: -1200,
            category: 'bills',
            balanceAfter: currentBalance - 4150,
            daysAgo: 4
        },
        {
            description: 'ATM Withdrawal',
            amount: -5000,
            category: 'withdrawal',
            balanceAfter: currentBalance - 9150,
            daysAgo: 5
        },
        {
            description: 'UPI Transfer from Friend',
            amount: 2000,
            category: 'transfer',
            balanceAfter: currentBalance - 7150,
            daysAgo: 6
        },
        {
            description: 'Netflix Subscription',
            amount: -649,
            category: 'entertainment',
            balanceAfter: currentBalance - 7799,
            daysAgo: 7
        },
        {
            description: 'Petrol Pump',
            amount: -3500,
            category: 'transport',
            balanceAfter: currentBalance - 11299,
            daysAgo: 8
        },
        {
            description: 'Freelance Payment Received',
            amount: 15000,
            category: 'income',
            balanceAfter: currentBalance + 3701,
            daysAgo: 9
        },
        {
            description: 'PhonePe - Movie Tickets',
            amount: -800,
            category: 'entertainment',
            balanceAfter: currentBalance + 2901,
            daysAgo: 10
        }
    ];

    return transactions;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase();
}

export { seedDatabase };
