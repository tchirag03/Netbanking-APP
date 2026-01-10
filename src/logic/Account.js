import { pool } from '../db.js';

/**
 * Get user's account details
 * @route GET /api/account
 */
export const getAccount = async (req, res) => {
    try {
        const userId = req.user.userId; // From JWT middleware

        // Get user's account from accounts table
        const accountResult = await pool.query(
            'SELECT * FROM accounts WHERE user_id = $1 LIMIT 1',
            [userId]
        );

        if (accountResult.rows.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const account = accountResult.rows[0];

        res.status(200).json({
            id: account.id.toString(),
            balance: parseFloat(account.balance),
            accountNumber: account.account_number,
            accountType: account.account_type
        });
    } catch (error) {
        console.error('Error fetching account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
