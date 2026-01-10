import { pool } from '../db.js';
import jwt from 'jsonwebtoken';
import { generateTOTPSecret, verifyTOTP } from '../utils/totp.js';

/**
 * Get user profile
 * @route GET /api/profile
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            'SELECT id, name, phone, totp_enabled, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            name: user.name,
            phone: user.phone,
            totpEnabled: user.totp_enabled || false,
            createdAt: user.created_at
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Generate TOTP setup for user (or regenerate if needed)
 * @route GET /api/profile/totp/setup
 */
export const getTotpSetup = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get user info
        const userResult = await pool.query(
            'SELECT name, totp_enabled FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // If TOTP is already enabled, don't allow re-setup
        if (user.totp_enabled) {
            return res.status(400).json({
                message: 'TOTP is already enabled. Disable it first to regenerate.',
                totpEnabled: true
            });
        }

        // Generate new TOTP secret
        const { secret, qrCodeUrl, otpauthUrl } = await generateTOTPSecret(user.name);

        // Store secret (not yet enabled)
        await pool.query(
            'UPDATE users SET totp_secret = $1 WHERE id = $2',
            [secret, userId]
        );

        res.json({
            qrCodeUrl,
            otpauthUrl,
            message: 'Scan this QR code with your authenticator app, then verify with a code'
        });
    } catch (error) {
        console.error('TOTP setup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Verify TOTP and enable it for user
 * @route POST /api/profile/totp/verify
 */
export const verifyAndEnableTotp = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { totpCode } = req.body;

        if (!totpCode || totpCode.length !== 6) {
            return res.status(400).json({ message: 'Invalid TOTP code format' });
        }

        // Get user's TOTP secret
        const userResult = await pool.query(
            'SELECT totp_secret, totp_enabled FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        if (!user.totp_secret) {
            return res.status(400).json({ message: 'No TOTP secret found. Please set up TOTP first.' });
        }

        // Verify the code
        const isValid = verifyTOTP(totpCode, user.totp_secret);

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid TOTP code' });
        }

        // Enable TOTP
        await pool.query(
            'UPDATE users SET totp_enabled = true WHERE id = $1',
            [userId]
        );

        res.json({
            success: true,
            message: 'TOTP enabled successfully',
            totpEnabled: true
        });
    } catch (error) {
        console.error('TOTP verify error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
