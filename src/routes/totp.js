import express from 'express';
import { generateTOTPSecret, verifyTOTP } from '../utils/totp.js';

const router = express.Router();

/**
 * POST /api/totp/generate
 * Generate TOTP secret and QR code for user
 * Request body: { name: string }
 */
router.post('/generate', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const totpData = await generateTOTPSecret(name, 'NetBank');

        res.status(200).json({
            success: true,
            secret: totpData.secret,
            qrCodeUrl: totpData.qrCodeUrl,
            otpauthUrl: totpData.otpauthUrl,
        });
    } catch (error) {
        console.error('Generate TOTP error:', error);
        res.status(500).json({ error: 'Failed to generate TOTP secret' });
    }
});

/**
 * POST /api/totp/verify
 * Verify TOTP token
 * Request body: { token: string, secret: string }
 */
router.post('/verify', async (req, res) => {
    try {
        const { token, secret } = req.body;

        if (!token || !secret) {
            return res.status(400).json({ error: 'Token and secret are required' });
        }

        const isValid = verifyTOTP(token, secret);

        if (isValid) {
            res.status(200).json({
                success: true,
                message: 'TOTP verified successfully',
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Invalid TOTP token',
            });
        }
    } catch (error) {
        console.error('Verify TOTP error:', error);
        res.status(500).json({ error: 'Failed to verify TOTP' });
    }
});

export default router;
