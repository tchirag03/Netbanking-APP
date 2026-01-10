import { pool } from '../db.js';
import bcrypt from 'bcrypt';
import { getDistance } from 'geolib';
import { verifyTOTP } from '../utils/totp.js';
import { z } from 'zod';

/**
 * Get user's transaction history
 * @route GET /api/transactions
 */
export const getTransactions = async (req, res) => {
    try {
        const userId = req.user.userId; // From JWT middleware
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        // Get user's account first
        const accountResult = await pool.query(
            'SELECT id FROM accounts WHERE user_id = $1 LIMIT 1',
            [userId]
        );

        if (accountResult.rows.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const accountId = accountResult.rows[0].id;

        // Get transactions for the account
        const transactionsResult = await pool.query(
            `SELECT * FROM transactions 
       WHERE account_id = $1 
       ORDER BY transaction_date DESC 
       LIMIT $2 OFFSET $3`,
            [accountId, limit, offset]
        );

        const transactions = transactionsResult.rows.map(t => ({
            id: t.id.toString(),
            date: t.transaction_date,
            description: t.description,
            amount: parseFloat(t.amount),
            type: parseFloat(t.amount) > 0 ? 'credit' : 'debit',
            category: t.category || 'general',
            balance: parseFloat(t.balance_after)
        }));

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const paymentSchema = z.object({
    receiverPhone: z.string().length(10),
    amount: z.number().positive(),
    pin: z.string().length(4),
    totpCode: z.string().optional(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number()
    }).optional()
});

/**
 * Process a payment from sender to receiver
 * @route POST /api/transactions/pay
 */
export const processPayment = async (req, res) => {
    const client = await pool.connect();

    try {
        const { receiverPhone, amount, pin, totpCode, location } = paymentSchema.parse(req.body);
        const senderId = req.user.userId;

        // Start Transaction
        await client.query('BEGIN');

        // 1. Fetch SENDER (with PIN & TOTP secret) and SENDER's Account - LOCKING
        const senderResult = await client.query(
            `SELECT u.id as user_id, u.name, u.phone, u.security_pin_hash, u.totp_secret,
                    a.id as account_id, a.balance, a.account_number
             FROM users u
             JOIN accounts a ON u.id = a.user_id
             WHERE u.id = $1
             FOR UPDATE OF a`,
            [senderId]
        );

        if (senderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Sender account not found' });
        }

        const sender = senderResult.rows[0];

        // 2. Fetch RECEIVER's Account by phone - LOCKING
        const receiverResult = await client.query(
            `SELECT u.id as user_id, u.name, u.phone,
                    a.id as account_id, a.balance, a.account_number
             FROM users u
             JOIN accounts a ON u.id = a.user_id
             WHERE u.phone = $1
             FOR UPDATE OF a`,
            [receiverPhone]
        );

        if (receiverResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const receiver = receiverResult.rows[0];

        // Prevent self-transfer
        if (sender.user_id === receiver.user_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Cannot transfer to yourself' });
        }

        // 3. Validate PIN
        const isPinValid = await bcrypt.compare(pin, sender.security_pin_hash);
        if (!isPinValid) {
            await client.query('ROLLBACK');
            return res.status(401).json({ message: 'Invalid PIN' });
        }

        // 4. Check Sender Balance
        if (parseFloat(sender.balance) < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // 5. Determine Security Requirement (Safe Zone Check)
        let requireTotp = true;

        if (location) {
            const safeZonesResult = await client.query(
                'SELECT * FROM safe_zones WHERE user_id = $1 AND is_active = true',
                [senderId]
            );

            for (const zone of safeZonesResult.rows) {
                const distance = getDistance(location, { latitude: zone.latitude, longitude: zone.longitude });
                if (distance <= zone.radius) {
                    requireTotp = false;
                    break;
                }
            }
        }

        // 6. Verify TOTP if required
        if (requireTotp) {
            if (!sender.totp_secret) {
                await client.query('ROLLBACK');
                return res.status(403).json({
                    message: 'TOTP not configured. Please set up Google Authenticator in your Profile.',
                    requireTotpSetup: true
                });
            }

            if (!totpCode) {
                await client.query('ROLLBACK');
                return res.status(403).json({ message: 'TOTP verification required', requireTotp: true });
            }

            const isTotpValid = verifyTOTP(totpCode, sender.totp_secret);
            if (!isTotpValid) {
                await client.query('ROLLBACK');
                return res.status(401).json({ message: 'Invalid TOTP code' });
            }
        }

        // 7. Execute Transfer
        const senderNewBalance = parseFloat(sender.balance) - amount;
        const receiverNewBalance = parseFloat(receiver.balance) + amount;

        // Update sender balance
        await client.query(
            'UPDATE accounts SET balance = $1 WHERE id = $2',
            [senderNewBalance, sender.account_id]
        );

        // Update receiver balance
        await client.query(
            'UPDATE accounts SET balance = $1 WHERE id = $2',
            [receiverNewBalance, receiver.account_id]
        );

        // 8. Record Transactions for both parties
        const description = `Transfer to ${receiver.name} (${receiver.phone})`;
        const receiverDescription = `Transfer from ${sender.name} (${sender.phone})`;

        // Sender's transaction (debit)
        await client.query(
            `INSERT INTO transactions (account_id, amount, transaction_type, description, status, balance_after)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [sender.account_id, -amount, 'debit', description, 'completed', senderNewBalance]
        );

        // Receiver's transaction (credit)
        await client.query(
            `INSERT INTO transactions (account_id, amount, transaction_type, description, status, balance_after)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [receiver.account_id, amount, 'credit', receiverDescription, 'completed', receiverNewBalance]
        );

        // Commit Transaction
        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Payment successful',
            transfer: {
                to: receiver.name,
                toPhone: receiver.phone,
                amount,
                newBalance: senderNewBalance
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Payment processing error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid data', errors: error.errors });
        }
        res.status(500).json({ message: 'Transaction failed', error: error.message });
    } finally {
        client.release();
    }
};
